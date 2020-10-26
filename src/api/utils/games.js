const axios = require('axios')

async function getGamesDetails(games) {
    let token = await getAccessToken()
    let info = []
    let promises = []
    console.log(`Getting games details...`);
    for (let index = 0; index < games.length; index++) {
        let game = games[index]
        let game_name = game.split('.')[0].replace(/[^\w\s]/gi, '')
        console.log(`Getting details for GAME=${game_name} ...`);
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
                let element = values[index].value.data.sort(function (a, b) {
                    if (!a.rating_count) {
                        return b.rating_count
                    } else if (!b.rating_count) {
                        return 0 - a.rating_count
                    } else {
                        return b.rating_count - a.rating_count
                    }
                })[0];
                element.rating = parseFloat((element.rating / 10).toFixed(1))
                let game = {
                    path: games[index],
                    info: element
                }
                info.push(game)
            }
        });
        console.log(`...OK Game details`);
        return info
    } catch (error) {
        console.log(`...ERROR getting Game details`);
        console.log(error);
        return []
    }
}

async function getAccessToken() {
    console.log(`Getting access token...`);
    let token = ""
    try {
        let info = await axios({
            method: 'post',
            url: `https://id.twitch.tv/oauth2/token?client_id=${process.env.CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET}&grant_type=client_credentials`,
        })
        token = info.data.access_token
    } catch (error) {
        console.log(`...ERROR getting Access Token`);
        console.log({ error });
    }
    console.log(`Acquired TOKEN=${token}`);
    return token
}

module.exports = {
    getGamesDetails
}