let config = {
    USE_FULLSCREEN_BG: true,
    FULLSCREEN_BACKGROUND_DIM: 0.25,
    EXPANDED: true,
    API_KEY: ''
}

const DEBUG = false;

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

if(DEBUG) console.log(`[main] configuration: ${JSON.stringify(config)}`);

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

let live = new Beatmap();
let liveModified = new Beatmap();
let ticker = new Ticker(100);

api.init();
gosumemoryUpdater.run();
const tickrunner = ticker.run(100);