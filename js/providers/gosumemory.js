var gosumemoryUpdater = new Object({
    run: function () {
        let socket = new ReconnectingWebSocket("ws://" + location.host + "/ws");

        socket.onopen = () => console.log("Successfully Connected");

        socket.onclose = event => {
            console.log("Socket Closed Connection: ", event);
            socket.send("Client Closed!");
        };

        socket.onerror = error => console.log("Socket Error: ", error);

        socket.onmessage = event => {
            let data = JSON.parse(event.data);
            if (data.menu.gameMode !== 0) return;

            if (data.menu.bm.metadata.artist != live.metadata.artist || data.menu.bm.metadata.title != live.metadata.title) {
                live.metadata.title = data.menu.bm.metadata.title;
                live.metadata.artist = data.menu.bm.metadata.artist;
                elementBM.innerText = `${live.metadata.artist} - ${live.metadata.title}`;
            }
            if (data.menu.bm.metadata.difficulty != live.metadata.diff) {
                live.metadata.diff = data.menu.bm.metadata.difficulty;
                elementDiff.innerText = data.menu.bm.metadata.difficulty;
            }
            if (data.menu.bm.metadata.mapper != live.metadata.creator) {
                live.metadata.creator = data.menu.bm.metadata.mapper;
                elementMapper.innerText = data.menu.bm.metadata.mapper;
            }
            if (data.menu.bm.path.full != live.beatmap.bgPath) {
                live.beatmap.bgPath = data.menu.bm.path.full;
                utils.updateBgAsync(data.menu.bm.path.full);
            }
            if (config.EXPANDED) {
                if (data.menu.mods.num != live.beatmap.mods) {
                    flagModChanged = true;
                    live.beatmap.mods = data.menu.mods.num;
                }
                if (data.menu.bm.id != live.metadata.bid) {
                    flagMapChanged = true;
                    live.metadata.bid = data.menu.bm.id;
                }
                if (data.menu.bm.stats.AR != live.difficulty.ar) {
                    live.difficulty.ar = data.menu.bm.stats.AR;
                    elementAR.innerText = data.menu.bm.stats.AR == data.menu.bm.stats.memoryAR ? data.menu.bm.stats.AR : `${utils.roundNumber(data.menu.bm.stats.AR, 1)}[${data.menu.bm.stats.memoryAR}] `;
                    utils.resetAnimation(elementAR, 'open');
                }
                if (data.menu.bm.stats.OD != live.difficulty.od) {
                    live.difficulty.od = data.menu.bm.stats.OD;
                    elementOD.innerText = data.menu.bm.stats.OD == data.menu.bm.stats.memoryOD ? data.menu.bm.stats.OD : `${utils.roundNumber(data.menu.bm.stats.OD, 1)}[${data.menu.bm.stats.memoryOD}] `;
                    utils.resetAnimation(elementOD, 'open');
                }
                if (data.menu.bm.stats.CS != live.difficulty.cs) {
                    live.difficulty.cs = data.menu.bm.stats.CS;
                    elementCS.innerText = data.menu.bm.stats.CS == data.menu.bm.stats.memoryCS ? data.menu.bm.stats.CS : `${utils.roundNumber(data.menu.bm.stats.CS, 1)}[${data.menu.bm.stats.memoryCS}] `;
                    utils.resetAnimation(elementCS, 'open');
                }
                if (data.menu.bm.stats.HP != live.difficulty.hp) {
                    live.difficulty.hp = data.menu.bm.stats.HP;
                }
                if (data.menu.bm.stats.BPM.min != live.beatmap.bpm.min || data.menu.bm.stats.BPM.max != live.beatmap.bpm.max) {
                    live.beatmap.bpm.min = data.menu.bm.stats.BPM.min;
                    live.beatmap.bpm.max = data.menu.bm.stats.BPM.max;
                    elementBPM.innerText = data.menu.bm.stats.BPM.min == data.menu.bm.stats.BPM.max ? data.menu.bm.stats.BPM.min : `${data.menu.bm.stats.BPM.min}~${data.menu.bm.stats.BPM.max}`;
                    utils.resetAnimation(elementBPM, 'open');
                }
                if (data.menu.bm.stats.fullSR != live.difficulty.sr || flagModChanged) {
                    live.difficulty.sr = data.menu.bm.stats.fullSR;
                    elementSR.innerText = data.menu.bm.stats.fullSR;
                    utils.resetAnimation(elementSR, 'open');
                }
                if (data.menu.bm.time.mp3 != live.beatmap.length || flagModChanged) {
                    live.beatmap.length = data.menu.bm.time.mp3;
                    elementLength.innerText = utils.formatTime(utils.getModdedTime(data.menu.bm.time.mp3));
                    utils.resetAnimation(elementLength, 'open');
                }
            }
        };
    }
})