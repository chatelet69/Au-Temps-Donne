import React, { useEffect, useState } from "react";
const baseUrl = require("../../config.json").baseUrl;

const PopUpFuturActivity = (props) => {
    async function leaveEvent(){
        try {
            let res = await fetch(baseUrl+"/events/event/"+props.popUpUserActivity.id+"/beneficiaries/"+props.popUpUserActivity.linkId, {
              method: "DELETE",
              credentials: "include",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded"
              }
            });
            let data = await res.json()
            if(!data.error){
                props.setPopUpUserActivity(false)
                props.getUserActivity()
            }else document.getElementById("errorDuringDelete").textContent = data.error
          } catch (error) {
            console.log(error)
            document.getElementById("errorDuringDelete").textContent = "Erreur lors de la récupération des demandes"
          }
    }

    return(
        <div className="activityPopUpContainer">
            <h3>Activité #{props.popUpUserActivity.id}</h3>
            <div>
                <h4>Type d'event :</h4>
                <p>{props.popUpUserActivity.event_type}</p>
            </div>
            <div>
                <h4>Titre</h4>
                <p>{props.popUpUserActivity.title}</p>
            </div>
            <div>
                <h4>Description</h4>
                <p>{props.popUpUserActivity.description}</p>
            </div>
            <div>
                <h4>Date de début :</h4>
                <p>{props.popUpUserActivity.start_datetime}</p>
            </div>
            <div>
                <h4>Date de fin :</h4>
                <p>{props.popUpUserActivity.end_datetime}</p>
            </div>
            <div>
                <h4>Emplacement :</h4>
                <p>{props.popUpUserActivity.place}</p>
            </div>
            <div>
                <h4>Responsable :</h4>
                <p>{props.popUpUserActivity.responsable}</p>
            </div>
            <div className="btnBoxPopUp">
                <button onClick={() => props.setPopUpUserActivity(false)}>Fermer</button>
                <button onClick={() => leaveEvent()}>Se désinscrire</button>
            </div>
            <p id="errorDuringDelete"></p>
        </div>
    );
}

export default PopUpFuturActivity