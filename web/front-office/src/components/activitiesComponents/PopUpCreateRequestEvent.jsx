import React, { useEffect, useState } from "react";
const baseUrl = require("../../config.json").baseUrl;

const PopUpCreateEvent = (props) => {

    async function sendRequestEvent() {
        try {
            let type_event_id_fk = document.getElementById("type_event_id_fk").value
            let description = document.getElementById("description").value
            let place = document.getElementById("place").value
            let start_datetime = document.getElementById("start_datetime").value
            let end_datetime = document.getElementById("end_datetime").value
            let beneficiary_id_fk = props.userInfos.userId
            let status = 0
            if(!type_event_id_fk || !description || !place || !start_datetime || !end_datetime || !beneficiary_id_fk) document.getElementById("errorPostRequest").textContent = "Merci de remplir tous les champs"
            let res = await fetch(baseUrl+"/events/requestEvent", {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded"
            },
            body: `type_event_id_fk=${type_event_id_fk}&description=${description}&place=${place}&start_datetime=${start_datetime}&end_datetime=${end_datetime}&beneficiary_id_fk=${beneficiary_id_fk}&status=${status}`
          });
          console.log(`type_event_id_fk=${type_event_id_fk}&description=${description}&place=${place}&start_datetime=${start_datetime}&end_datetime=${end_datetime}&beneficiary_id_fk=${beneficiary_id_fk}&status=${status}`)
          let data = await res.json()
          if(!data.error){
            props.getRequestActivity()
            props.changepopUpCreateRequestState(false)
          }else document.getElementById("errorPostRequest").textContent = data.error
        } catch (error) {
          console.log(error)
          document.getElementById("errorPostRequest").textContent = "Erreur lors de l'envoi de la demande"
        }
      }

    return(
        <div className="activityPopUpContainer">
            <h3>Demander une activité</h3>
            <div>
                <h4>Type d'event :</h4>
                <select name="type_event_id_fk" id="type_event_id_fk">
                    <option value="2">Activité</option>
                    <option value="4">Visite à domicile</option>
                    <option value="6">Soutien scolaire</option>
                    <option value="8">Transport</option>
                </select>
            </div>
            <div>
                <h4>Date de début :</h4>
                <input type="datetime-local" name="start_datetime" id="start_datetime" />
            </div>
            <div>
                <h4>Date de fin :</h4>
                <input type="datetime-local" name="end_datetime" id="end_datetime" />
            </div>
            <div>
                <h4>Description</h4>
                <input type="text" name="description" id="description" />
            </div>
            <div>
                <h4>Emplacement</h4>
                <input type="text" name="place" id="place" />
            </div>
            <div className="btnBoxPopUp">
                <button onClick={() => props.changepopUpCreateRequestState(false)}>Fermer</button>
                <button onClick={() => sendRequestEvent()}>Demander</button>
            </div>
            <p id="errorPostRequest"></p>
        </div>
    );
}

export default PopUpCreateEvent;