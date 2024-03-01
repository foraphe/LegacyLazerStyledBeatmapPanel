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
    oldExpanded = config.EXPANDED;
    this.run = function () {
        return setInterval(this.doTick, interval);
    }
    this.doTick = function () {
        if (config.EXPANDED != oldExpanded) {
            oldExpanded = config.EXPANDED;
            if (config.EXPANDED) {
                document.getElementById('outerPanel').classList.replace('outerPanel-retracted', 'outerPanel-expanded');
                document.getElementById('innerPanel').classList.replace('innerPanel-retracted', 'innerPanel-expanded');
                document.getElementById('dataBeatmapInfo').classList.replace('dataBeatmapInfo-retracted', 'dataBeatmapInfo-expanded');
                document.getElementById('coverBeatmapInfo').classList.replace('coverBeatmapInfo-retracted', 'coverBeatmapInfo-expanded');
                document.getElementsByClassName('left')[0].classList.replace('hidden', 'display');
                document.getElementsByClassName('right')[0].classList.replace('hidden', 'display');
                document.getElementById('osuLogo').classList.replace('hidden', 'display');

            }
            else {
                document.getElementById('outerPanel').classList.replace('outerPanel-expanded', 'outerPanel-retracted');
                document.getElementById('innerPanel').classList.replace('innerPanel-expanded', 'innerPanel-retracted');
                document.getElementById('dataBeatmapInfo').classList.replace('dataBeatmapInfo-expanded', 'dataBeatmapInfo-retracted');
                document.getElementById('coverBeatmapInfo').classList.replace('coverBeatmapInfo-expanded', 'coverBeatmapInfo-retracted');
                document.getElementsByClassName('left')[0].classList.replace('display', 'hidden');
                document.getElementsByClassName('right')[0].classList.replace('display', 'hidden');
                document.getElementById('osuLogo').classList.replace('display', 'hidden');
            }
        }
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
                // TODO. Occasionally when .osu file is browser-cached, these values don't display and won't cause thrown errors either, so adding a delay here
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
                                                // TODO. liveModified should have actual mod enum, like live do, but it doesn't, temporary fix for modded drain time here.
                                                elementLength.innerText = `${utils.formatTime(liveModified.beatmap.length)} (${utils.formatTime(utils.getModdedTime(res.beatmap.drain, live.beatmap.mods))} drain)`;
                                            }
                                        });
                                    if (DEBUG) console.log(`[SRCalculator] read ${text.length} bytes, calculating with mod enum ${live.beatmap.mods}`);
                                    text = text.trim();
                                    let u8arr = new TextEncoder().encode(text);
                                    let sr = calculate_sr(u8arr, live.beatmap.mods);
                                    if (DEBUG) console.log(`[SRCalculator] SR calculated: ${sr}`);
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
