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
import { Icon } from 'ol/style';

/*
  Blake Velemirovich
  March 21, 2025
  main.js
  OpenLayers web mapping applications for an intintary of interesting things in the town of Yarmouth.
*/

// Define the three base layers
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

// Create the map instance with only the OSM layer by default
const map = new Map({
    target: 'map',
    layers: [
      osmLayer
    ],
    view: new View({
        center: fromLonLat([-66.12959, 43.81600]),
        zoom: 13
    })
});

// Function to switch basemaps using event listeners waiting for a change in radio button
document.querySelector('#osm').addEventListener('change', () => {
    map.getLayers().setAt(0, osmLayer);
});
document.querySelector('#sat').addEventListener('change', () => {
    map.getLayers().setAt(0, satLayer);
});

document.querySelector('#darkMode').addEventListener('change', () => {
    map.getLayers().setAt(0, darkLayer);
}
);

const pointsLayer = new VectorLayer({
    source: new VectorSource({
        url: './GeoJsons/PointsOfInterest.geojson',
        format: new GeoJSON(),
    }),
    style: [
        // Glow effect (larger circle with low opacity)
        new Style({
            image: new Circle({
                radius: 10, // Larger radius for the glow
                fill: new Fill({
                    color: '#00b3b3' // Neon cyan with 20% opacity
                }),
                stroke: new Stroke({
                    color: 'rgba(0, 255, 255, 0.3)', // Neon cyan border with 30% opacity
                    width: 2
                })
            })
        }),
        // Main point style
        new Style({
            image: new Circle({
                radius: 6, // Smaller radius for the main point
                fill: new Fill({
                    color: 'rgba(0, 255, 255, 0.8)' // Neon cyan fill with 80% opacity
                }),
                stroke: new Stroke({
                    color: '#0ff', // Neon cyan border
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
    style: new Style({
        stroke: new Stroke({
             color: 'blue',
              width: 2 
            })
    })
});

// Polygon Layers
const polygonLayer = new VectorLayer({
    source: new VectorSource({
        url: './GeoJsons/Polygons.geojson',
        format: new GeoJSON(),
    }),
    style: new Style({
        fill: new Fill({
            color: 'rgba(0, 255, 255, 0.4)' 
        }),
        stroke: new Stroke({
            color: '#00b3b3', 
            width: 4,
            lineDash: [2, 2],
            lineCap: 'round',
            lineJoin: 'round'
        })
    })
});

// Points of interest check box
const pointsCheckBox = document.getElementById('pointsCheck');
pointsCheckBox.addEventListener('change', function () {
    if (this.checked) {
        map.addLayer(pointsLayer);
    } else {
        map.removeLayer(pointsLayer);
    }
});

// Trail check box
const trailCheckBox = document.getElementById('trailCheck');
trailCheckBox.addEventListener('change', function () {
    if (this.checked) {
        map.addLayer(trailLayer);
    } else {
        map.removeLayer(trailLayer);
    }
});

// Polygon check box
const polygonCheckBox = document.getElementById('polygonCheck');
polygonCheckBox.addEventListener('change', function () {
    if (this.checked) {
        map.addLayer(polygonLayer);
    } else {
        map.removeLayer(polygonLayer);
    }
});

// Show cursor coordinates
map.on('pointermove', function (evt) {
    const coord = toLonLat(evt.coordinate);
    document.getElementById('coords').textContent = `${coord[0].toFixed(5)}, ${coord[1].toFixed(5)}`;
});

// Add each layer to the map so that it starts with them enabled.
map.addLayer(pointsLayer);
map.addLayer(trailLayer);
map.addLayer(polygonLayer);