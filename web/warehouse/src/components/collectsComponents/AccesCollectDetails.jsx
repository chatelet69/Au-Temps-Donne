import "../../css/collects.css";
import SideHeaderWarehouse from "../../components/SideHeaderWareHouse";
import WareHouseHeader from "../../components/Header";
import WareHouseFooter from "../../components/Footer";
import ModifyCollectPopup from "./ModifyCollectPopup";
import AccesDetailStockCollectPopup from "./AccesDetailStockCollectPopup";
import React, { useEffect, useState } from "react";
import mapboxgl from 'mapbox-gl';
import moment from "moment/moment";
import { useNavigate } from "react-router-dom";
import CollectMap from "./CollectMap";
const baseUrl = require("../../config.json").baseUrl;
const accessToken = require("../../config.json").accessMapboxToken;

const CollectDetail = (props) => {
    const navigate = useNavigate();
    const urlParams = new URLSearchParams(window.location.search);
    const collectId = urlParams.get('collectId');
    const [collectData, setCollectData] = useState([]);
    const [collectAddressesData, setCollectAddressesData] = useState([]);
    const [visibilityPopup, setVisibilityModifyPopup] = useState(false);
    const [visibilityDetaiStockPopup, setVisibilitDetailStockPopup] = useState(false);
    const [shortestDist, setShortestDist] = useState([]);
    const [initMapStatus, setInitMapStatus] = useState(true);


    async function getCollect() {
        try {
            let res = await fetch(`${baseUrl}/api/collects/${collectId}`, { method: "GET", credentials: "include" });
            let data = await res.json();
            if (data) {
                setCollectData(data);
            }
        } catch (error) {
            return false;
        }
    }

    async function getPartnerByCollect() {
        try {
            let res = await fetch(`${baseUrl}/api/collects/get/getAllPartnerByTraject/${collectId}`, { method: "GET", credentials: "include" });
            let addressesData = await res.json();
            addressesData = addressesData.result
            if (addressesData) {
                setCollectAddressesData(addressesData);
            } else {
                console.log("erreur");
            }
        } catch (error) {
            return false;
        }
    }

    async function getShortestRoute() {
        try {
            let res = await fetch(`${baseUrl}/api/collects/get/getShortestRoute/${collectId}`, { method: "GET", credentials: "include" });
            let minDistance = await res.json();
            minDistance = minDistance.result
            if (res) {
                setShortestDist(minDistance);
                /*if (initMapStatus) {
                    setInitMapStatus(false);
                    initMap(minDistance);
                }*/
            } else {
                console.log("erreur");
            }
        } catch (error) {
            return false;
        }
    }

    async function deleteCollect() {
        let res = ""
        let message = ""
        try {
            res = await fetch(`${baseUrl}/api/collects/delete/${collectId}`, {
                method: "PATCH",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                }
            });
        } catch (error) {
            console.error("Error deleting collect:", error);
        }

        if(res.status === 200){
            message = "Suppression effectuée avec succès";
            const afficheMessage = document.getElementById("message");
            afficheMessage.innerText = message;
            document.getElementById("message").style.display = "block";
        } else {
            message = "Suppression impossible";
            const afficheMessage = document.getElementById("message");
            afficheMessage.innerText = message;
            document.getElementById("message").style.display = "block";
        }
    }


    async function getRoute(map, start, end, inter) {
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
        console.log(route);
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

    function initMap(shortestDistList) {
        const mapElement = document.getElementById("map");
        //const mapBoxContainer = document.getElementById("mapBoxRoadContainer");
        if (mapElement === null) return;

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

        console.log(waypoints);

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
            //map.setMaxBounds(bounds);
            map.fitBounds(bounds, { padding: 20 });

            map.on('load', async () => {
                await getRoute(map, waypoints.start, waypoints.end, waypoints.inter);

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

    useEffect(() => {
        mapboxgl.accessToken = accessToken;
        getCollect();
        getPartnerByCollect();
        getShortestRoute();
    }, []);

    function showModifyPopup() {
        setVisibilityModifyPopup(true);
    }

    function showDetailStockPopup() {
        setVisibilitDetailStockPopup(true);
    }

    const currentDate = moment();

    return (
        <>
            <WareHouseHeader />
            <div className="warehouseBody">
                <SideHeaderWarehouse />
                <div className="warehouseContent">
                    <span
                        className="material-symbols-outlined pointer"
                        onClick={() => { navigate("/collects") }}
                    >
                        arrow_back
                    </span>
                    <div className="detailCollect">
                        <h2 className="text-center">Récolte n°{collectId}</h2>
                        <div className="event-informations-container justify-around flexbox-row">
                            <div className="flexbox-column align-center event-informations-box">
                                <div className="flexbox-row justify-center">
                                    {collectData.map(collect => (
                                        <div key={collect.id}>
                                            <div className="flexbox-row">
                                                <div className="flexbox-column event-info-box">
                                                    <h5>Date de Début</h5>
                                                    <input disabled type="text" placeholder={collect.start_date} />
                                                </div>
                                                <div className="flexbox-column event-info-box">
                                                    <h5>Date de Fin</h5>
                                                    <input disabled type="text" placeholder={collect.end_date} />
                                                </div>
                                                <div className="flexbox-column event-info-box">
                                                    <h5>Chauffeur</h5>
                                                    <input disabled type="text" placeholder={collect.driver} />
                                                </div>
                                            </div>
                                        </div>

                                    ))}
                                </div>
                                <div className="addresses-container">
                                    {collectAddressesData.map(address => (
                                        <div key={address.id} className="flexbox-column event-info-box">
                                            <h5>Adresse</h5>
                                            <input disabled type="text" placeholder={`${address.description}, ${address.address}, ${address.city}, ${address.zip_code}`} />
                                        </div>
                                    ))}
                                </div>
                                <div className="button-container">
                                    {collectData.map(collect => (
                                        !moment(collect.start_date).isBefore(currentDate) && (
                                            <div>
                                                <button onClick={showModifyPopup} className="button-modify">Modifier</button>
                                                {visibilityPopup && <ModifyCollectPopup collect={collectId} setVisibilityModifyPopup={setVisibilityModifyPopup} />}
                                            </div>
                                        )
                                    ))}

                                    <button onClick={showDetailStockPopup} className="button-detailCollect">Voir detail récolte</button>
                                    {visibilityDetaiStockPopup && <AccesDetailStockCollectPopup collect={collectId} setVisibilitDetailStockPopup={setVisibilitDetailStockPopup} />}
                                    <div>
                                        <button onClick={deleteCollect} className="button-modify">Modifier</button>
                                    </div> 
                                </div>
                                <h5 id="message"></h5>
                            </div>
                            <div>
                                <span>Chemin le plus court :</span>
                                <span>
                                    {shortestDist.sortAddresses && shortestDist.sortAddresses.map((partner, index) => (
                                        <span key={index}>
                                            {index + 1}. {partner[0]}
                                            {index !== shortestDist.sortAddresses.length - 1 && ", "}
                                        </span>
                                    ))}
                                </span>
                                {/*<div id='map'></div>*/}
                                {
                                    shortestDist.sortAddresses &&
                                    <CollectMap shortestDistList={shortestDist} />
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <WareHouseFooter />
        </>
    );
}

export default CollectDetail;