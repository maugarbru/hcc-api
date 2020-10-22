const HTTP_CODES = require('../../utils/http-codes');
const { buildFilesService } = require('./files.service');

const filesService = buildFilesService();

async function getStoredFiles(req, res) {
  try {
    let path = req.body.path
    const storedFiles = await filesService.getFiles(path);

    res.status(HTTP_CODES.OK).send({ data: { files: storedFiles } });
  } catch (error) {
    res.status(error.status).send({ message: error.message, status: error.status });
  }
}

module.exports = {
  getStoredFiles,
};
