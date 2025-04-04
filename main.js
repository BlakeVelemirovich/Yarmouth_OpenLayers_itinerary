/*
  Blake Velemirovich
  March 21, 2025
  main.js
  OpenLayers web mapping applications for an intintary of interesting things in the town of Yarmouth.
*/

import './style.css';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import OSM from 'ol/source/OSM';
import XYZ from 'ol/source/XYZ';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { Circle, Fill, Stroke, Style } from 'ol/style';
import { fromLonLat, toLonLat } from 'ol/proj';

// Define the three base layers, one for light mode, one for dark mode, one for satellite imagery.
const osmLayer = new TileLayer({
    source: new OSM()
});

const satLayer = new TileLayer({
    source: new XYZ({
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
    })
});

const darkLayer = new TileLayer({
    source: new XYZ({
        url: 'https://{a-c}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'
    })
});

// Get selected radio button (this is a fix for refreshing the page and having the correct layer selected)
const selectedBaseLayer = document.querySelector('input[name="basemap"]:checked');

// Default layer is the light mode OSM layer
let initialLayer = osmLayer; 

// Check which radio button is selected and set the initial layer to the correct layer
if (selectedBaseLayer) {
    if (selectedBaseLayer.id === 'sat') {
        initialLayer = satLayer;
    } else if (selectedBaseLayer.id === 'darkMode') {
        initialLayer = darkLayer;
    }
}

// Initialize the map with the correct layer
const map = new Map({
    target: 'map',
    layers: [initialLayer],
    view: new View({
        center: fromLonLat([-66.12959, 43.81600]),
        zoom: 13
    })
});

// Function to switch basemaps using event listeners waiting for a change in radio button
// Works by just replacing the first layer in the map layers array with the map layer associated with the radio button clicked
document.querySelector('#osm').addEventListener('change', () => {
    map.getLayers().setAt(0, osmLayer);
});
document.querySelector('#sat').addEventListener('change', () => {
    map.getLayers().setAt(0, satLayer);
});

document.querySelector('#darkMode').addEventListener('change', () => {
    map.getLayers().setAt(0, darkLayer);
});

// Points of interest layer
const pointsLayer = new VectorLayer({
    source: new VectorSource({
        url: './GeoJsons/PointsOfInterest.geojson',
        format: new GeoJSON(),
    }),
    style: [
        // Large circle with low opacity for the glow effect, smaller circle with bolder color defined below
        new Style({
            image: new Circle({
                // Radius is large for the glow effect
                radius: 10,
                fill: new Fill({
                    // Neon cyan with 20% opacity will and fill the circle, opacity makes it so the main circle underneath is visible
                    color: '#00b3b3' 
                }),
                stroke: new Stroke({
                    // Outline with a darker colour to make it more visible in light mode
                    color: 'rgba(0, 255, 255, 0.3)', 
                    width: 2
                })
            })
        }),
        // Smaller circle with no opacity to make a base for the glow effect
        new Style({
            image: new Circle({
                // Smaller radius than above circle to make a base for the glow effect
                radius: 6, 
                fill: new Fill({
                    // Neon cyan fill with 80% opacity
                    color: 'rgba(0, 255, 255, 0.8)' 
                }),
                stroke: new Stroke({
                    // Stronger colour with no opacity.
                    color: '#0ff', 
                    width: 2
                })
            })
        })
    ]
});

// Trail layers
const trailLayer = new VectorLayer({
    source: new VectorSource({
        url: './GeoJsons/Trails.geojson',
        format: new GeoJSON(),
    }),
    style: [
        // This line is for the glow effect and is a larger line with low opacity. Underneath it is a smaller line, with bolder color.
        new Style({
            stroke: new Stroke({
                // 0.3 opacity to make it glow
                color: 'rgba(0, 255, 255, 0.3)', 
                width: 8, 
                // Dashed lines
                lineDash: [10, 5],
                // Rounded corners and ends
                lineCap: 'round',
                lineJoin: 'round'
            })
        }),
        // Main trail style
        new Style({
            stroke: new Stroke({
                color: '#0ff', 
                // Smaller line but with no opacity so it is a solid line as a base for the glow effect
                width: 3, 
                lineDash: [10, 5],
                lineCap: 'round',
                lineJoin: 'round'
            })
        })
    ]
});

// Polygon Layers
const polygonLayer = new VectorLayer({
    source: new VectorSource({
        url: './GeoJsons/Polygons.geojson',
        format: new GeoJSON(),
    }),
    style: new Style({
        // The filling of the polygon with a lighter colour and 40% opacity to not block underneath map
        fill: new Fill({
            color: 'rgba(0, 255, 255, 0.4)' 
        }),
        // Dashed outline with a darker colour and 80% opacity to make it pop on the map
        stroke: new Stroke({
            color: '#00b3b3', 
            width: 4,
            lineDash: [2, 2],
            lineCap: 'round',
            lineJoin: 'round'
        })
    })
});

// Points of interest check box, whenever this is clicked, we will add or remove the layer from the map array.
setupLayerToggle('pointsCheck', pointsLayer);

// Trail check box
setupLayerToggle('trailCheck', trailLayer);

// Polygon check box
setupLayerToggle('polygonCheck', polygonLayer);

// Get cursor coordinates and then adjust the text content of the coords div to show the coordinates of the cursor
setupCursorCoordinates();

// Add each layer to the map so that it starts with them enabled. Check first if the checkbox is checked, if it is, add the layer to the map.
addInitialLayers(pointsLayer, 'pointsCheck');
addInitialLayers(trailLayer, 'trailCheck');
addInitialLayers(polygonLayer, 'polygonCheck');

// Functions sorted alphabetically
function addInitialLayers(layer, checkboxId) {
    const checkBox = document.getElementById(checkboxId);
    // If the checkbox is checked, add the layer to the map
    if (checkBox.checked) {
        map.addLayer(layer);
    }
}

function setupCursorCoordinates() {
    // Get the coordinates of the cursor and display them in the coords div
    map.on('pointermove', function (evt) {
        const coord = toLonLat(evt.coordinate);
        document.getElementById('coords').textContent = `${coord[0].toFixed(5)}, ${coord[1].toFixed(5)}`;
    });
}

function setupLayerToggle(checkboxId, layer) {
    // Add an event listener to the checkbox to add or remove the layer from the map
    const checkBox = document.getElementById(checkboxId);
    checkBox.addEventListener('change', function () {
        if (this.checked) {
            map.addLayer(layer);
        } else {
            map.removeLayer(layer);
        }
    });
}