/*
  Blake Velemirovich
  March 21, 2025
  main.js
  OpenLayers web mapping applications for an intintary of interesting things in the town of Yarmouth.
*/

const osmLayer = new ol.layer.Tile({ source: new ol.source.OSM() });
const satLayer = new ol.layer.Tile({ source: new ol.source.XYZ({ url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}' }) });
const baseLayers = { osm: osmLayer, sat: satLayer };

const poiLayer = new ol.layer.Vector({
    source: new ol.source.Vector({ url: 'points_of_interest.geojson', format: new ol.format.GeoJSON() }),
    style: new ol.style.Style({ image: new ol.style.Circle({ radius: 5, fill: new ol.style.Fill({ color: 'red' }) }) })
});

const roadLayer = new ol.layer.Vector({
    source: new ol.source.Vector({ url: 'roads.geojson', format: new ol.format.GeoJSON() }),
    style: new ol.style.Style({ stroke: new ol.style.Stroke({ color: 'blue', width: 2 }) })
});

const map = new ol.Map({
    target: 'map',
    layers: [osmLayer, poiLayer, roadLayer],
    view: new ol.View({ center: ol.proj.fromLonLat([-66.1174, 43.8375]), zoom: 12 })
});

document.querySelector('#osm').addEventListener('change', () => map.setLayerGroup(new ol.layer.Group({ layers: [osmLayer, poiLayer, roadLayer] })));
document.querySelector('#sat').addEventListener('change', () => map.setLayerGroup(new ol.layer.Group({ layers: [satLayer, poiLayer, roadLayer] })));
document.querySelector('#layer1').addEventListener('change', function () { this.checked ? map.addLayer(poiLayer) : map.removeLayer(poiLayer); });
document.querySelector('#layer2').addEventListener('change', function () { this.checked ? map.addLayer(roadLayer) : map.removeLayer(roadLayer); });

map.on('pointermove', function (evt) {
    const coord = ol.proj.toLonLat(evt.coordinate);
    document.getElementById('coords').textContent = `${coord[0].toFixed(4)}, ${coord[1].toFixed(4)}`;
});