let config = {
    USE_FULLSCREEN_BG: true,
    FULLSCREEN_BACKGROUND_DIM: 0.25,
    EXPANDED: true,
    API_KEY: ''
}

let flagMapChanged = false;
let flagModChanged = false;

config.API_KEY = utils.getQueryString('apikey') || '';
if (utils.getQueryString('bgSwitch') == 0) {
    config.USE_FULLSCREEN_BG = false;
}
if (utils.getQueryString('bgDim') != undefined) {
    config.FULLSCREEN_BACKGROUND_DIM = Number(utils.getQueryString('bgDim'));
}
if (utils.getQueryString('expanded') == 0) {
    config.EXPANDED = false;
}

const DEBUG = false;

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

//TODO: move object definitions out of index.js
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
    }
    this.difficulty = {
        ar: 0,
        od: 0,
        cs: 0,
        hp: 0,
        sr: 0
    }
    this.beatmap=  {
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
    }

}

function Ticker(interval){
    this.run = function(){
        return setInterval(this.doTick, interval);
    }
    this.doTick = function(){
        if (flagMapChanged || flagModChanged) {
            flagMapChanged = false;
            flagModChanged = false;
            api.update(live.metadata.bid, live.beatmap.mods)
                .then(res => {
                    if(res.metadata.bid != live.metadata.bid)return;
                    elementSR.innerText = `${res.difficulty.sr} (${live.difficulty.sr} local)`;
                    elementLength.innerText = `${utils.formatTime(liveModified.beatmap.length)} (${utils.formatTime(res.beatmap.drain)} drain)`;
                    if(live.beatmap.bpm.min != live.beatmap.bpm.max) {
                        elementBPM.innerText = `${live.beatmap.bpm.min}~${live.beatmap.bpm.max} (${res.beatmap.bpm.avg})`;
                    }
                })
                .then(err =>{
                    if(err)console.log(`[api]error: ${err}`);
                })
        }
    }
}

let live = new Beatmap();
let liveModified = new Beatmap();
let ticker = new Ticker(100);

//TODO: put the styles into appropriate css entries and update classList instead
if (!config.EXPANDED) {
    document.getElementById('outerPanel').style = 'width:25vw;left:37.5vw;';
    document.getElementById('innerPanel').style = 'width:25vw;left:0;';
    document.getElementById('dataBeatmapInfo').style = 'width:25vw;left:0;border:0.125vh solid white';
    document.getElementById('coverBeatmapInfo').style = 'width:25vw;left:0;';
    document.getElementsByClassName('left')[0].style = 'display:none;';
    document.getElementsByClassName('right')[0].style = 'display:none;';
    document.getElementById('osuLogo').style = 'display:none;';
}

api.init();
gosumemoryUpdater.run();
const tickrunner = ticker.run(100);