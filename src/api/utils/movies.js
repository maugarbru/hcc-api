const axios = require('axios')

async function getMoviesDetails(movies) {
    console.log(`Getting movies details...`);
    let info = []
    for (let index = 0; index < movies.length; index++) {
        let movie = movies[index]
        let name = movie.split('.')[0].split('%')[0]
        let year = movie.split('.')[0].split('%')[1]

        let details = { path: movie }
        try {
            console.log(`Getting details for MOVIE=${name} YEAR=${year} ...`);
            let info = await axios({
                method: 'get',
                url: `https://api.themoviedb.org/3/search/movie?api_key=${process.env.API_KEY}&language=en-US&query=${name}&page=1&include_adult=true&year=${year}`,
            })
            details.info = info.data.results[0]
        } catch (error) {
            console.log(error);
        }
        info.push(details)
    }
    let result = await getMoviesGenres(info)
    return result
}

async function getMoviesGenres(movies) {
    console.log(`Getting movies genres...`);
    let genres = []
    let result = []
    try {
        let info = await axios({
            method: 'get',
            url: `https://api.themoviedb.org/3/genre/movie/list?api_key=${process.env.API_KEY}&language=en-US`
        })
        genres = info.data.genres
        movies.forEach(movie => {
            let genres_list = []
            movie.info.genre_ids.forEach(genre => {
                let genre_info = genres.filter(element => genre == element.id)
                genres_list.push(genre_info[0])
            });
            movie.info.genre_ids = genres_list
            result.push(movie)
        });
    } catch (error) {
        console.log(error);
    }
    return result
}

module.exports = {
    getMoviesDetails
}