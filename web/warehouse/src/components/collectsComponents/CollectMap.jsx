import { Component } from "react";
import mapboxgl from 'mapbox-gl';
const accessToken = require("../../config.json").accessMapboxToken;

class CollectMap extends Component {
    componentDidMount() {
        mapboxgl.accessToken = accessToken;
        this.initMap(this.props.shortestDistList);
    }

    async getRoute(map, start, end, inter) {
        let formatInter = "";
        inter.forEach((interPoint, i) => {
            formatInter += `${interPoint[0]}, ${interPoint[1]}`;
            formatInter += ";";
        });

        const finalUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${formatInter}${end[0]},${end[1]}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`;
        const query = await fetch(finalUrl, { method: 'GET' });
        const json = await query.json();
        const data = json.routes[0];
        const route = data.geometry.coordinates;
        const geojson = {
            type: 'Feature',
            properties: {},
            geometry: {
                type: 'LineString',
                coordinates: route
            }
        };

        // if the route already exists on the map, we'll reset it using setData
        if (map.getSource('route')) {
            map.getSource('route').setData(geojson);
        } else {
            map.addLayer({
                id: 'route',
                type: 'line',
                source: {
                    type: 'geojson',
                    data: geojson
                },
                layout: {
                    'line-join': 'round',
                    'line-cap': 'round'
                },
                paint: {
                    'line-color': '#3887be',
                    'line-width': 5,
                    'line-opacity': 0.75
                }
            });
        }
    }

    initMap(shortestDistList) {
        const mapElement = document.getElementById("map");
        //const mapBoxContainer = document.getElementById("mapBoxRoadContainer");
        if (mapElement === null) return;

        console.log(shortestDistList);

        //mapElement.style.visibility = "hidden";
        //mapBoxContainer.style.height = "8vh";
        const itineraryPoints = shortestDistList.sortAddresses;

        let waypoints = { start: null, inter: [], end: null };
        if (itineraryPoints && itineraryPoints.length > 0) {
            waypoints.start = [
                Number.parseFloat(itineraryPoints[0][2]),
                Number.parseFloat(itineraryPoints[0][1])
            ];

            if (itineraryPoints.length > 1) {
                for (let i = 1; i < itineraryPoints.length; i++) {
                    const point = [
                        Number.parseFloat(itineraryPoints[i][2]),
                        Number.parseFloat(itineraryPoints[i][1])
                    ];
                    if (i < itineraryPoints.length - 1) waypoints.inter.push(point);
                    else waypoints.end = point;
                }
            }
        } else {
            return;
        }

        let map = null;
        if (document.getElementById("map") !== null) {
            document.getElementById("map").innerHTML = "";
            map = new mapboxgl.Map({
                container: 'map',
                style: 'mapbox://styles/mapbox/streets-v12',
                center: [waypoints.start[0], waypoints.start[1]], // starting position [lng, lat]
                zoom: 9, // base zoom
            });
        }

        const bottomLeftBound = (waypoints.start[1] > waypoints.end[1]) ? [waypoints.end[0] - 0.02, waypoints.end[1] - 0.02] :
            [waypoints.start[0] - 0.02, waypoints.start[1] - 0.02];

        const topRightBound = (waypoints.start[1] > waypoints.end[1]) ? [waypoints.start[0] + 0.02, waypoints.start[1] + 0.02] :
            [waypoints.end[0] + 0.02, waypoints.end[1] + 0.02];

        const bounds = [bottomLeftBound, topRightBound];

        if (map) {
            map.fitBounds(bounds, { padding: 20 });

            map.on('load', async () => {
                await this.getRoute(map, waypoints.start, waypoints.end, waypoints.inter);

                const limitsWaypoints = [waypoints.start, waypoints.end];
                const featuresPoints = [];
                limitsWaypoints.forEach((element) => {
                    const feature = {
                        type: 'Feature',
                        properties: {},
                        geometry: {
                            type: 'Point',
                            coordinates: element
                        }
                    }
                    featuresPoints.push(feature);
                })

                const interPoints = [];
                waypoints.inter.forEach((element) => {
                    const feature = {
                        type: 'Feature',
                        properties: {},
                        geometry: {
                            type: 'Point',
                            coordinates: element
                        }
                    }
                    interPoints.push(feature);
                })

                map.addLayer({
                    id: 'point',
                    type: 'circle',
                    source: {
                        type: 'geojson',
                        data: { type: 'FeatureCollection', features: featuresPoints }
                    },
                    paint: { 'circle-radius': 12, 'circle-color': '#3887be' }
                });

                map.addLayer({
                    id: 'inter-points',
                    type: 'circle',
                    source: {
                        type: 'geojson',
                        data: { type: 'FeatureCollection', features: interPoints }
                    },
                    paint: { 'circle-radius': 10, 'circle-color': '#47cff5' }
                });

                //mapElement.style.visibility = "visible";
                //mapBoxContainer.style.removeProperty("height");
            });
        }
    }

    render() {
        return (
            <div id="map"></div>
        );
    }
}

export default CollectMap;