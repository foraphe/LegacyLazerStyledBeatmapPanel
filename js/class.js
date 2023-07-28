function Beatmap() {
    this.metadata = {
        title: '',
        artist: '',
        source: '',
        tags: [],
        bid: '',
        sid: '',
        diff: '',
        creator: ''
    };
    this.difficulty = {
        ar: 0,
        od: 0,
        cs: 0,
        hp: 0,
        sr: 0
    };
    this.beatmap = {
        mode: -1,
        bpm: {
            min: 0,
            max: 0,
            avg: 0
        },
        length: 0,
        drain: 0,
        mods: 0,
        bgPath: ''
    };
    this.original = {};
}

function Ticker(interval) {
    this.run = function () {
        return setInterval(this.doTick, interval);
    }
    this.doTick = function () {
        if (flagMapChanged || flagModChanged) {
            if (DEBUG) console.log(`[main] ${flagMapChanged ? 'map' : 'mod'} has changed!`);
            flagMapChanged = false;
            flagModChanged = false;
            if (config.API_KEY) {
                api.update(live.metadata.bid, live.beatmap.mods)
                    .then(res => {
                        if (res.metadata.bid != live.metadata.bid) return;
                        elementSR.innerText = `${res.difficulty.sr} (${live.difficulty.sr} local)`;
                        elementLength.innerText = `${utils.formatTime(liveModified.beatmap.length)} (${utils.formatTime(res.beatmap.drain)} drain)`;
                        if (live.beatmap.bpm.min != live.beatmap.bpm.max) {
                            elementBPM.innerText = `${live.beatmap.bpm.min}~${live.beatmap.bpm.max} (${res.beatmap.bpm.avg})`;
                        }
                    })
                    .then(err => {
                        if (err) console.log(`[api]error: ${err}`);
                    })
            }
            else {
                // Occasionally when .osu file is browser-cached, these values don't display and won't cause thrown errors either
                setTimeout(() => {
                    if (!wasmReady) return;

                    fetch(`http://${location.host}/Songs/${utils.escape(live.original.menu.bm.path.folder)}/${utils.escape(live.original.menu.bm.path.file)}`)
                        .then(resR => {
                            resR.text()
                                .then(text => {
                                    // Since rosu-pp doesn't provide Beatmap ID, delay bpm calculation to ensure not displaying old data
                                    osuParser.read(`http://${location.host}/Songs/${utils.escape(live.original.menu.bm.path.folder)}/${utils.escape(live.original.menu.bm.path.file)}`)
                                        .then((res) => {

                                            if (res.metadata.bid != live.metadata.bid) return;

                                            if (res.beatmap.bpm.min != res.beatmap.bpm.max) elementBPM.innerText = `${live.beatmap.bpm.min}~${live.beatmap.bpm.max} (${res.beatmap.bpm.avg})`;
                                            if (res.beatmap.drain) {
                                                elementLength.innerText = `${utils.formatTime(liveModified.beatmap.length)} (${utils.formatTime(res.beatmap.drain)} drain)`;
                                            }
                                        });
                                    if (DEBUG) console.log(`[SRCalculator]read ${text.length} bytes, calculating with mod enum ${live.beatmap.mods}`);
                                    text = text.trim();
                                    let u8arr = new TextEncoder().encode(text);
                                    let sr = calculate_sr(u8arr, live.beatmap.mods);
                                    if (sr > -1) {
                                        elementSR.innerText = `${utils.roundNumber(sr, 2)} (${live.difficulty.sr} local)`;
                                    }
                                });
                        });
                }, 500);
            }
        }
    }
}
