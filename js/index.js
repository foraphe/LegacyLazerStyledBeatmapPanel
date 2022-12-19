let USE_FULLSCREEN_BG = true,
    FULLSCREEN_BACKGROUND_DIM = 0.25,
    EXPANDED = true,
    oldExpanded = true;

function formatTime(rawvalue) { //convert time in ms to hr:min:sec format
    rawvalue = Math.round(rawvalue / 1000);
    let hr = 0,
        min = 0,
        sec = 0;
    hr = parseInt(rawvalue / 3600).toString().padStart(2, '0');
    min = parseInt((rawvalue - hr * 3600) / 60).toString().padStart(2, '0');
    sec = (rawvalue - hr * 3600 - min * 60).toString().padStart(2, '0');
    return hr > 0 ? `${hr}:${min}:${sec}` : `${min}:${sec}`;
}

function resetAnimation(element, className) { //reset css animation <className> on <element>
    element.classList.remove(className);
    element.offsetHeight;
    element.classList.add(className);
}

function getQueryString(param) {
    const url_string = decodeURI(window.location.href);
    const url = new URL(url_string);
    return url.searchParams.get(param);
}

function roundNumber(num, d) {
    const mul = num * Math.pow(10, d);
    return Math.round(mul) / Math.pow(10, d);
}

if (getQueryString('bgSwitch') == 0) {
    USE_FULLSCREEN_BG = false;
}
if (getQueryString('bgDim') != undefined) {
    FULLSCREEN_BACKGROUND_DIM = Number(getQueryString('bgDim'));
}

if (getQueryString('expanded') == 0) {
    EXPANDED = false;
    oldExpanded = false;
}

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
let elementBGCover = document.getElementById('coverBeatmapInfo');

let ar = 0,
    od = 0,
    cs = 0,
    bpm = [0, 0],
    mapper = null,
    diff = null,
    length = 0,
    bg = null,
    sr = 0,
    bm = [null, null],
    mods = 0,
    bid = 0;

if (!EXPANDED) { //Disable expanded elements
    document.getElementById('outerPanel').style = 'width:25vw;left:37.5vw;';
    document.getElementById('innerPanel').style = 'width:25vw;left:0;';
    document.getElementById('dataBeatmapInfo').style = 'width:25vw;left:0;border:0.125vh solid white';
    document.getElementById('coverBeatmapInfo').style = 'width:25vw;left:0;';
    document.getElementsByClassName('left')[0].style = 'display:none;';
    document.getElementsByClassName('right')[0].style = 'display:none;';
    document.getElementById('osuLogo').style = 'display:none;';
}

socket.onmessage = event => {
    let data = JSON.parse(event.data);
    if (data.menu.gameMode !== 0) return;

    if (oldExpanded != EXPANDED) {
        oldExpanded = EXPANDED;
        if (!EXPANDED) {
            document.getElementById('outerPanel').style = 'width:25vw;left:37.5vw;';
            document.getElementById('innerPanel').style = 'width:25vw;left:0;';
            document.getElementById('dataBeatmapInfo').style = 'width:25vw;left:0;border:0.125vh solid white';
            document.getElementById('coverBeatmapInfo').style = 'width:25vw;left:0;';
            document.getElementsByClassName('left')[0].style = 'display:none;';
            document.getElementsByClassName('right')[0].style = 'display:none;';
            document.getElementById('osuLogo').style = 'display:none;';
        } else {
            document.getElementById('outerPanel').style = '';
            document.getElementById('innerPanel').style = '';
            document.getElementById('dataBeatmapInfo').style = '';
            document.getElementById('coverBeatmapInfo').style = '';
            document.getElementsByClassName('left')[0].style = '';
            document.getElementsByClassName('right')[0].style = '';
            document.getElementById('osuLogo').style = '';
        }
    }

    if (data.menu.bm.metadata.artist != bm[0] || data.menu.bm.metadata.title != bm[1]) {
        bm[0] = data.menu.bm.metadata.artist;
        bm[1] = data.menu.bm.metadata.title;
        elementBM.innerText = `${bm[0]} - ${bm[1]}`;
    }
    if (data.menu.bm.metadata.difficulty != diff) {
        diff = data.menu.bm.metadata.difficulty;
        elementDiff.innerText = data.menu.bm.metadata.difficulty;
    }
    if (data.menu.bm.metadata.mapper != mapper) {
        mapper = data.menu.bm.metadata.mapper
        elementMapper.innerText = data.menu.bm.metadata.mapper;
    }
    if (data.menu.bm.path.full != bg) {
        bg = data.menu.bm.path.full;
        let img = data.menu.bm.path.full;
        //Several characters are not escaped by encodeURIComponent
        let url = `http://${location.host}/Songs/${encodeURIComponent(img.replace(/\\/g, '/'))}`
            .replace(/-/g, "%2D")
            .replace(/_/g, "%5F")
            .replace(/\./g, "%2E")
            .replace(/!/g, "%21")
            .replace(/~/g, "%7E")
            .replace(/\'/g, "%27")
            .replace(/\(/g, "%28")
            .replace(/\)/g, "%29");
        let image = new Image();
        image.addEventListener("load", () => {
            elementBG.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.5),rgba(0, 0, 0, 0.5)),url(${url})`;
            resetAnimation(elementBGCover, 'transit');
            if (USE_FULLSCREEN_BG) {
                body.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, ${FULLSCREEN_BACKGROUND_DIM}),rgba(0, 0, 0, ${FULLSCREEN_BACKGROUND_DIM})),url(${url})`;
            } else {
                body.style.backgroundImage = 'none';
                body.style.backgroundColor = 'rgba(255, 255, 255, 0)';
            }
        });
        image.src = url;
    }
    if (EXPANDED) {
        if (data.menu.bm.stats.AR != ar) {
            ar = data.menu.bm.stats.AR;
            elementAR.innerText = data.menu.bm.stats.AR == data.menu.bm.stats.memoryAR ? data.menu.bm.stats.AR : `${data.menu.bm.stats.AR}(${data.menu.bm.stats.memoryAR})`;
            resetAnimation(elementAR, 'open');
        }
        if (data.menu.bm.stats.OD != od) {
            od = data.menu.bm.stats.OD;
            elementOD.innerText = data.menu.bm.stats.OD == data.menu.bm.stats.memoryOD ? data.menu.bm.stats.OD : `${data.menu.bm.stats.OD}(${data.menu.bm.stats.memoryOD})`;
            resetAnimation(elementOD, 'open');
        }
        if (data.menu.bm.stats.CS != cs) {
            cs = data.menu.bm.stats.CS;
            elementCS.innerText = data.menu.bm.stats.CS == data.menu.bm.stats.memoryCS ? data.menu.bm.stats.CS : `${data.menu.bm.stats.CS}(${data.menu.bm.stats.memoryCS})`;
            resetAnimation(elementCS, 'open');
        }
        if (data.menu.bm.stats.BPM.min != bpm[0] || data.menu.bm.stats.BPM.max != bpm[1]) {
            bpm[0] = data.menu.bm.stats.BPM.min;
            bpm[1] = data.menu.bm.stats.BPM.max;
            elementBPM.innerText = data.menu.bm.stats.BPM.min == data.menu.bm.stats.BPM.max ? data.menu.bm.stats.BPM.min : `${data.menu.bm.stats.BPM.min}~${data.menu.bm.stats.BPM.max}`;
            resetAnimation(elementBPM, 'open');
        }
        if (data.menu.bm.stats.fullSR != sr) {
            bid = data.menu.bm.id;
            sr = data.menu.bm.stats.fullSR;
            getStarRating(data.menu.bm.id, data.menu.mods.num)
                .then(res => {
                    if (res.beatmap_id != bid) return;
                    elementSR.innerText = `${roundNumber(Number(res.difficultyrating), 2)} (${data.menu.bm.stats.fullSR} local)`
                })
                .then(err => {
                    return;
                })
            elementSR.innerText = data.menu.bm.stats.fullSR;
            resetAnimation(elementSR, 'open');
        }
        if (data.menu.bm.time.mp3 != length || data.menu.mods.num != mods) {
            mods = data.menu.mods.num;
            length = data.menu.bm.time.mp3;
            let timeModifier = 1;
            if (parseInt(data.menu.mods.num) & 64) timeModifier = 1.5;
            if (parseInt(data.menu.mods.num) & 256) timeModifier = 0.75;
            elementLength.innerText = formatTime(data.menu.bm.time.mp3 / timeModifier);
            resetAnimation(elementLength, 'open');
        }
    }
};