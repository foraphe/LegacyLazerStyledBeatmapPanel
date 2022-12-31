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

    getModdedTime: function (time, mods) {
        return Number(time) / this.timeModifier(mods);
    },

    timeModifier: function(mods) {
        let timeModifier = 1;
        if (Number(mods) & 64) timeModifier = 1.5;
        if (Number(mods) & 256) timeModifier = 0.75;
        return timeModifier;
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
    }
});

