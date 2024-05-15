import React from "react";
import { useNavigate } from 'react-router-dom';
const baseUrl = require("../../config.json").baseUrl;

const FileBeneficiarySignIn = (props) => {
  const navigate = useNavigate();
  async function submitApplication() {
    let prevAreaTab = document.getElementsByTagName("textarea");
    let prevTab = document.getElementsByTagName("input");
    let fileTab = {}
    for (let i = 0; i < prevTab.length; i++) {
      if (
        prevTab[i].required &&
        (prevTab[i].value == "" ||
          prevTab[i].value == null ||
          prevTab[i].value == undefined)
      ) {
        document.getElementById("errorMsg").textContent =
          "Vous devez renseigner tous les champs obligatoires";
        return false;
      }
      if (
        prevTab[i].value != "" &&
        prevTab[i].value != null &&
        prevTab[i].value != undefined
      ) {
        fileTab[prevTab[i].name] = prevTab[i].files[0];
      }
    }
    for (let i = 0; i < prevAreaTab.length; i++) {
      if (
        prevAreaTab[i].required &&
        (prevAreaTab[i].value == "" ||
          prevAreaTab[i].value == null ||
          prevAreaTab[i].value == undefined)
      ) {
        document.getElementById("errorMsg").textContent =
          "Vous devez renseigner tous les champs obligatoires";
        return false;
      }
      if (
        prevAreaTab[i].value != "" &&
        prevAreaTab[i].value != null &&
        prevAreaTab[i].value != undefined
      ) {
        if(prevAreaTab[i].value.length > 255){
          document.getElementById("errorMsg").textContent =
          "Merci d'écrire 255 caractères maximum";
        return false;
        }else{
          props.personnalInfos[prevAreaTab[i].name] = prevAreaTab[i].value;
        }
      }
    }
    document.getElementById("errorMsg").textContent = "";
    try {
      let form = new FormData;
      for(let key in props.personnalInfos){
        form.append(key, props.personnalInfos[key]);
      }
      for(let key in fileTab){
        form.append(key, fileTab[key], fileTab[key].name);
      }
      let res = await fetch(
        `${baseUrl}/api/beneficiaries/registerBeneficiaries`,
        {
          method: "POST",
          mode: "cors",
          headers: {
            //"Content-Type": "multipart/form-data",
            "Access-Control-Allow-Origin": "origin",
            Accept: "*/*",
            "Access-Control-Allow-Credentials": "true",
          },
          credentials: "include",
          body: form,
        }
      );
      if (res.status === 200){
        document.getElementById("errorMsg").textContent = "";
          navigate('/profilUsers', { replace: true });
      }else
        document.getElementById("errorMsg").textContent =
          "Une erreur est survenue lors de l'inscription, vérifiez les données que vous envoyez ou essayez de vous connecter";
    } catch (error) {
      document.getElementById("errorMsg").textContent =
        "Une erreur est survenue lors de l'inscription";
    }
  }

  return (
    <>
      <div className="containerFileSignInBeneficiary">
        <div className="textAreaSignInBeneficiary">
          <label htmlFor="reasonApplication" className="required">
            Raison de la candidature (255 mots maximum)
          </label>
          <textarea
            name="reason_application"
            id="reasonApplication"
            cols="50"
            rows="10"
            required
          ></textarea>
        </div>
        <div className="uploadFilesContainer">
          <h2>Attestation :</h2>
          <div className="rowContainer">
            <div className="fileContainer">
              <label htmlFor="situation_proof">
                <span className="material-symbols-outlined">upload_file</span>
              </label>
              <p>De situation :</p>
            </div>
            <div className="fileContainer">
              <label htmlFor="debts_proof">
                <span className="material-symbols-outlined">upload_file</span>
              </label>
              <p>De dette</p>
            </div>
            <div className="fileContainer">
              <label htmlFor="payslip">
                <span className="material-symbols-outlined">upload_file</span>
              </label>
              <p className="required">De factures</p>
            </div>
            <div className="fileContainer">
              <label htmlFor="home_proof">
                <span className="material-symbols-outlined">upload_file</span>
              </label>
              <p>De logement</p>
            </div>
          </div>
          <input
            type="file"
            name="situation_proof"
            id="situation_proof"
            className="fileSignIn"
            accept="image/png, image/jpeg, image/jpg, application/pdf"
          />
          <input
            type="file"
            name="debts_proof"
            id="debts_proof"
            className="fileSignIn"
            accept="image/png, image/jpeg, image/jpg, application/pdf"
          />
          <input
            type="file"
            name="payslip"
            id="payslip"
            className="fileSignIn"
            accept="image/png, image/jpeg, image/jpg, application/pdf"
          />
          <input
            type="file"
            name="home_proof"
            id="home_proof"
            className="fileSignIn"
            accept="image/png, image/jpeg, image/jpg, application/pdf"
          />
        </div>
      </div>
      <div className="btnContainer">
        <button
          type="submit"
          id="nextSignIn"
          className="sendBtnForm sendApplicationBtn"
          onClick={submitApplication}
        >
          Suivant
        </button>
        <p id="errorMsg"></p>
      </div>
    </>
  );
};

export default FileBeneficiarySignIn;
