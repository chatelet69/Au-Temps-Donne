import React from "react";
import { useNavigate } from "react-router-dom";
import {Component, useEffect, useState} from "react";
import AdditionalInfosVolunteer from "./additionalInfoVolunteer";
const baseUrl = require("../../config.json").baseUrl;

const DispoSignInVolunteer = (props) => {
  const [workPlaces, setWorkPlaces] = useState([]);
  
  useEffect(() => {
    getAllWorkPlaces()
  }, [])

  async function getAllWorkPlaces() {
    try {
      let res = await fetch(`${baseUrl}/api/work_places/getAll`, {method: "GET", credentials:"include"});
      let data = await res.json();
      if (res.status === 200) {
        setWorkPlaces(data.workPlaces);
        document.getElementById("errorMsg").textContent = "";
      }else{
        document.getElementById("errorMsg").textContent =
          "Une erreur est survenue durant la récupération des lieux";
      }
    } catch (error) {
      console.log(error);
    }
  }

  function submitPersonnalInfos() {
    try {
      let dispoTab = document.getElementsByName("disponibility_type");
      let daysTab = document.getElementsByName("disponibility_days");
      let selectTab = document.getElementsByTagName("select");
      let tab = {}
      for (let i = 0; i < dispoTab.length; i++) {
        if (dispoTab[i].checked == true){
          tab["disponibility_type"] = parseInt(dispoTab[i].value);
        }
      }
      for (let i = 0; i < daysTab.length; i++) {
        if (daysTab[i].checked == true){
          tab["disponibility_days"] = parseInt(daysTab[i].value);
        }
      }
      for (let i = 0; i < selectTab.length; i++) {
        tab[selectTab[i].name] = parseInt(selectTab[i].value);
      }
  
      for (let key in props.personnalInfos) {
        tab[key] = props.personnalInfos[key];
      }
      document.getElementById("errorMsg").textContent = "";
      document.getElementById("PjSignIn").classList.remove("futurStepSignIn");
      document.getElementById("PjSignIn").classList.add("actualStepSignIn");
      document.getElementById("dispoSignIn").classList.add("futurStepSignIn");
      document.getElementById("dispoSignIn").classList.remove("actualStepSignIn");
      props.changeModule(
        <AdditionalInfosVolunteer
          changeModule={props.changeModule}
          personnalInfos={tab}
        />
      );
    } catch (error) {
      console.log(error)
    }
  }


  return (
    <>
      <div className="dispoType">
        <p className="required">Type de disponibilités :</p>
        <div className="dispoTypeContainer">
          <div>
            <input
              type="radio"
              name="disponibility_type"
              id="dispoRegul"
              value="0"
              className="radioCheckInput"
              checked
            />
            <label htmlFor="dispoRegul">Disponibilités régulières</label>
          </div>
          <div>
            <input
              type="radio"
              name="disponibility_type"
              id="dispoPonct"
              value="1"
              className="radioCheckInput"
            />
            <label htmlFor="dispoPonct">Disponibilités ponctuelles</label>
          </div>
        </div>
      </div>
      <div className="timeByWeeks">
        <p className="required">
          Combien de temps par semaine voulez-vous nous accorder ?
        </p>
        <div>
          <input
            type="radio"
            name="disponibility_days"
            id="lessOne"
            value="0"
            className="radioCheckInput"
            checked
          />
          <label htmlFor="lessOne">Demi journée / 1 journée</label>
        </div>
        <div>
          <input
            type="radio"
            name="disponibility_days"
            id="oneOrTwo"
            className="radioCheckInput"
            value="1"
          />
          <label htmlFor="oneOrTwo">Entre 1 et 2 jours</label>
        </div>
        <div>
          <input
            type="radio"
            name="disponibility_days"
            id="moreTwo"
            className="radioCheckInput"
            value="2"
          />
          <label htmlFor="moreTwo">Plus de 2 jours</label>
        </div>
      </div>
      <div className="selectContainer">
        <p className="required">Où voulez-vous nous aider</p>
        <select
          name="work_place"
          id="workPlace"
          className="signInInputs"
          required
        >
          {workPlaces.map(place => (
              <option value={place.id}>{place.place_name}</option>
            ))}
        </select>
        <ul>
        </ul>
      </div>
      <div className="btnContainerVolunteer">
        <button
          type="submit"
          id="nextSignIn"
          className="sendBtnForm volunteerNext"
          onClick={submitPersonnalInfos}
        >
          Suivant
        </button>
        <p id="errorMsg" className="signInVolunteerNextErrorMsg"></p>
      </div>
    </>
  );
};

export default DispoSignInVolunteer;
