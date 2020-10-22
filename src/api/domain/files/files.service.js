const util = require('util')
const fs = require('fs');
const { NotFoundError } = require('../../http/errors/NotFoundError');
const readDir = util.promisify(fs.readdir)

function buildFilesService() {
  return {
    async getFiles(path) {
      let files = await readDir(path).catch((err) => {
        throw new NotFoundError('Directory not found')
      })
      return files
    },
  };
}

module.exports = {
  buildFilesService,
};
