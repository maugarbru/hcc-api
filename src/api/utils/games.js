const axios = require('axios')

async function getGamesDetails(games) {
    console.log(`Getting games details...`);
    let token = await getAccessToken()
    let info = []
    for (let index = 0; index < games.length; index++) {
        let game = games[index]
        let game_name = game.split('.')[0].replace(/[^\w\s]/gi, '')
        let details = { path: game }
        try {
            console.log(`Getting details for GAME=${game_name} ...`);
            let info = await axios({
                method: 'post',
                headers: {
                    "Client-ID": process.env.CLIENT_ID,
                    "Authorization": `Bearer ${token}`,
                    'Content-Type': 'text/plain',
                },
                url: "https://api.igdb.com/v4/games",
                data: `fields id,cover.image_id,first_release_date,genres.name,name,summary,artworks.image_id,rating,rating_count; search "${game_name}"; limit 3;`
            })
            details.info = info.data.sort(function (a, b) {
                if (!a.rating_count) {
                    return b.rating_count
                } else if (!b.rating_count) {
                    return 0 - a.rating_count
                } else {
                    return b.rating_count - a.rating_count
                }
            })[0];
            details.info.rating = parseFloat((details.info.rating / 10).toFixed(1))
        } catch (error) {
            console.log({ error });
        }
        info.push(details)
    }
    return info
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
        console.log({ error });
    }
    console.log(`Acquired TOKEN=${token}`);
    return token
}

module.exports = {
    getGamesDetails
}