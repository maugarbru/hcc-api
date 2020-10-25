const util = require('util')
const fs = require('fs');
const { exec } = require('child_process');

const { NotFoundError, BadDataError } = require('../../http/errors/NotFoundError');
const readDir = util.promisify(fs.readdir)

function buildFilesService() {
  return {
    async getFiles(path) {
      let files = await readDir(path).catch((err) => {
        throw new NotFoundError('Directory not found')
      })
      return files
    },
    async openFile(path, type) {
      let file = exec(`"${path}"`, { timeout: 3000 })
      return file.pid

    },
    async closeFile(type) {
      if (type == "video") {
        exec("taskkill /F /IM vlc.exe", { timeout: 3000 })

        return "Closed video player"
      } else {
        throw new BadDataError('Type not supported')
      }
    },
  };
}

module.exports = {
  buildFilesService,
};
