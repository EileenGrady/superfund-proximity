// load npm packages to use in scripts
const fs = require('fs');

function extractColors() {

  // read cartocolors json file into script
  // returns 'response'
  fs.readFile(__dirname + '/../project-files/cartocolors.json', function (err, response) {

    if (err) throw err;

    // confirm data reads in correctly
    console.log("cartocolors.json data loaded!");

    // parse raw data string into JSON
    const data = JSON.parse(response);

    console.log("cartocolors.json data parsed to JSON");

    // extract all color schemes I want to experiment using in the map
    const outputData = {
      'Emrld': data['Emrld'],
      'BluYl': data['BluYl'],
      'Sunset': data['Sunset'],
      'BrwnYl': data['BrwnYl'],
      'Peach': data['Peach']
    };

    console.log("Color scheme extracted from parsed data");

    // write outputData containing just the selected objects to json file
    fs.writeFile(__dirname + '/../data/color-scheme.json', JSON.stringify(outputData), 'utf-8', function (err) {

      if (err) throw err;

      console.log('color-scheme.json written to data/ dir');
    });
  });
}

// export function to use in other scripts
exports.extractColors = extractColors

extractColors()