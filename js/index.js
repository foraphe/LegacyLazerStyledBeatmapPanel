let socket = new ReconnectingWebSocket("ws://" + location.host + "/ws");

socket.onclose = event => {
    console.log("Socket Closed Connection: ", event);
    socket.send("Client Closed!");
};

socket.onerror = error => console.log("Socket Error: ", error);

let DEBUG = false;

let elementAR = document.getElementById('dataAr');
let elementOD = document.getElementById('dataOd');
let elementCS = document.getElementById('dataCs');
let elementBPM = document.getElementById('dataBpm');
let elementMapper = document.getElementById('dataMapper');
let elementDiff = document.getElementById('dataDifficulty');
let elementLength = document.getElementById('dataLength');
let elementBG = document.getElementById('dataBeatmapInfo');
let body = document.body;
let elementSR = document.getElementById('dataSr');
let elementBM = document.getElementById('dataBeatmap');

let ar = 0,
    od = 0,
    cs = 0,
    bpm = [0, 0],
    mapper = null,
    diff = null,
    length = 0,
    bg = null,
    sr = 0,
    bm = null;

socket.onmessage = event => {
    let data = JSON.parse(event.data);
    if (data.menu.gameMode !== 0) return;
    if (data.menu.bm.stats.AR != ar) {
        ar = data.menu.bm.stats.AR;
        elementAR.innerText = data.menu.bm.stats.AR == data.menu.bm.stats.memoryAR ? data.menu.bm.stats.AR : `${data.menu.bm.stats.AR}*`;
    }
    if (data.menu.bm.stats.OD != od) {
        od = data.menu.bm.stats.OD;
        elementOD.innerText = data.menu.bm.stats.OD == data.menu.bm.stats.memoryOD ? data.menu.bm.stats.OD : `${data.menu.bm.stats.OD}*`;
    }
    if (data.menu.bm.stats.CS != cs) {
        cs = data.menu.bm.stats.CS;
        elementCS.innerText = data.menu.bm.stats.CS == data.menu.bm.stats.memoryCS ? data.menu.bm.stats.CS : `${data.menu.bm.stats.CS}*`;
    }
    if (data.menu.bm.stats.BPM.min != bpm[0] || data.menu.bm.stats.BPM.max != bpm[1]) {
        bpm[0] = data.menu.bm.stats.BPM.min;
        bpm[1] = data.menu.bm.stats.BPM.max;
        elementBPM.innerText = data.menu.bm.stats.BPM.min == data.menu.bm.stats.BPM.max ? data.menu.bm.stats.BPM.min : `${data.menu.bm.stats.BPM.min}~${data.menu.bm.stats.BPM.max}`;
    }
    if (data.menu.bm.stats.fullSR != sr) {
        sr = data.menu.bm.stats.fullSR;
        elementSR.innerText = data.menu.bm.stats.fullSR
    }
    if (data.menu.bm.metadata.mapper != mapper) {
        mapper = data.menu.bm.metadata.mapper
        elementMapper.innerText = data.menu.bm.metadata.mapper;
    }
    if (data.menu.bm.time.mp3 != length) {
        length = data.menu.bm.time.mp3;
        elementLength.innerText = formatTime(data.menu.bm.time.mp3);
    }
    if (data.menu.bm.metadata.difficulty != diff) {
        diff = data.menu.bm.metadata.difficulty;
        elementDiff.innerText = data.menu.bm.metadata.difficulty;
    }
    if (data.menu.bm.path.full != bg) {
        bg = data.menu.bm.path.full;
        let img = data.menu.bm.path.full;
        //Several characters are not escaped by encodeURIComponent
        let url = `http://${location.host}/Songs/${encodeURIComponent(img.replace(/\\/g,'/'))}`
            .replace(/-/g, "%2D")
            .replace(/_/g, "%5F")
            .replace(/\./g, "%2E")
            .replace(/!/g, "%21")
            .replace(/~/g, "%7E")
            .replace(/\'/g, "%27")
            .replace(/\(/g, "%28")
            .replace(/\)/g, "%29");
        elementBG.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.5),rgba(0, 0, 0, 0.5)),url(${url})`;
        body.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.25),rgba(0, 0, 0, 0.25)),url(${url})`;
    }
    if (data.menu.bm.metadata != bm) {
        bm = data.menu.bm.metadata;
        elementBM.innerText = `${bm.artist} - ${bm.title}`;
    }
}

let formatTime = function(rawvalue) { //convert time in ms to hr:min:sec format
    rawvalue = Math.round(rawvalue / 1000);
    let hr = 0,
        min = 0,
        sec = 0;
    hr = parseInt(rawvalue / 3600);
    min = parseInt((rawvalue - hr * 3600) / 60);
    sec = rawvalue - hr * 3600 - min * 60;
    return hr > 0 ? `${hr}:${min}:${sec}` : `${min}:${sec}`;
}