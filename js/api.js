async function getStarRating(bid, mods, apikey) {
    mods = Number(mods) || 0;
    apikey = apikey || '';

    //TODO: api v1 sometimes return a star rating of 0, some investigation will be needed to fix the issue.

    let p = new Promise((resolve, reject) => {
        if (!API_KEY) reject('no api key is provided');
        const req = new XMLHttpRequest();

        req.onreadystatechange = function() {
            if (this.readyState != 4) return;
            if (this.status != 200) reject(`request failed with a status code of ${this.status}`);
            let res = JSON.parse(this.responseText);
            console.log(res);
            if (!res || !res[0]) reject('received no data for given beatmap');
            resolve(res[0]);
        };

        req.open('GET',
            `https://osu.ppy.sh/api/get_beatmaps?k=${apikey}&b=${bid}&m=0&mods=${mods}`);
        req.send();
    });

    return p;
}