// import packages
const fs = require("fs");
const csv = require("csvtojson");
const chalk = require("chalk");
const gjv = require("geojson-validation");

// define variables to quickly access in and out files
const inFilePath = __dirname + "/../project-files/superfund-sites.csv";
const outFilePath = __dirname + "/../data/superfund-sites.json";

csv({
    delimiter: ","
})
    .fromFile(inFilePath)
    .then(jsonObj => {
        jsonToGeoJson(jsonObj);
    });

    const jsonToGeoJson = (jsonObj) => {
        const geojson = {
            type: "FeatureCollection",
            features: []
        };
    
        let feature;
    
        let featureCount = 0;
    
        jsonObj.forEach(obj => {
            if (obj.Longitude) {
                feature = {
                    type: "Feature",
                    geometry: {
                        type: "Point",
                        coordinates: [+obj.Longitude, +obj.Latitude]
                    },
                    properties: {
                        FEATURE_NAME: obj.Name
                    }
                };
                geojson.features.push(feature);
                featureCount++;
            }
        });
        console.log(
            chalk.cyan(
                `${featureCount} features created from CSV file`
            )
        );
        validateGeoJson(geojson);
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
