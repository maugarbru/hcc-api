const axios = require('axios')
const moment = require('moment')
let acquiredToken = null
let gamesRoutes = []
let gamesInfo = []

async function getGamesDetails(games) {
    let token = await getAccessToken()
    let info = []
    let promises = []
    console.log(`Getting games details...`);
    if (gamesRoutes.length == 0 || gamesValidation(games)) {
        for (let index = 0; index < games.length; index++) {
            let game = games[index]
            let game_name = game.split('.')[0].replace(/[^\w\s]/gi, '')
            // console.log(`Getting details for GAME=${game_name} ...`);
            promises.push(axios({
                method: 'post',
                headers: {
                    "Client-ID": process.env.CLIENT_ID,
                    "Authorization": `Bearer ${token}`,
                    'Content-Type': 'text/plain',
                },
                url: "https://api.igdb.com/v4/games",
                data: `fields id,cover.image_id,first_release_date,genres.name,name,summary,artworks.image_id,rating,rating_count; search "${game_name}"; limit 3;`
            }))
        }
        try {
            await Promise.allSettled(promises).then(async function (values) {
                for (let index = 0; index < values.length; index++) {
                    if (values[index].value) {
                        let element = values[index].value.data.sort(function (a, b) {
                            if (!a.rating_count) {
                                return b.rating_count
                            } else if (!b.rating_count) {
                                return 0 - a.rating_count
                            } else {
                                return b.rating_count - a.rating_count
                            }
                        })[0];
                        if (element) {
                            element.rating = parseFloat((element.rating / 10).toFixed(1))
                            let game = {
                                path: games[index],
                                info: element
                            }
                            info.push(game)
                        }
                    }
                }
            });
            console.log(`...OK Game details`);
            gamesInfo = info
            gamesRoutes = games
            return info
        } catch (error) {
            console.log(`...ERROR getting Game details`);
            console.log(error);
            return []
        }
    } else {
        console.log(`...OK Game details loaded from memory`);
        return gamesInfo
    }
}

async function getAccessToken() {
    console.log(`Getting access token...`);
    if (acquiredToken == null || dateDiff(acquiredToken.date) >= 0) {
        let token = ""
        let time = 0
        try {
            let info = await axios({
                method: 'post',
                url: `https://id.twitch.tv/oauth2/token?client_id=${process.env.CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET}&grant_type=client_credentials`,
            })
            time = info.data.expires_in
            token = info.data.access_token
        } catch (error) {
            console.log(`...ERROR getting Access Token`);
            console.log({ error });
        }
        console.log(`Acquired TOKEN=${token}`);
        acquiredToken = {
            token: token,
            date: moment(new Date()).add(time, 'seconds')
        }
        return token
    } else {
        console.log(`Access token time left: ${dateDiff(acquiredToken.date)} days.`);
        return acquiredToken.token
    }

}

function dateDiff(date) {
    return moment(new Date()).diff(moment(date), 'days')
}

function gamesValidation(games) {
    return Math.abs(gamesRoutes.length - games.length) > 0;
}

module.exports = {
    getGamesDetails
}