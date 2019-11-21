// import packages
const fs = require("fs");
const turf = require("@turf/turf");
const chalk = require("chalk");
const average = require('average');

// shortcuts to in and out files, change these accordingly
inFirstFile = __dirname + "/../data/populated-places.json"
inSecondFile = __dirname + "/../data/superfund-sites.json"
outFilePath = __dirname + "/../data/hexgrid.json"

// first read in populated places
fs.readFile(inFirstFile, "utf8", (err, popPlacesData) => {
    if (err) throw err;

    // define variable for pop places
    const popPlaces = JSON.parse(popPlacesData);

    // then read in superfund data
    fs.readFile(inSecondFile, "utf8", (err, superData) => {
        if (err) throw err;

        // define variable for superfund data
        const superfunds = JSON.parse(superData)

        // then call function to create hex grid, passing both populated places and superfunds
        createHexGrid(popPlaces, superfunds)
    })

})

const createHexGrid = (popPlaces, superfunds) => {
    
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

    calculateNearestSite(popPlaces, superfunds, hexgrid);
}

// find nearest superfund site to each populated place
const calculateNearestSite = (popPlaces, superfunds, hexgrid) => {

    // define search points as superfunds
    let points = superfunds

    // loop through each populate place
    turf.featureEach(popPlaces, popPlace => {

        // first find the nearest superfund site to the populated place
        let targetPoint = popPlace.geometry.coordinates
        let nearest = turf.nearestPoint(targetPoint, points);

        // then calculate the distance to it in miles
        let options = {units: 'miles'}
        let distance = turf.distance(targetPoint, nearest, options)

        // add attribute to each populated place 
        // for the name of the nearest superfund and the distance to it
        popPlace.properties = Object.assign({}, popPlace.properties, {
            nearestSuperfund: nearest.properties.Name,
            distanceTo: distance
        });

    })

    // call next function
    collectPlaces(popPlaces, superfunds, hexgrid)
}

// count number of superfund sites in each hex 
// and calculate average distance
const collectPlaces = (popPlaces, superfunds, hexgrid) => {
    let options = {
        ignoreBoundary: true
    };

    let averageCount;
    let count;

    // loop through each hex
    turf.featureEach(hexgrid, (hex, i) => {

        // start these over for each hex
        averageCount = []
        count = 0

        // loop through each populated place
        // if it is in the hex, add the distance value to the average count array
        turf.featureEach(popPlaces, point => {
            if (turf.booleanPointInPolygon(point, hex, options)) {
                averageCount.push(point.properties.distanceTo)
            }
        })

        // once pop place loop completes, find average distance for all populated places in that hex
        var averageDistance = average(averageCount)

        // monitor progress
        if (averageDistance > 0) {
            console.log(chalk.magenta("hex # " + i + ": " + averageDistance))
        }

        // then loop through each superfunds,
        // increase count by one if it is in hex
        turf.featureEach(superfunds, point => {
            if(turf.booleanPointInPolygon(point, hex, options)) {
                count++
            }
        })

        // monitor progress
        if (count > 0) {
            console.log(chalk.green("adding " + count + " superfunds to hex #" + i))
        }

        // add new attributes the the hex for number of superfunds, and average distance
        hex.properties = Object.assign({}, hex.properties, {
            superfundCount: count,
            averageDistance: averageDistance
        });
    })

    console.log(chalk.blue("ready to write the hexgrid to file"));
    
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