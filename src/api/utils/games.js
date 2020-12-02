const axios = require('axios')
const moment = require('moment')
const fs = require('fs')

async function getGamesDetails(games) {
    let data = await readJSON()
    let token = await getAccessToken(data.token)
    let info = []
    let promises = []
    console.log(`Getting games details...`);
    if (gamesValidation(data.gamesRoutes, games)) {
        for (let index = 0; index < games.length; index++) {
            let game = games[index]
            let game_name = game.split('.')[0].replace(/[^\w\s]/gi, '')
            // console.log(`Getting details for GAME=${game_name} ...`);
            promises.push(axios({
                method: 'post',
                headers: {
                    "Client-ID": process.env.CLIENT_ID,
                    "Authorization": `Bearer ${token.token}`,
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
            let data = {
                token: token,
                gamesInfo: info,
                gamesRoutes: games
            }
            writeFile(data)
            return info
        } catch (error) {
            console.log(`...ERROR getting Game details`);
            console.log(error);
            return []
        }
    } else {
        console.log(`...OK Game details loaded from memory`);
        return data.gamesInfo
    }
}

async function getAccessToken(acquiredToken) {
    console.log(`Getting access token...`);
    if (tokenValidation(acquiredToken)) {
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
        newToken = {
            token: token,
            date: moment(new Date()).add(time, 'seconds')
        }
        return newToken
    } else {
        console.log(`Access token time left: ${moment(new Date()).diff(moment(acquiredToken.date), 'days')} days.`);
        return acquiredToken
    }

}

function tokenValidation(token) {
    return token == null || moment(new Date()).diff(moment(token.date), 'days') >= 0
}

function gamesValidation(oldGames, newGames) {
    return oldGames.length == 0 || Math.abs(oldGames.length - newGames.length) > 0;
}

function writeFile(data) {
    fs.writeFile('./files/games.json', JSON.stringify(data), (err) => {
        if (err) {
            console.log(err);
        }
        console.log("Games info saved in JSON file.");
    })
}

async function readJSON() {
    try {
        let data = await fs.readFileSync('./files/games.json',
            { encoding: 'utf8', flag: 'r' });
        return JSON.parse(data)
    } catch (error) {
        console.log("No games.json file.");
        return {
            token: null,
            gamesInfo: [],
            gamesRoutes: []
        }
    }
}

module.exports = {
    getGamesDetails
}