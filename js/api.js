async function getStarRating(bid, mods, apikey) {
    mods = Number(mods) || 0;
    apikey = apikey || '';

    //Some mods will cause osu! api to return a SR of 0, so we only count SR-affcting mods here
    mods = (
        (mods & 2) +                     //Easy
        (mods & 16) +                    //HardRock
        (mods & 64) +                    //DoubleTime, NightCore will have this bit as well
        (mods & 256) +                   //HalfTime
        (mods & 1024) +                  //Flashlight
        ((mods & 1024) && (mods & 8))    //Flashlight with Hidden
    )

    let p = new Promise((resolve, reject) => {
        if (!API_KEY) reject('no api key is provided');
        const req = new XMLHttpRequest();

        req.onreadystatechange = function () {
            if (this.readyState != 4) return;
            if (this.status != 200) reject(`request failed with a status code of ${this.status}`);
            let res = JSON.parse(this.responseText);
            if (!res || !res[0]) reject('received no data for given beatmap');
            resolve(res[0]);
        };

        req.open('GET',
            `https://osu.ppy.sh/api/get_beatmaps?k=${apikey}&b=${bid}&m=0&mods=${mods}`);
        req.send();
    });

    return p;
}