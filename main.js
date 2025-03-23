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

/*
  Blake Velemirovich
  March 21, 2025
  main.js
  OpenLayers web mapping applications for an intintary of interesting things in the town of Yarmouth.
*/

// Define the two base layers
const osmLayer = new TileLayer({
    source: new OSM()
});

const satLayer = new TileLayer({
    source: new XYZ({
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
    })
});

// Create the map instance with only the OSM layer by default
const map = new Map({
    target: 'map',
    layers: [
      osmLayer
    ],
    view: new View({
        center: fromLonLat([-66.1174, 43.8375]),
        zoom: 12
    })
});

// Function to switch basemaps
document.querySelector('#osm').addEventListener('change', () => {
    map.getLayers().setAt(0, osmLayer);
});
document.querySelector('#sat').addEventListener('change', () => {
    map.getLayers().setAt(0, satLayer);
});

// Define vector layers
const poiLayer = new VectorLayer({
    source: new VectorSource({
        url: 'points_of_interest.geojson',
        format: new GeoJSON(),
    }),
    style: new Style({
        image: new Circle({
            radius: 5,
            fill: new Fill({ color: 'red' }),
            stroke: new Stroke({ color: 'black', width: 1 })
        })
    })
});

const roadLayer = new VectorLayer({
    source: new VectorSource({
        url: 'roads.geojson',
        format: new GeoJSON(),
    }),
    style: new Style({
        stroke: new Stroke({ color: 'blue', width: 2 })
    })
});

// Toggle layers with checkboxes
document.querySelector('#layer1').addEventListener('change', function () {
    if (this.checked) {
        map.addLayer(poiLayer);
    } else {
        map.removeLayer(poiLayer);
    }
});

document.querySelector('#layer2').addEventListener('change', function () {
    if (this.checked) {
        map.addLayer(roadLayer);
    } else {
        map.removeLayer(roadLayer);
    }
});

// Show cursor coordinates
map.on('pointermove', function (evt) {
    const coord = toLonLat(evt.coordinate);
    document.getElementById('coords').textContent = `${coord[0].toFixed(5)}, ${coord[1].toFixed(5)}`;
});
