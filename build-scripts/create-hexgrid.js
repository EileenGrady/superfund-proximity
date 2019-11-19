// import packages
const fs = require("fs");
const turf = require("@turf/turf");
const chalk = require("chalk");
const average = require('average');

// shortcuts to in and out files, change these accordingly
inFirstFile = __dirname + "/../data/populated-places.json"
inSecondFile = __dirname + "/../data/superfund-sites.json"
outFilePath = __dirname + "/../data/superfund-proximity-hexgrid.json"

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

const calculateNearestSite = (popPlaces, superfunds, hexgrid) => {

    let points = superfunds

    turf.featureEach(popPlaces, popPlace => {
        let targetPoint = popPlace.geometry.coordinates
        let nearest = turf.nearestPoint(targetPoint, points);
        let options = {units: 'miles'}
        let distance = turf.distance(targetPoint, nearest, options)

        popPlace.properties = Object.assign({}, popPlace.properties, {
            nearestSuperfund: nearest.properties.Name,
            distanceTo: distance
        });

    })

    collectPlaces(popPlaces, hexgrid)
}

const collectPlaces = (popPlaces, hexgrid) => {
    let options = {
        ignoreBoundary: true
    };

    let count;

    turf.featureEach(hexgrid, (hex, i) => {
        count = []

        turf.featureEach(popPlaces, point => {
            if (turf.booleanPointInPolygon(point, hex, options)) {
                count.push(point.properties.distanceTo)
            }
        })
        var averageDistance = average(count)

        if (averageDistance > 0) {
            console.log(chalk.magenta("hex # " + i + ": " + averageDistance))
        }

        hex.properties = Object.assign({}, hex.properties, {
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