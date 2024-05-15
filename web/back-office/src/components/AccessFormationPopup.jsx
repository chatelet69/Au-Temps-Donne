import React, {Component, useEffect, useState} from "react";
import moment from "moment/moment";
const baseUrl = require("../config.json").baseUrl;

const AccessFormationPopup = (props) => {
    const [selectedWorkPlace, setSelectedWorkPlace] = useState("");
    const [formationData, setFormationData] = useState([]);
    const [eventTypes, setEventTypes] = useState([]);
    const [workPlaces, setworkPlace] = useState([]);

    async function getAllEventTypes() {
        try {
            let res = await fetch(`${baseUrl}/events/getAllEventTypes`, {method: "GET",credentials: "include"});
            let data = await res.json();
            if (data) {
                setEventTypes(data);
            }
        } catch (error) {
            return false;
        }
    }

    async function getAllWorkPlace() {
        try {
            let res = await fetch(`${baseUrl}/api/getAllWorkPLace`, {method: "GET",credentials: "include"});
            let WorkPlaceData = await res.json();
            if (WorkPlaceData) setworkPlace(WorkPlaceData);
        } catch (error) {
            return false;
        }
    }

    const formationId =  props.formationId
    console.log("formationId", formationId)

    useEffect(() => {
        getFormation();
        getAllEventTypes();
        getAllWorkPlace();
    }, [props.setAccessFormationPopup])

    async function getFormation() {
        try {
            let res = await fetch(`${baseUrl}/api/formations/getFormation/${formationId.id}`, {
                method: "GET",
                credentials: "include",
            });
            let formation = await res.json();
            if (formation) setFormationData(formation);
        } catch (error) {
            return false;
        }
    }


    function closeAccessFormationPopup() { props.setModifyFormationPopup(false); }

    async function getEditedValuesFormation() {
        let data = {};
        let check = true;
        let message ="";
        var selectType = document.getElementById("selectFormationTypeInput");
        var valeurselectionnee = selectType.options[selectType.selectedIndex].value;
        var selectWorkPlace = document.getElementById("work_place");
        var valeurselectionneeWorkPlace = selectWorkPlace.options[selectWorkPlace.selectedIndex].value;
        var statusSelected = document.getElementById("selectFormationStatusInput");
        var valeurSelectionneStatus = statusSelected.options[statusSelected.selectedIndex].value;

        if (valeurselectionnee){
            data['type'] = valeurselectionnee;
        }
        if (valeurselectionneeWorkPlace){
            data['work_place_id_fk'] = valeurselectionneeWorkPlace;
        }
        if (valeurSelectionneStatus){
            data['status'] = valeurSelectionneStatus;
        }
        let inputs = document.querySelectorAll("#accessFormationPopup input, #accessFormationPopup select");
        inputs.forEach((element) => {
            if (element.value.length > 0
                && (element.placeholder && element.placeholder !== element.value)
                || (element.defaultValue && element.defaultValue !== element.value)) {
                data[element.name] = element.value;
            }
        });

        console.log("data: ", data)

        const dateStart = document.getElementById('datetime_start').value;
        const dateEnd = document.getElementById('datetime_end').value;
        if (moment(dateEnd).isBefore(dateStart)) {
            message = "La date de fin est avant la date de début";
            console.log("check == false La date de fin est avant la date de début")
            check = false;
        }
        if (moment(dateEnd).isBefore(moment())) {
            message = "La date de fin est dans le passé";
            console.log("check == false La date de fin est dans le passé")
            check = false;
        }
        if (moment(dateStart).isBefore(moment())) {
            message = "La date de début est dans le passé la date de début est dans le passé";
            console.log("check == false")
            check = false;
        }

        const error = document.getElementById("message");
        if (!check) {
            error.innerText = message;
            document.getElementById("message").style.display = "block";
            console.log("erreur")
        }
        else {
            document.getElementById("message").style.display = "none";
            console.log("data", data)
            return data;
        }
    }

    async function confirmSaveEditFormation(){
        let data = await getEditedValuesFormation();
        let message = "";
        let res = await fetch(`${baseUrl}/api/formations/${formationId.id}`, {
            method: "PATCH",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        let resData = await res.json();
        if (resData) {
            message = "Modification effectuée";
            const afficheMessage = document.getElementById("message");
            afficheMessage.innerText = message;
            document.getElementById("message").style.display = "block";
        }

    }
    const handleWorkPlaceChange = (event) => {
        setSelectedWorkPlace(event.target.value);
    };

    async function deleteFormationPopup(){

        let res = await fetch(`${baseUrl}/api/formations/cancel/${formationId.id}`, {
            method: "PATCH",
            credentials: "include",
        });

        if (res.status == 200) {
            props.setAccessFormationPopup(false);
        }
    }

    let status = "";
    {formationData.map((formation, index) => {
        if (formation.status == "SCHEDULED"){
            status = "Plannifiée"
        } else if (formation.status == "DONE"){
            status = "Passée"
        } else {
            status = "Annulée"
        }
        })
    }

    return (
        <div id="accessFormationPopup" className="user-module module-popup">
            <h4 className="text-center">Formation</h4>
            <section className="user-informations-section">
                {formationData.map((formation, index) => {
                    return (
                        <div key={formation.id} className="user-informations-under-section basic-informations">
                            <div className="flexbox-row">
                                <div className="flexbox-column formation-info-box">
                                    <h6>Identifiant</h6>
                                    <input type="number" placeholder={formation.id} disabled/>
                                </div>
                                <div className="flexbox-column formation-info-box">
                                    <h6>Type de formation</h6>
                                    <select name="type" id="selectFormationTypeInput">
                                        <option value="" disabled selected>{formation.activities}</option>
                                        {eventTypes.map((eventType) => {
                                            return (
                                                <option key={eventType.id} value={eventType.id}>
                                                    {eventType.name[0].toUpperCase() + eventType.name.replaceAll("_", " ").slice(1)}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>
                            </div>
                            <div className="flexbox-row">
                            <div className="flexbox-column formation-info-box">
                                    <h6>Nombre de Place</h6>
                                    <input type="number" name="nb_places" placeholder={formation.nb_places}/>
                                </div>
                                <div className="flexbox-column formation-info-box">
                                    <h6>Status</h6>
                                    <select name="status" id="selectFormationStatusInput">
                                        <option value="" disabled selected>{status}</option>
                                        <option value="SCHEDULED">Plannifiée</option>
                                        <option value="DONE">Passée</option>
                                        <option value="CANCELED">Annulée</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div className="user-informations-under-section">
                    <div className="user-infos-box email-box">
                        <h6>Date de Début</h6>
                        {formationData.map((formation, index) => (
                            <input
                                key={index}
                                name="datetime_start"
                                //value={startDate}
                                min={new Date().toISOString().slice(0, 16)}
                                defaultValue={formation.datetime_start}
                                id="datetime_start"
                                type="datetime-local"
                                //onChange={(e) => setStartDate(e.target.value)} // Mise à jour de la valeur de la date de début lorsqu'elle est modifiée
                            />
                        ))}
                    </div>
                    <div className="user-infos-box email-box">
                        <h6>Date de fin</h6>
                        {formationData.map((formation, index) => (
                            <input
                                key={index}
                                name="datetime_end"
                                id="datetime_end"
                                defaultValue={formation.datetime_end}
                                //min={startDate}
                                type="datetime-local"
                            />
                        ))}
                    </div>
                </div>
                <div className="flexbox-row">
                    <div className="flexbox-column formation-info-box">
                        <h6>Responsable</h6>
                        {formationData.map((formation, index) => (
                            <input key={index} type="text" name="user_id_fk" placeholder={formation.responsable}/>
                        ))}
                    </div>
                    <div className="flexbox-column formation-info-box">
                        <h6>Adresse</h6>
                        <select name="work_place_id_fk" id="work_place" onChange={handleWorkPlaceChange}>
                            {formationData.map((formation, index) => (
                                <option key={index} value="" disabled selected>{formation.place}</option>
                            ))}
                            {
                                workPlaces.map((workPlace, index) =>
                                    <option key={index} value={workPlace.id}>
                                        {workPlace.place_name}
                                    </option>
                                )
                            }
                        </select>
                    </div>
                </div>
            </section>
            <h5 id="message"></h5>
            <div id="accessFormationPopupButtons" className="popup-buttons-box">
                <button onClick={deleteFormationPopup} className="delete-button">Supprimer</button>
                <button onClick={confirmSaveEditFormation} className="confirm-button">Enregistrer</button>
                <button onClick={closeAccessFormationPopup} className="cancel-button">Fermer</button>
            </div>
        </div>
    );
};

export default AccessFormationPopup;