const API_KEY = '';

async function getStarRating(bid, mods) {
    mods = Number(mods) || 0;

    //TODO: api v1 sometimes return a star rating of 0, some investigation will be needed to fix the issue.

    let p = new Promise((resolve, reject) => {
        if (!API_KEY) reject('no api key is given');
        const req = new XMLHttpRequest();

        req.onreadystatechange = function() {
            if (this.readyState != 4) return;
            if (this.status != 200) reject('request failed');
            let res = JSON.parse(this.responseText);
            console.log(res);
            if (!res || !res[0]) reject('received no data');
            resolve(res[0]);
        };

        req.open('GET',
            `https://osu.ppy.sh/api/get_beatmaps?k=${API_KEY}&b=${bid}&m=0&mods=${mods}`);
        req.send();
    });

    return p;
}