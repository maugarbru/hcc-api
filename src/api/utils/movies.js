const axios = require('axios')
const fs = require('fs')

async function getMoviesDetails(movies) {
    let data = await readJSON()
    let info = []
    let promises = []
    console.log(`Getting movies details...`);
    if (moviesValidation(data.moviesRoutes, movies)) {
        for (let index = 0; index < movies.length; index++) {
            let movie = movies[index]
            let name = movie.split('.')[0].split('%')[0]
            let year = movie.split('.')[0].split('%')[1]
            // console.log(`Getting details for MOVIE=${name} YEAR=${year} ...`);
            promises.push(axios.get('https://api.themoviedb.org/3/search/movie', {
                params: {
                    api_key: process.env.API_KEY,
                    language: "en-US",
                    query: name,
                    page: 1,
                    include_adult: true,
                    year: year
                }
            }))
        }
        try {
            await Promise.allSettled(promises).then(async function (values) {
                for (let index = 0; index < values.length; index++) {
                    const element = values[index];
                    let detail = {
                        path: movies[index],
                        info: element.value.data.results[0]
                    }
                    info.push(detail)
                }
            });
            console.log(`...OK getting Movie Details`);
            let result = await getMoviesGenres(info)
            let data = {
                moviesInfo: result,
                moviesRoutes: movies
            }
            writeFile(data)
            return result
        } catch (error) {
            console.log(`...ERROR getting Movie Details`);
            console.log(error);
            return []
        }
    } else {
        console.log(`...OK Movies details loaded from memory`);
        return data.moviesInfo
    }

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
        console.log(`...OK getting Movie Genres`);
    } catch (error) {
        console.log(`...ERROR getting Movie Genres`);
        console.log(error);
    }
    return result
}

function moviesValidation(oldMovies, newMovies) {
    const areEqual = oldMovies.every(elementA => newMovies.includes(elementA))
    return oldMovies.length == 0 || !areEqual;
}

function writeFile(data) {
    fs.writeFile('./files/movies.json', JSON.stringify(data), (err) => {
        if (err) {
            console.log(err);
        }
        console.log("Movies info saved in JSON file.");
    })
}

async function readJSON() {
    try {
        let data = await fs.readFileSync('./files/movies.json',
            { encoding: 'utf8', flag: 'r' });
        return JSON.parse(data)
    } catch (error) {
        console.log("No movies.json file.");
        return {
            moviesInfo: [],
            moviesRoutes: []
        }
    }
}

module.exports = {
    getMoviesDetails
}