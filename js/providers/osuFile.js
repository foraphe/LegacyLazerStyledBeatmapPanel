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

    getTotalTime: function (content) {
        let first = Number(content.objs[0][2]) || 0, last = Number(content.objs[content.objs.length - 1][2]);
        if (DEBUG) console.log(`[osuFileParser] hit objects begin at ${first}, end at ${last}, total time ${last - first}`);
        return last - first;
    },

    getDrainTime: function (content) {
        let breakLength = 0;
        for (let line of content.events) {
            if (line[0] == '2' || line[0].toLowerCase == 'break') {
                breakLength += Number(line[2]) - Number(line[1]);
            }
        }
        if (DEBUG) console.log(`[osuFileParser] total break time length: ${breakLength}`)

        return this.getTotalTime(content) - breakLength;
    },

    read: async function (addr) {
        if (DEBUG) console.log(`[osuFileParser] reading ${addr}`);

        let data = await fetch(addr);
        return this.toBeatmap(await this.parseFile(await data.text()));
    },
};
