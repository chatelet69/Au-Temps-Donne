import { Component } from "react";
import "../../css/components.css";
import EventsModule from "./EventsModule";
import mapboxgl from 'mapbox-gl';
import { Suspense } from "react";
import polyline from '@mapbox/polyline';
const accessToken = require("../../config.json").accessMapboxToken;

class MapboxRoad extends Component {
    changeView = this.props.changeModule;

    state = {
        changeView: this.props.changeModule,
        deletePopupVisibility: false,
        actualEventDetails: false,
        isMapReady: false,
        cancelEditButton: false,
        waypointsTest: null,
    };

    async getRoute(map, start, end, inter, coords) {
        let formatInter = "";
        inter.forEach((interPoint) => {
            formatInter += `${interPoint[0]}, ${interPoint[1]}`
        });
        formatInter += ";";

        //const finalUrl = `https://api.mapbox.com/directions/v5/mapbox/walking/${start[0]},${start[1]};${formatInter}${end[0]},${end[1]}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`;
        //const query = await fetch(finalUrl, { method: 'GET' });
        //const json = await query.json();
        //const data = json.routes[0];
        //const route = data.geometry.coordinates;
        const route = coords;
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

        let tmpRoutes = route;
        tmpRoutes.forEach((element) => {
            const tmp = element[0];
            element[0] = element[1];
            element[1] = tmp;
        });
        const encoded = polyline.encode(tmpRoutes);
        this.props.setPolylineUrl(encoded);
    }

    getDistanceBetweenPoints(latitude1, longitude1, latitude2, longitude2, unit) {
        let theta = longitude1 - longitude2;
        let distance = 60 * 1.1515 * (180 / Math.PI) * Math.acos(
            Math.sin(latitude1 * (Math.PI / 180)) * Math.sin(latitude2 * (Math.PI / 180)) +
            Math.cos(latitude1 * (Math.PI / 180)) * Math.cos(latitude2 * (Math.PI / 180)) * Math.cos(theta * (Math.PI / 180))
        );
        return (unit === "kilometers") ? Math.round(distance * 1.609344, 2) : distance;
    }

    calculatePolylineEncoding(value) {
        let tmpValue = 0;
        tmpValue = Math.round(value * 1e5);

        tmpValue = (tmpValue >>> 0).toString(2).padStart(32, "0");

        const shiftToLeft = (binary) => {
            let tmpBinary = "";
            for (let i = 0; i < binary.length; i++) {
                tmpBinary += (i < binary.length - 1) ? binary[i + 1] : '0';
            }
            return tmpBinary;
        }
        tmpValue = shiftToLeft(tmpValue);

        if (value < 0) tmpValue = tmpValue.toString().split("").map((bit) => (bit === "0" ? "1" : "0")).join("");
        tmpValue = tmpValue.toString().slice(2);

        let tmpValueFrags = tmpValue.toString().match(/.{5}/g);

        for (let i = 0; i < 3; i++) {
            let tmp = tmpValueFrags[i];
            tmpValueFrags[i] = tmpValueFrags[6 - 1 - i];
            tmpValueFrags[6 - 1 - i] = tmp;
        }

        for (let i = 0; i < 5; i++) {
            if (tmpValueFrags[i][4] === tmpValueFrags[i + 1][0]) {
                let tmp = parseInt(tmpValueFrags[i], 2) | 0x20;
                tmp = (tmp >>> 0).toString(2);
                tmpValueFrags[i] = tmp;
            }
            if (i === 4) tmpValueFrags[5] = "0" + tmpValueFrags[5];
        }

        for (let i = 0; i <= 5; i++) {
            tmpValueFrags[i] = parseInt(tmpValueFrags[i], 2);
            tmpValueFrags[i] += 63;
            tmpValueFrags[i] = String.fromCharCode(tmpValueFrags[i]);
        }
        tmpValue = tmpValueFrags.join("");

        return tmpValue;
    }

    goBackToEvents = () => this.props.changeModule(<EventsModule changeModule={this.props.changeModule} />);

    initMap() {
        if (this.props.geometryString === null) return;
        const test = polyline.decode(this.props.geometryString);
        const mapElement = document.getElementById("map");
        const mapBoxContainer = document.getElementById("mapBoxRoadContainer");
        if (mapElement === null) return;

        mapElement.style.visibility = "hidden";
        mapBoxContainer.style.height = "8vh";
        const itineraryPoints = this.props.itineraryPoints;

        const waypoints = {
            start: [test[0][1], test[0][0]],
            inter: [],
            end: [test[test.length - 1][1], test[test.length - 1][0]]
        };

        test.forEach((point, i) => {
            if (i > 0 && i < test.length - 1) waypoints.inter.push([point[1], point[0]]);
            test[i] = [test[i][1], test[i][0]];
        })

        let map = null;
        if (document.getElementById("map") !== null) {
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
        this.props.setBounds(bounds);

        if (map) {
            //map.setMaxBounds(bounds);
            map.fitBounds(bounds, { padding: 20 });

            map.on('load', () => {
                this.getRoute(map, waypoints.start, waypoints.end, waypoints.inter, test);
                //this.getRoute(map, waypoints.start, waypoints.end, waypoints);

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
                //waypoints.inter.forEach((element) => {
                itineraryPoints.forEach((element, i) => {
                    if (i > 0) {
                        const feature = {
                            type: 'Feature',
                            properties: {},
                            geometry: {
                                type: 'Point',
                                coordinates: [element.lng, element.lat]
                            }
                        }
                        interPoints.push(feature);
                    }
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

                this.setState({ isMapReady: true });
                mapElement.style.visibility = "visible";
                mapBoxContainer.style.removeProperty("height");
            });
        }
    }

    // Component Mounting
    async componentDidMount() {
        mapboxgl.accessToken = accessToken;
        if (this.props.itineraryPoints.length > 0) this.initMap();
    };

    async componentDidUpdate(prevProps) {
        if (this.props.itineraryPoints.length !== prevProps.itineraryPoints.length) this.initMap();
        if (this.props.needMapReload) {
            this.props.setNeedMapReload(false);
            this.initMap();
        }
    }

    render() {
        return (
            <>
                {
                    !this.state.isMapReady &&
                    <h3 className="text-center">Chargement en cours de la carte</h3>
                }
                <Suspense fallback={<h5>Chargement en cours de la carte</h5>}>
                    <div id="map"></div>
                </Suspense>
            </>
        );
    }
};

export default MapboxRoad;