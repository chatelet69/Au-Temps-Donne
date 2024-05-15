import "../../css/components.css";
import loading from "../../assets/loading.gif";
import { useEffect, useState } from "react";
const baseUrl = require("../../config.json").baseUrl;
const languageAllow =
  require("../../languageAllowList.json").authorizedLanguages;

const UpdateTradPopUp = (props) => {
  function closePopup() {
    props.setUpdateTradPopup(false);
  }

  async function updateTranslations() {
    let loadingGif = document.getElementById("loadingGif");
    loadingGif.classList.remove("displayNone");
    let select = document.getElementById("langDispo");
    try {
      let res = await fetch(`${baseUrl}/api/updateTraductions`, {
        method: "GET",
        credentials: "include",
      });

      if (res.status == 200) {
        loadingGif.classList.add("displayNone");
        document.getElementById("errorMsg").textContent = "";
        closePopup();
      } else {
        loadingGif.classList.add("displayNone");
        document.getElementById("errorMsg").textContent = "Erreur.";
      }
    } catch (error) {
      return false;
    }
  }

    return (
      <div id="addLanguagePopUp" className="events-module module-popup">
        <h4>Êtes vous sur de vouloir mettre à jour le fichier des langues ?</h4>
        <p>Cette opération peut prendre plusieurs minutes.</p>
        <div className="popup-buttons-box">
          <button onClick={closePopup} className="cancel-button">
            Non
          </button>
          <button className="confirm-button" onClick={() => updateTranslations()}>
            Oui
          </button>
        </div>
        <img
          src={loading}
          alt="loading gif"
          id="loadingGif"
          className="displayNone"
        />
        <p id="errorMsg"></p>
      </div>
    );
};

export default UpdateTradPopUp;
