import React, { useEffect, useState } from "react";
const baseUrl = require("../../config.json").baseUrl;

const PopUpRequestInfo = (props) => {

    async function deleteRequest() {
        try {
            let res = await fetch(baseUrl+"/requestEvent/delete/"+props.popUpRequestInfoState.id, {
            method: "DELETE",
            credentials: "include",
          });
          let data = await res.json()
          if(!data.error){
            props.getRequestActivity()
            props.changePopUpRequestInfoState(false)
          }else document.getElementById("errorDeleteRequest").textContent = data.error
        } catch (error) {
          console.log(error)
          document.getElementById("errorDeleteRequest").textContent = "Erreur lors de l'envoi de la demande"
        }
      }


    return(
        <div className="activityPopUpContainer">
            <h3>Demande d'activité #{props.popUpRequestInfoState.id}</h3>
            <div>
                <h4>Type d'event :</h4>
                <p>{props.popUpRequestInfoState.type_event}</p>
            </div>
            <div>
                <h4>Description</h4>
                <p>{props.popUpRequestInfoState.description}</p>
            </div>
            <div>
                <h4>Date de début :</h4>
                <p>{props.popUpRequestInfoState.start_datetime}</p>
            </div>
            <div>
                <h4>Date de fin :</h4>
                <p>{props.popUpRequestInfoState.end_datetime}</p>
            </div>
            <div>
                <h4>Emplacement :</h4>
                <p>{props.popUpRequestInfoState.place}</p>
            </div>
            <div>
                <h4>Statut de la demande :</h4>
                <p>{props.popUpRequestInfoState.status == 0 ? "En attente" : props.popUpRequestInfoState.status == 1 ? "Validée" : "Refusée"}</p>
            </div>
            <div className="btnBoxPopUp">
                <button onClick={() => props.changePopUpRequestInfoState(false)}>Fermer</button>
                <button onClick={() => deleteRequest()}>Supprimer</button>
            </div>
            <p id="errorDeleteRequest"></p>
        </div>
    );
}

export default PopUpRequestInfo