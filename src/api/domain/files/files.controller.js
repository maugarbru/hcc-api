const HTTP_CODES = require('../../utils/http-codes');
const moviesService = require('../../utils/movies');
const { buildFilesService } = require('./files.service');

const filesService = buildFilesService();

async function getStoredFiles(req, res) {
  try {
    let path = req.body.path
    let type = req.body.type
    const storedFiles = await filesService.getFiles(path);

    if (type == 'movie') {
      let storedMovies = await moviesService.getMoviesDetails(storedFiles);
      res.status(HTTP_CODES.OK).send({ files: storedMovies } );
    } else {
      res.status(HTTP_CODES.OK).send({ files: storedFiles } );
    }
  } catch (error) {
    res.status(error.status).send({ message: error.message, status: error.status });
  }
}

async function openStoredFile(req, res) {
  try {
    let path = req.body.path
    let type = req.body.type
    const process_pid = await filesService.openFile(path, type);

    res.status(HTTP_CODES.OK).send({ data: { pid: process_pid } });;
  } catch (error) {
    res.status(error.status).send({ message: error.message, status: error.status });
  }
}

async function closeOpenedFile(req, res) {
  try {
    let type = req.body.type
    const result = await filesService.closeFile(type);

    res.status(HTTP_CODES.OK).send({ data: { info: result } });;
  } catch (error) {
    res.status(error.status).send({ message: error.message, status: error.status });
  }
}

module.exports = {
  getStoredFiles,
  openStoredFile,
  closeOpenedFile
};
