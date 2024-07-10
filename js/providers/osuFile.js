let osuParser = {
    state: -1,
    states: [
        'general',
        'editor',
        'metadata',
        'difficulty',
        'events',
        'timingpoints',
        'colours',
        'hitobjects',
    ],
    keyValReg: /^([a-zA-Z0-9]+)[ ]*:[ ]*(.+)$/,
    sectionReg: /^\[([0-9A-Za-z]+)\]$/,

    init: function () { },

    toBeatmap(content) {
        let bm = new Beatmap();
        bm = {
            difficulty: {
                ar: Number(content.ApproachRate) || -1,
                od: Number(content.OverallDifficulty) || -1,
                cs: Number(content.CircleSize) || -1,
                hp: Number(content.HPDrainRate) || -1,
                sr: -1,
            },
            metadata: {
                title: content.Title || '',
                artist: content.Artist || '',
                source: content.Source || '',
                tags: content.Tags || '',
                bid: Number(content.BeatmapID) || -1,
                sid: Number(content.BeatmapSetID) || -1,
                diff: content.Version || '',
                creator: content.Creator || '',
            },
            beatmap: {
                mode: content.Mode,
                bpm: this.getBPM(content.timings, Number(content.objs[0][2]), Number(content.objs[content.objs.length - 1][2])) || { min: -1, max: -1, avg: -1 },
                length: this.getTotalTime(content) || -1,
                drain: this.getDrainTime(content) || -1,
                mods: -1,
                bgPath: '',
            },
            original: JSON.parse(JSON.stringify(content))
        };

        if (DEBUG)
            console.log(`[osuFileParser] Parsed Beamap:\n${JSON.stringify(bm)}`);

        return bm;
    },

    parseFile: function (content) {
        let tmp = {
            timings: [],
            objs: [],
            events: [],
            colors: {},
        };
        content = content || '';

        content = content.split(/\r?\n/);

        content.forEach((line) => {
            if (line.substr(0, 2) == '//' || !line);
            else this.readLine(line, tmp);
        }, this);

        Object.keys(tmp.colors).map(
            (i) => (tmp.colors[i] = tmp.colors[i].split(','))
        );
        if (tmp.Bookmarks) tmp.Bookmarks = tmp.Bookmarks.split(',');

        return tmp;
    },

    readLine: function (line, tmp) {
        line = line || '';
        if (line.match(/osu file format v[0-9]+/)) return;

        let sectionMatch = line.match(this.sectionReg);
        if (sectionMatch) {
            this.updateState(sectionMatch[1]);
        }
        else {
            switch (this.state) {
                case 0: //These are all key-value pairs
                case 1:
                case 2:
                case 3:
                    let keyValPair = line.match(this.keyValReg);
                    if (keyValPair) {
                        tmp[keyValPair[1]] = keyValPair[2];
                    }
                    break;
                case 4:
                    let val = line.trim().split(',');
                    if (val) tmp.events.push(val);
                    break;
                case 5:
                    let timing = line.trim().split(',');
                    if (timing) tmp.timings.push(timing);
                    break;
                case 6:
                    let color = line.match(this.keyValReg);
                    if (color) {
                        tmp.colors[color[1]] = color[2];
                    }
                    break;
                case 7:
                    let hit = line.trim().split(',');
                    if (hit) tmp.objs.push(hit);
                    break;
            }
        }
    },

    updateState: function (section) {
        this.state = this.states.indexOf(section.toLowerCase());
    },

    getBPM(timings, begin, end) {
        let bpm = {
            min: 2e9,
            max: -1,
            mostly: -1,
        };

        let bpmList = {},
            lastBegin = 0, lastBPM = -1;

        for (let i of timings) {
            if (i[1] > '0') {
                if (lastBPM && lastBPM > 0) {
                    if (!bpmList[lastBPM]) bpmList[lastBPM] = 0;
                    bpmList[lastBPM] += Number(i[0]) - lastBegin;
                }
                let currentBPM = lastBPM = this.round(60000 / Number(i[1]), 2);
                if (currentBPM < bpm.min) bpm.min = currentBPM;
                if (currentBPM > bpm.max) bpm.max = currentBPM;
                lastBegin = Number(i[0]);
            }
        }
        if (lastBPM && lastBPM > 0) {
            if (!bpmList[lastBPM]) bpmList[lastBPM] = 0;
            bpmList[lastBPM] += end - lastBegin;
        }
        if (bpm.min == 2e9) bpm.min = -1;
        if (bpm.max === bpm.min) {
            bpm.mostly = bpm.max;
        }
        else {
            bpm.mostly = Number(Object.keys(bpmList).reduce((a, b) => bpmList[a] > bpmList[b] ? a : b));
        }
        return bpm;
    },

    lastObjectIsSpinner: function (content) {
        return (content.objs[content.objs.length - 1][3] & 8) == 8;
    },

    getTotalTime: function (content) {
        // If the last hit object is a spinner, its length will be included in in-game length but not length displayed on osu! website. 
        // If it's a slider, its length won't be included at both places.
        // I decide it's better to be coherent with in-game length.
        let first = Number(content.timings[0][0]) || 0, last = this.lastObjectIsSpinner(content) ? Number(content.objs[content.objs.length - 1][5]) : Number(content.objs[content.objs.length - 1][2]);
        if (DEBUG) console.log(`[osuFileParser] Timing point begin at ${first}, hit objects end at ${last}, isSpinner=${this.lastObjectIsSpinner(content)}, total time ${last}`);
        return last;
    },

    getDrainTime: function (content) {
        let breakLength = 0;
        for (let line of content.events) {
            if (line[0] == '2' || line[0].toLowerCase() == 'break') {
                breakLength += Number(line[2]) - Number(line[1]);
            }
        }
        // For drain time, the begin time of the last hit object is used regardless of its type.
        // Due to the inconsistency explained above, drain time becomes a little complicated.
        let spinnerLengthIfLastObjectIsSpinner = this.lastObjectIsSpinner(content) ? Number(content.objs[content.objs.length - 1][5]) - Number(content.objs[content.objs.length - 1][2]) : 0;

        if (DEBUG) console.log(`[osuFileParser] total break time length: ${breakLength}, last spinner length: ${spinnerLengthIfLastObjectIsSpinner}`);

        return this.getTotalTime(content) - breakLength - Number(content.objs[0][2]) - spinnerLengthIfLastObjectIsSpinner;
    },

    read: async function (addr) {
        if (DEBUG) console.log(`[osuFileParser] reading ${addr}`);

        let data = await fetch(addr);
        return this.toBeatmap(await this.parseFile(await data.text()));
    },
};
