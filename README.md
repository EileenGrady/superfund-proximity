# MAP675 Module 03 Collaborative Assignment
## Mapping Proximity to Superfund Sites

This project explores how to use [Turf.js](https://turfjs.org/[) and other [npm](https://www.npmjs.com/) packages and command line tools within a [Node](https://github.com/nodejs/node) environment, and quick web mapping solutions for plotting the resultant data.


### Data Sources

Primary: [GNIS Point Data](https://www.usgs.gov/core-science-systems/ngp/board-on-geographic-names/download-gnis-data)

Secondary: [Superfund sites](https://www.gao.gov/products/GAO-20-73)


### Data Processing

First install the following npm packages used to process data
* npm install @turf/turf
* npm install chalk
* npm install csvtojson
* npm install geojson-validation
* npm install i average

Run `node process-csv-stream.js` to process the GNIS point data, filtering for populated places to result in an output geojson file.

Run `node process-csv.js` to process Superfund site data, retaining only the site name and loation to result in an output geojson file.

Run `node create-hexgrid.js` to (1) create hexgrid covering the United States, (2) find the average distance from populated places in each hexgrid to the nearest Superfund site.

Run `node extract-colors.js` to pull out color schemes from larger cartocolors.json for use in web map.


### Final Web Map!

The web map shows the hexagrid, symbolized with a graduated color scheme using the [Leaflet Choropleth Pulgin](https://github.com/timwis/leaflet-choropleth). Darker colors indicate that populated places in that hexagon are located closer (on average) to a Superfund site than those in lighter colored hexagons.

Individual Superfund sites are displayed on the map using [Leaflet.markercluster](https://github.com/Leaflet/Leaflet.markercluster). Click a site to display its name in a popup.

Use the [Leaflet Control Geocoder](https://github.com/perliedman/leaflet-control-geocoder) to search for any location. Once a location is selected, a marker is added and Turf.js runs in the browser to find the nearest Superfund site. Use the layer control to toggle Superfund sites on and off.