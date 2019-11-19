// import packages
const fs = require("fs");
const turf = require("@turf/turf");
const chalk = require("chalk");

// shortcuts to in and out files, change these accordingly
inFilePath = __dirname + "/../data/superfund-sites.json"
outFilePath = __dirname + "/../data/superfund-hexgrid.json"

fs.readFile(inFilePath, "utf8", (err, data) => {
    if (err) throw err;

    const features = JSON.parse(data);

    createHexGrid(features);
})

const createHexGrid = (features) => {
    console.log(features)
    // establish a bounding box
    // [ minX, minY, maxX, maxY ]
    const bbox = [-125, 23, -65, 50];

    // define our cell Diameter
    const cellSide = .5;

    // define units for Turf
    const options = {
        units: "degrees"
    };

    // create the hex polygons
    let hexgrid = turf.hexGrid(bbox, cellSide, options);
    console.log(hexgrid)
    // call function to sum all points within each hexagon
    sumPoints(features, hexgrid);
}

const sumPoints = (features, hexgrid) => {
    const options = {
        ignoreBoundary: true
      };

    // set a counter variable
    let count;
    
    // loop through each hex in hexgrid
    turf.featureEach(hexgrid, (hex, i) => {
        // reset counter to zero for each hex
        count = 0

        // loop through each point 
        turf.featureEach(features, point => {
            // if the point is inside the hex
            if (turf.booleanPointInPolygon(point, hex, options)) {
                count++ // increase count by 1
            }
        });

        // output progress
        if (count > 0) {
            console.log(chalk.cyan("adding count of " + count + " to hex #: " + i));
        }

        // update hex properties with count
        hex.properties = Object.assign({}, hex.properties, {
            superfundCount: count
        });
    });

    console.log(chalk.magenta("ready to write the hexgrid to file"));
    
    // truncate the coordinate precision to reduce file size
    hexgrid = turf.truncate(hexgrid, {
        precision: 5
    });

    // call function write the hexgrid to file
    writeHexGrid(hexgrid)
}

const writeHexGrid = (hexgrid) => {
    // stringify the hexgrid and write to file
    fs.writeFile(
        outFilePath,
        JSON.stringify(hexgrid),
        "utf-8",
        err => {
            if (err) throw err;
            console.log(chalk.green("Done writing file!"))
        }
    );
}