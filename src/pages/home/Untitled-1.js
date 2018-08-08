"use strict";

var axios = require("axios"),
  path = require("path"),
  fs = require("fs");

async function downloadImage(url, fileName) {
  // axios image download with response type 'stream'
  const response = await axios({
    method: "GET",
    url: url,
    responseType: "stream"
  });

  // pipe the result stream into a file on disc
  response.data.pipe(fs.createWriteStream(fileName));

  // return a promise and resolve when download finishes
  return new Promise((resolve, reject) => {
    response.data.on("end", () => {
      resolve();
    });

    response.data.on("error", () => {
      reject();
    });
  });
}

function createDiretory(filePath) {
  var dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  createDiretory(dirname);
  fs.mkdirSync(dirname);
}

const optionDefinitions = [
  { name: "setCode", type: String, multiple: false, defaultOption: true }
];

const commandLineArgs = require("command-line-args");
const options = commandLineArgs(optionDefinitions);

if (!options.setCode) {
  console.log("please provide a set name. E.g. set=DOM");
  process.exit();
}

var setUrl = `http://mtgjson.com/json/${options.setCode.toUpperCase()}.json`;
var req = axios.get(setUrl).then(response => {
  var set = response.data;
  var setCode = set.code;
  var setName = set.name;
  var cards = set.cards;

  console.log(`Downloading cards for set ${setName}...`);
  for (var i = 0; i < cards.length; i++) {
    var multiverseid = cards[i].multiverseid;
    var imageName = cards[i].imageName;
    var url = `http://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=${multiverseid}&type=card`;
    var file = path.resolve(__dirname, setCode, `${imageName}.jpg`);
    createDiretory(file);
    downloadImage(url, file);
  }
});
