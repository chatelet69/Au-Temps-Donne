import React from "react";
import defaultPfp from "../../assets/Default_pfp.png"
import "../../css/components.css";
import "../../css/application.css";
import AllBeneficiaryApplications from "./ViewBeneficiariesApplications";

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

const DetailsBeneficiaryApplication = (props) => {

  const validBeneficiaryApplications = async (idApplication) => {
    try {
      const res = await fetch(
        `${baseUrl}/api/beneficiaryApplication/accept/${idApplication}`,
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

  const refuseBeneficiaryApplications = async (idApplication) => {
    try {
      const res = await fetch(
        `${baseUrl}/api/volunteers/beneficiaryApplication/refuse/${idApplication}`,
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
          onClick={() => props.changeModule(<AllBeneficiaryApplications changeModule={props.changeModule} />)}>
          arrow_back
        </span>
        <h1 className="applicationTitle">
          Candidature {props.application.name} {props.application.lastname}, {props.application.date}
        </h1>
      </div>
      
      <div className="applicationDetailsInfos">
        <div className="pfpBeneficiaryContainer">
            <img src={props.application.pfp == "null" ? defaultPfp : props.application.pfp} alt="Photo de profil" className="pfpBeneficiary"></img>
        </div>
        <div className="personnalInformations">
          <h2 className="containerTitle">Informations personnelles</h2>
          <div className="containerPersonnalInformations">
            <div className="personnalInformationsDetails">
              <p>Sexe : {props.application.gender == 1 ? "Homme" : props.application.gender == 2 ? "Femme" : props.application.gender == 3 ? "Autre" : "Non renseigné"}</p>
              <p>Date de naissance : {props.application.birthday}</p>
              <p>Téléphone : {props.application.phone}</p>
              <p>Email : {props.application.email != "null" ? props.application.email : "Non renseigné"}</p>
              <p>Ville : {props.application.address != "null" ? props.application.address : "Non renseigné"}</p>
              <p>Situation : {props.application.situation}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="applicationDetailsInfos detailsInfoFile">
      <div className="dispoInfos">
          <h2 className="containerTitle ">Raison candidature</h2>
          <div className="containerDispo">
            <p>{props.application.reason_application}</p>
          </div>
        </div>
        <div className="fileContainerContainer">
          <h2 className="containerTitle">Pièces jointes</h2>
          <div className="containerFile">
            <div className="fileContainer">
                <p>{props.application.payslip.split('/').pop()}</p>
                <span class="material-symbols-outlined download-icon" onClick={() => downloadFile(props.application.payslip)}>download</span>
            </div>
            {props.application.situation_proof != "null" && (
                <div className="fileContainer">
                <p>{props.application.situation_proof.split('/').pop()}</p>
                <span class="material-symbols-outlined download-icon" onClick={() => downloadFile(props.application.situation_proof)}>download</span>
            </div>
            )
            }
            {props.application.debts_proof != "null" && (
                <div className="fileContainer">
                <p>{props.application.debts_proof.split('/').pop()}</p>
                <span class="material-symbols-outlined download-icon" onClick={() => downloadFile(props.application.debts_proof)}>download</span>
            </div>
            )
            }
            {props.application.home_proof != "null" && (
                <div className="fileContainer">
                <p>{props.application.home_proof.split('/').pop()}</p>
                <span class="material-symbols-outlined download-icon" onClick={() => downloadFile(props.application.home_proof)}>download</span>
            </div>
            )
            }
          </div>
        </div>
      </div>
        <div className="btnValidOrNot">
          {props.application.status == 0 && (
            <div>
            <button className="refuseBtn" onClick={() => {refuseBeneficiaryApplications(props.application.id); props.changeModule(<AllBeneficiaryApplications changeModule={props.changeModule}/>)}}>Refuser</button>          
            <button className="validBtn" onClick={() => {validBeneficiaryApplications(props.application.id); props.changeModule(<AllBeneficiaryApplications changeModule={props.changeModule}/>)}}>Accepter</button>          
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

export default DetailsBeneficiaryApplication;