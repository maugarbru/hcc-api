const axios = require('axios')

async function getMoviesDetails(movies) {
    let result = []
    for (let index = 0; index < movies.length; index++) {
        let movie = movies[index]
        let name = movie.split('.')[0].split('%')[0]
        let year = movie.split('.')[0].split('%')[1]

        let details = { path: movie }
        try {
            let info = await axios({
                method: 'get',
                url: `https://api.themoviedb.org/3/search/movie?api_key=${process.env.API_KEY}&language=en-US&query=${name}&page=1&include_adult=true&year=${year}`,
            })
            details.info = info.data.results[0]
        } catch (error) {

        }
        result.push(details)
    }
    return result
}

module.exports = {
    getMoviesDetails
}