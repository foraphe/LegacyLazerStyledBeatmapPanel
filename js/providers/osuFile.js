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
                bpm: this.getBPM(content.timings),
                length: -1,
                drain: -1,
                mods: -1,
                bgPath: '',
            },
            original: JSON.parse(JSON.stringify(content))
        };

        if (DEBUG)
            console.log(
                `[osuFileParser] Parsed Beamap:\n${JSON.stringify(bm)}`
            );

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
        tmp.Bookmarks = tmp.Bookmarks.split(',');

        return tmp;
    },

    readLine: function (line, tmp) {
        line = line || '';
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

    getBPM: function (timings) {
        let bpm = {
            min: 2e9,
            max: -1,
            avg: -1,
        };

        for (let i of timings) {
            if (i[1] > '0') {
                let currentBPM = utils.roundNumber(60000 / Number(i[1]), 2);
                if (currentBPM < bpm.min) bpm.min = currentBPM;
                if (currentBPM > bpm.max) bpm.max = currentBPM;
            }
        }
        if (bpm.min == 2e9) bpm.min = -1;
        return bpm;
    },

    getDrainTime: function () {
        //TODO: compute drain time (last note - first note) - break times
    },

    read: async function (addr) {
        let data = await fetch(addr);
        return this.toBeatmap(this.parseFile(await data.text()));
    },
};
