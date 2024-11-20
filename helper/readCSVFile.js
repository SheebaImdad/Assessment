const csv = require("csv-parser");
const fs = require("fs");
const logger = require("loglevel");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "asset");
  },
  filename: (req, file, cb) => {
    const { originalname } = file;

    cb(null, originalname);
  },
});
const upload = multer({ storage });

async function readCSVFile(path) {
  try {
    let results = [];

    let dataFromCSV = new Promise((resolve, reject) => {
      fs.createReadStream(path)
        .pipe(csv({ headers: true }))
        .on("data", (data) => results.push(data))
        .on("end", () => {
          resolve(results);
        });
    });
    return dataFromCSV;
  } catch (e) {
    logger.error("csvFileReaderHleper::::readQuesCSVFile", e);
  }
}

module.exports = {
  upload,
  readCSVFile,
};
