var api = new Object({
    apikey: '',
    init: function(){
        this.apikey = config.API_KEY;
        if(DEBUG) console.log(`[api]Using API key ${this.apikey}`);
    },
    update: async function (bid, mods) {
        mods = Number(mods) || 0;
    
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
            if (!this.apikey) reject('no api key is provided');
            const req = new XMLHttpRequest();
    
            req.onreadystatechange = function () {
                if (this.readyState != 4) return;
                if (this.status != 200) reject(`request failed with a status code of ${this.status}`);
                let res = JSON.parse(this.responseText);
                if (!res || !res[0]) reject('received no data for given beatmap');
                //TODO: explicitly define ret as a bmObject
                const ret = {
                    difficulty: {
                        ar: Number(res[0].diff_approach),
                        od: Number(res[0].diff_overall),
                        cs: Number(res[0].diff_size),
                        hp: Number(res[0].diff_drain),
                        sr: utils.roundNumber(res[0].difficultyrating, 2)
                    },
                    metadata: {
                        title: res[0].title,
                        artist: res[0].artist,
                        source: res[0].source,
                        tags: res[0].tags.split(' '),
                        bid: res[0].beatmap_id,
                        sid: res[0].beatmapset_id,
                        diff: res[0].version,
                        creator: res[0].creator
                    },
                    beatmap: {
                        mode: res[0].mode, 
                        bpm: {
                            min: -1,
                            max: -1,
                            avg: utils.roundNumber(Number(res[0].bpm) * utils.timeModifier(mods), 2)
                        },
                        length: -1,
                        drain: utils.getModdedTime(Number(res[0].hit_length) * 1000, mods),
                        mods: mods
                    }
                }
                resolve(ret);
            };
    
            req.open('GET',
                `https://osu.ppy.sh/api/get_beatmaps?k=${this.apikey}&b=${bid}&m=0&mods=${mods}`);
            req.send();
        });
    
        return p;
    }
})

