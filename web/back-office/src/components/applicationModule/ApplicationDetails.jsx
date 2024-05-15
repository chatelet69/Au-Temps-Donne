import React from "react";
import "../../css/components.css";
import "../../css/application.css";
import AllApplications from "./ViewApplicationsModule.jsx";

const baseUrl = require('../../config.json').baseUrl;

async function downloadFile(pathFile) {
  try {
    const encodedFilename = encodeURIComponent(pathFile);
    const res = await fetch(
      `${baseUrl}/api/minIO/getFileByName?filename=${encodedFilename}`,
      {
        method: "GET",
        headers: { "Access-Control-Allow-Origin": "origin" },
        credentials: "include",
      }
    );
    let link = await res.json()
      if (res.status === 403 || link == null || link.link == null) {
        document.getElementById("errorMsg").textContent =
        "Une erreur est survenue durant la récupération du fichier";
        return false;
      }else{
        document.getElementById("errorMsg").textContent = ""
        link = link.link
        window.open(link)
      }
  } catch (error) {
    console.error("Erreur durant la récupération du fichier", error);
  }
};

const ApplicationDetails = (props) => {

  const validApplications = async (idApplication) => {
    try {
      const res = await fetch(
        `${baseUrl}/api/volunteers/volunteerApplication/accept/${idApplication}`,
        {
          method: "PATCH",
          headers: { "Access-Control-Allow-Origin": "origin" },
          credentials: "include",
        }
      );
    } catch (error) {
      console.error("Erreur lors de la validation de la candidature", error);
    }
  };

  const refuseApplications = async (idApplication) => {
    try {
      const res = await fetch(
        `${baseUrl}/api/volunteers/volunteerApplication/refuse/${idApplication}`,
        {
          method: "PATCH",
          headers: { "Access-Control-Allow-Origin": "origin" },
          credentials: "include",
        }
      );
    } catch (error) {
      console.error("Erreur lors de la validation de la candidature", error);
    }
  };

  return (
    <div className="main-module-application-detail">
      <div className="backgroundApplicationTitle">
        <span
          className="material-symbols-outlined arrowBack"
          onClick={() => props.changeModule(<AllApplications changeModule={props.changeModule} />)}>
          arrow_back
        </span>
        <h1 className="applicationTitle">
          Candidature {props.application.name} {props.application.lastname}, {props.application.date}
        </h1>
      </div>
      
      <div className="applicationDetailsInfos">
        <div className="personnalInformations">
          <h2 className="containerTitle">Informations personnelles</h2>
          <div className="containerPersonnalInformations">
            <div className="personnalInformationsDetails">
              <p>Sexe : {props.application.gender == 1 ? "Homme" : props.application.gender == 2 ? "Femme" : props.application.gender == 3 ? "Autre" : "Non renseigné"}</p>
              <p>Date de naissance : {props.application.birthday}</p>
              <p>Téléphone : {props.application.phone}</p>
              <p>Email : {props.application.email}</p>
              <p>Ville : {props.application.address}</p>
              <p>Situation : {props.application.situation}</p>
            </div>
          </div>
        </div>
        
        <div className="applicationContainer">
          <h2 className="containerTitle">Remarques</h2>
          <p>{props.application.remarks}</p>
        </div>

        <div className="applicationContainer">
          <h2 className="containerTitle">Compétences</h2>
          <p>{props.application.knowledges}</p>
        </div>
      </div>

      <div className="applicationDetailsInfos">
        <div className="dispoInfos">
          <h2 className="containerTitle ">Disponibilités</h2>
          <div className="containerDispo">
            <p>Type de disponibilités : {props.application.disponibility_type == 0 ? "Régulières" : props.application.disponibility_type == 0 ? "Ponctuelles" : "Erreur de récupération du type de disponibilité."}</p>
            <p>Jours disponibles par semaines : {props.application.disponibility_days == 0 ? "Moins d'une journée" : props.application.disponibility_days == 1 ? "Entre 1 et 2 jours" : props.application.disponibility_days == 2 ? "Plus de 2 jours" : "Erreur de récupération du nombre de jours."}</p>
            <p>Lieu choisi : {props.application.work_place}</p>
          </div>
        </div>
        
        <div className="licenseContainerContainer">
          <h2 className="containerTitle">Permis</h2>
          {props.application.car_license == 1 && (
            <div className="licensesContainer">
              <p className="license">{props.application.car_license == 1 ? "Permis voiture" : ""}</p>
              <span class="material-symbols-outlined">directions_car</span>
            </div>
          )}
          {props.application.truck_license == 1 && (
            <div className="licensesContainer">
              <p className="license">{props.application.truck_license == 1 ? "Permis poid lourd" : ""}</p>
              <span class="material-symbols-outlined">local_shipping</span>
            </div>
          )}
          {props.application.bike_license == 1&& (
            <div className="licensesContainer">
              <p className="license">{props.application.bike_license == 1 ? "Permis moto" : ""}</p>
              <span class="material-symbols-outlined">two_wheeler</span>
            </div>
          )}
        </div>

        <div className="fileContainerContainer">
          <h2 className="containerTitle">Pièces jointes</h2>
          <div className="fileContainer">
            <p>{props.application.cv.split('/').pop()}</p>
            <span class="material-symbols-outlined download-icon" onClick={() => downloadFile(props.application.cv)}>download</span>
          </div>
          {props.application.motivation_letter && (
            <div className="fileContainer">
            <p>{props.application.motivation_letter.split('/').pop()}</p>
            <span class="material-symbols-outlined download-icon" onClick={() => downloadFile(props.application.motivation_letter)}>download</span>
          </div>
          )
          }
        </div>
      </div>
        <div className="btnValidOrNot">
          {props.application.status == 0 && (
            <div>
            <button className="refuseBtn" onClick={() => {refuseApplications(props.application.id); props.changeModule(<AllApplications changeModule={props.changeModule}/>)}}>Refuser</button>          
            <button className="validBtn" onClick={() => {validApplications(props.application.id); props.changeModule(<AllApplications changeModule={props.changeModule}/>)}}>Accepter</button>          
            <p className="littleInfo">Vous ne pourrez plus revenir en arrière plus tard</p>
            </div>
          )}
          {props.application.status == 1 && (
            <div className="validate">
            <p>Accepté</p>
            <span class="material-symbols-outlined">done</span>          
            </div>
          )}
          {props.application.status == 2 && (
            <div className="refused">
                <p>Refusé</p>
                <span class="material-symbols-outlined">close</span>          
            </div>
          )}
        </div>
        <p id="errorMsg"></p>
    </div>
  );
};

export default ApplicationDetails;
