const axios = require('axios')

async function getGamesDetails(games) {
    let token = await getAccessToken()
    let info = []
    for (let index = 0; index < games.length; index++) {
        let game = games[index]
        let game_name = game.split('.')[0].replace(/[^\w\s]/gi, '')

        let details = { path: game }
        try {
            let info = await axios({
                method: 'post',
                headers: {
                    "Client-ID": process.env.CLIENT_ID,
                    "Authorization": `Bearer ${token}`,
                    'Content-Type': 'text/plain',
                },
                url: "https://api.igdb.com/v4/games",
                data: `fields id,cover.image_id,first_release_date,genres.name,name,summary,artworks.image_id; search "${game_name}"; limit 1;`
            })
            details.info = info.data[0]
        } catch (error) {
            console.log({ error });
        }
        info.push(details)
    }
    return info
}

async function getAccessToken() {
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
    return token
}

module.exports = {
    getGamesDetails
}