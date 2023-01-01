const utils = new Object({
    roundNumber: function (num, d) {
        const mul = Number(num) * Math.pow(10, d);
        return Math.round(mul) / Math.pow(10, d);
    },

    getQueryString: function (param) {
        const url_string = decodeURI(window.location.href);
        const url = new URL(url_string);
        return url.searchParams.get(param);
    },

    formatTime: function (rawvalue) { //convert time in ms to hr:min:sec format
        rawvalue = Math.round(rawvalue / 1000);
        let hr = 0,
            min = 0,
            sec = 0;
        hr = parseInt(rawvalue / 3600).toString().padStart(2, '0');
        min = parseInt((rawvalue - hr * 3600) / 60).toString().padStart(2, '0');
        sec = (rawvalue - hr * 3600 - min * 60).toString().padStart(2, '0');
        return hr > 0 ? `${hr}:${min}:${sec}` : `${min}:${sec}`;
    },

    resetAnimation: function (element, className) { //reset css animation <className> on <element>
        element.classList.remove(className);
        element.offsetHeight;
        element.classList.add(className);
    },

    timeModifier: function (mods) {
        let timeModifier = 1;
        if (Number(mods) & 64) timeModifier = 1.5;
        if (Number(mods) & 256) timeModifier = 0.75;
        return timeModifier;
    },

    getModdedTime: function (time, mods) {
        return Number(time) / this.timeModifier(mods);
    },

    updateBgAsync: function (path) {
        //Several characters are not escaped by encodeURIComponent
        let url = `http://${location.host}/Songs/${encodeURIComponent(path.replace(/\\/g, '/'))}`
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
            this.resetAnimation(elementBGCover, 'transit');
            if (config.USE_FULLSCREEN_BG) {
                body.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, ${config.FULLSCREEN_BACKGROUND_DIM}),rgba(0, 0, 0, ${config.FULLSCREEN_BACKGROUND_DIM})),url(${url})`;
            } else {
                body.style.backgroundImage = 'none';
                body.style.backgroundColor = 'rgba(255, 255, 255, 0)';
            }
        });
        image.src = url;
    },

    odToWindow: function (mode, od) {
        od = Number(od);
        let window300 = -1;
        switch (Number(mode)) {
            case 0:
                window300 = 80 - 6 * od;
                break;
            case 1:
                window300 = 50 - 3 * od;
                break;
            case 3:
                window300 = 64 - 3 * od;
                break;
            default:
                break;
        }
        return window300;
    },

    windowToOd: function (mode, window) {
        window = Number(window);
        let od = -1;
        switch (Number(mode)) {
            case 0:
                od = (80 - window) / 6;
                break;
            case 1:
                od = (50 - window) / 3
                break;
            case 3:
                od = (64 - window) / 3;
                break;
            default:
                break;
        }
        return od;
    },

    calcModdedOd: function (mods, mode, od) {
        //https://osu.ppy.sh/wiki/en/Beatmap/Overall_difficulty
        od = Number(od);
        mods = Number(mods);
        if (mode == 2) return -1; //in CTB, OD is not used and doesn't have a formula in osu! wiki, so TODO here.

        //calculate the effect of HR/EZ
        if (mods & 16) od = od * 1.4;
        if (mods & 2) od = od / 2;
        if (od > 10) od = 10;

        //calculate the effect of DT/HT
        let window300 = this.odToWindow(mode, od);
        let timeModifier = this.timeModifier(mods);
        window300 = window300 / timeModifier;
        let newod = this.windowToOd(mode, window300);

        return this.roundNumber(newod, 2)
    },

    calcModdedAr: function (mods, mode, ar) {
        //https://osu.ppy.sh/wiki/en/Beatmap/Approach_rate
        ar = Number(ar);
        mods = Number(mods);
        if (mode == 1 || mode == 3) return -1; //AR only presents in STD and CTB

        //calculate the effect of HR/EZ
        if (mods & 16) ar = ar * 1.4;
        if (mods & 2) ar = ar / 2;
        if (ar > 10) ar = 10;

        //calculate the effect of DT/HT
        let preempt = -1;
        if (ar <= 5) {
            preempt = 1800 - 120 * ar;
        }
        else {
            preempt = 1950 - 150 * ar;
        }
        let timeModifier = this.timeModifier(mods);
        preempt = preempt / timeModifier;
        let newar = -1;
        if (preempt >= 1200) {
            newar = (1800 - preempt) / 120;
        }
        else {
            newar = (1950 - preempt) / 150;
        }

        return this.roundNumber(newar, 2);
    }
});
