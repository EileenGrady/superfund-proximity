// import packages
const fs = require("fs");
const csv = require("csvtojson");
const chalk = require("chalk");
const gjv = require("geojson-validation");

// define variables to quickly access in and out files, and the feature we want to filter for
const inFilePath = __dirname + "/../project-files/NationalFile_20191101.txt";
const outFilePath = __dirname + "/../data/populated-places.json";
const filteredFeature = "Populated Place";

processCSV(inFilePath);

function processCSV(filePath) {
    const readableStream = fs.createReadStream(filePath);

    const geojson = {
        type: "FeatureCollection",
        features: []
    };

    let feature;
    let featureCount = 0;

    console.time(chalk.blue("processing time: "));

    csv({
        delimiter: "|"
    })
        .fromStream(readableStream)
        .subscribe((jsonObj, i) => {
            if (i % 100000 == 0) console.log("processing row #: " + chalk.blue(i));

            if (jsonObj.FEATURE_CLASS === filteredFeature) {
                feature = {
                    type: "Feature",
                    geometry: {
                        type: "Point",
                        coordinates: [+jsonObj.PRIM_LONG_DEC, +jsonObj.PRIM_LAT_DEC]
                    },
                    properties: {
                        FEATURE_NAME: jsonObj.FEATURE_NAME
                    }
                };
                geojson.features.push(feature);
                featureCount++;
            }
        })
        .on("done", error => {
            console.log(
                chalk.cyan(
                    `${featureCount} "${filteredFeature}" features filtered from CSV file`
                )
            );
            validateGeoJson(geojson)
        });
}

const validateGeoJson = (geojson) => {
    if (gjv.valid(geojson)) {
        console.log(chalk.green("Great Job! This is a valid GeoJSON!"));
        writeToFile(geojson)
    } else {
        console.log(chalk.red("Sorry, this isn't a valid GeoJson :("))
    }
}

const writeToFile = (geojson => {
    fs.writeFile(outFilePath, JSON.stringify(geojson), "utf-8", err => {
        if (err) throw err;

        console.log(chalk.green("Done writing file!"));
    });
})