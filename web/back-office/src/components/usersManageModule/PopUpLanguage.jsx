import "../../css/components.css";
import loading from "../../assets/loading.gif";
const baseUrl = require("../../config.json").baseUrl;
const languageAllow =
  require("../../languageAllowList.json").authorizedLanguages;

const PopUpLanguage = (props) => {
  function closePopup() {
    props.setLanguagePopup(false);
  }

  async function addLanguagePopup() {
    let loadingGif = document.getElementById("loadingGif");
    loadingGif.classList.remove("displayNone");
    let select = document.getElementById("langDispo");
    try {
      let res = await fetch(`${baseUrl}/api/addTraduction`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        credentials: "include",
        body: `language_acr=${select.value}&language_name=${
          select[select.selectedIndex].innerText
        }`,
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
        <h4>Ajouter une langue</h4>
        <label htmlFor="langDispo">Langues disponibles :</label>
        <select id="langDispo">
          {languageAllow.map((language) => {
            return <option value={language[0]}>{language[1]}</option>;
          })}
        </select>
        <div className="popup-buttons-box">
          <button onClick={closePopup} className="cancel-button">
            Annuler
          </button>
          <button className="confirm-button" onClick={() => addLanguagePopup()}>
            Ajouter
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

export default PopUpLanguage;
