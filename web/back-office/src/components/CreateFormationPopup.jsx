import moment from "moment";
import "../css/components.css"
import React, {useEffect, useState} from "react";
import SuccessActionPopup from "./functionsComponents/SuccessActionPopup";
const baseUrl = require("../config.json").baseUrl;



const CreateFormationPopup = (props) => {
    const [startDate, setStartDate] = useState("");
    const [eventTypes, setEventTypes] = useState([]);
    const [workPlaces, setworkPlace] = useState([]);
    const [successActionPopup, setSuccessActionPopup] = useState(false);

    useEffect(() => {
        getAllEventTypes();
        getAllWorkPlace();
    }, [props.setVisibilityPopup])

    async function getAllEventTypes() {
        try {
            let res = await fetch(`${baseUrl}/events/getAllEventTypes`, {method: "GET",credentials: "include"});
            let data = await res.json();
            if (data) setEventTypes(data);
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

    function checkInputData() {
        let check = true;
        let message ="";
        const inputs = document.querySelectorAll("#createNewEventPopup input, #createNewEventPopup select");
        inputs.forEach((input) => {
            if (input.value === "") {
                input.style.border = "2px solid red";
                check = false;
            }
        });

        const dateStart = document.getElementById('startDatetimeInput').value;
        const dateEnd = document.getElementById('endDatetimeInput').value;
        if (moment(dateEnd).isBefore(dateStart)) {
            message = "La date de fin est avant la date de début";
            check = false;
        }
        if (moment(dateEnd).isBefore(moment())) {
            message = "La date de fin est dans le passé";
            check = false;
        }
        if (moment(dateStart).isBefore(moment())) {
            message = "La date de début est dans le passé";
            check = false;
        }

        const forgotValuesNewEvent = document.getElementById("forgotValuesNewEvent");
        if (!check) {
            forgotValuesNewEvent.innerText = message;
            document.getElementById("forgotValuesNewEvent").style.display = "block";
        }
        else {
            document.getElementById("forgotValuesNewEvent").style.display = "none";
        }

        return true;
    }
    function closeCreateFormationPopup() { props.setVisibilityPopup(false); }

    async function confirmCreateEvent() {
        if (checkInputData()) {
            const data =  {
                title: document.getElementById('titleFormation').value,
                work_place: parseInt(document.getElementById('selectWorkPlaceInput').value, 10),
                date_start: document.getElementById('startDatetimeInput').value,
                date_end: document.getElementById('endDatetimeInput').value,
                nb_place: parseInt(document.getElementById('nbPlaceInput').value, 10),
                type: parseInt(document.getElementById('selectFormationTypeInput').value, 10),
                user: parseInt(document.getElementById('selectFormationResponsableInput').value, 10)
            }

            let res = await fetch(`${baseUrl}/api/formations/`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });

            let resData = await res.json();
            if (resData && resData.message === "Formation ajoutée avec succès") {
                props.setVisibilityPopup(false);
            }
        } else {
            return;
        }
    }

    return (
        <div id="createNewEventPopup" className="events-module module-popup">
            <h4>Créer une nouvelle formation</h4>
            <div className="event-create-form flexbox-column">
                <div className="event-create-inputs-container">
                    <input id="titleFormation" type="text" name="title" placeholder="Titre"/>
                </div>
                <div className="event-create-inputs-container">
                    <select name="formation_type" id="selectFormationTypeInput">
                        <option value="">Type de formation</option>
                        {
                            eventTypes.map((eventType) =>
                                <option value={eventType.id}>
                                    {eventType.name[0].toUpperCase() + eventType.name.replaceAll("_", " ").slice(1)}
                                </option>
                            )
                        }
                    </select>
                    <input
                        name="nbPlace"
                        id="nbPlaceInput"
                        max={255}
                        min={0}
                        type="number"
                        placeholder="Place"
                    />
                </div>
                <div className="event-create-inputs-container">
                    <div>
                        <h5>Date de début</h5>
                        <input
                            name="start_datetime"
                            value={startDate}
                            min={new Date().toISOString().slice(0, 16)}
                            id="startDatetimeInput"
                            type="datetime-local"
                            onChange={(e) => setStartDate(e.target.value)} // Mise à jour de la valeur de la date de début lorsqu'elle est modifiée
                        />
                    </div>
                    <div>
                        <h5>Date de fin</h5>
                        <input
                            name="end_datetime"
                            id="endDatetimeInput"
                            min={startDate}
                            type="datetime-local"
                        />
                    </div>
                </div>
                <div className="event-create-inputs-container">
                    <select name="event_responsable" id="selectFormationResponsableInput">
                        <option value="">Responsable de la formation</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                    </select>
                    <select name="work_place" id="selectWorkPlaceInput">
                        <option value="">Lieu de l'évènement</option>
                        {
                            workPlaces.map((workPlace) =>
                                <option value={workPlace.id}>
                                    {workPlace.place_name}
                                </option>
                            )
                        }
                    </select>
                </div>
                <h5 id="forgotValuesNewEvent"></h5>
                <div className="popup-buttons-box">
                    <button onClick={closeCreateFormationPopup} className="cancel-button">Annuler</button>
                    <button onClick={confirmCreateEvent} className="confirm-button">Confirmer</button>
                </div>
            </div>
        </div>

);
}

export default CreateFormationPopup;