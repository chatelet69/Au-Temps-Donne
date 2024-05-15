import React from "react";
import { useNavigate } from "react-router-dom";
const baseUrl = require("../../config.json").baseUrl;

const AdditionalInfosVolunteer = (props) => {
  const navigate = useNavigate();
  async function submitApplication() {
    try {
      if(document.getElementById("rgpdCheckBox").checked == false) {
        document.getElementById("errorMsg").textContent = "Vous devez accepter la politique des données personnelles";
        return false;
      }
      let areaTab = document.getElementsByTagName("textarea");
      let newsletter = document.getElementById("newsletterCheckBox");
      let prevfileTab = document.getElementsByClassName("fileSignIn");
      
      let fileTab = {}
      let form = new FormData;
      for (let i = 0; i < areaTab.length; i++) {
        if (areaTab[i].required && (areaTab[i].value == "" || areaTab[i].value == null || areaTab[i].value == undefined)) {
          document.getElementById("errorMsg").textContent = "Vous devez renseigner tous les champs obligatoires";
          return false;
        }
        if (areaTab[i].value != "" && areaTab[i].value != null && areaTab[i].value != undefined) {
          form.append(areaTab[i].name, areaTab[i].value)
        }
      }
      for (let i = 0; i < prevfileTab.length; i++) {
        if (prevfileTab[i].required && (prevfileTab[i].value == "" || prevfileTab[i].value == null || prevfileTab[i].value == undefined)) {
          document.getElementById("errorMsg").textContent = "Vous devez renseigner tous les champs obligatoires";
          return false;
        }
        if (prevfileTab[i].value != "" && prevfileTab[i].value != null && prevfileTab[i].value != undefined) {
          form.append(prevfileTab[i].name, prevfileTab[i].files[0], prevfileTab[i].files[0].name)
        }
      }
      console.log(newsletter.checked)
      newsletter.checked ? form.append("newsletter", 1) : form.append("newsletter", 0)
      for(let key in props.personnalInfos){
        form.append(key, props.personnalInfos[key]);
      }
      let res = await fetch(
        `${baseUrl}/api/volunteers/registerVolunteer`,
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
      console.log(error);
    }
  }

  return (
    <>
      <div className="containerFileSignInVolunteer">
        <div className="textAreaSignInBeneficiary">
          <label htmlFor="knowledges" className="required">
            Dites nous ce que vous savez faire et comment vous voudriez nous
            aider ! (255 mots maximum)
          </label>
          <textarea
            name="knowledges"
            id="knowledges"
            cols="50"
            rows="10"
            className="textAreaSignIn"
            required
          ></textarea>
        </div>
        <div className="textAreaSignInBeneficiary">
          <label htmlFor="remarks">
            Autres remarques (facultatif)
          </label>
          <textarea
            name="remarks"
            id="remarks"
            cols="50"
            rows="10"
            className="textAreaSignIn"
          ></textarea>
        </div>
      </div>
      <p className="textForFilesVolunteer">
        Afin de mieux vous connaitre et afin de cibler au mieux les opportunités
        de bénévolats qui vous correspondent le mieux, vous pouvez nous fournir
        votre C.V, un extrait de casier judiciaire puis une lettre de motivation
        ou un autre document résumant votre parcours et vos compétences.
      </p>
      <div className="containerUploadFilesContainer">
        <div className="uploadFilesContainer">
          <div className="rowContainer">
            <div className="fileContainer">
              <label htmlFor="cv">
                <span className="material-symbols-outlined">upload_file</span>
              </label>
              <p className="required">CV</p>
            </div>
            <div className="fileContainer">
              <label htmlFor="criminal_record">
                <span className="material-symbols-outlined">upload_file</span>
              </label>
              <p className="required">Casier judiciaire</p>
            </div>
            <div className="fileContainer">
              <label htmlFor="motivation_letter">
                <span className="material-symbols-outlined">upload_file</span>
              </label>
              <p>Lettre de motivation</p>
            </div>
          </div>
          <input
            type="file"
            name="cv"
            id="cv"
            className="fileSignIn"
            accept="image/png, image/jpeg, image/jpg, application/pdf"
            required
          />
          <input
            type="file"
            name="criminal_record"
            id="criminal_record"
            className="fileSignIn"
            accept="image/png, image/jpeg, image/jpg, application/pdf"
            required
          />
          <input
            type="file"
            name="motivation_letter"
            id="motivation_letter"
            className="fileSignIn"
            accept="image/png, image/jpeg, image/jpg, application/pdf"
          />
        </div>
      </div>
      <div className="separation">
        <div>
          <input
            name="newsletter"
            type="checkbox"
            id="newsletterCheckBox"
            className="radioCheckInput"
          />
          <label htmlFor="newsletterCheckBox">
            Je souhaite recevoir des informations de la part de Au Temps Donné
          </label>
        </div>
        <div>
          <input
            name="acceptPolitics"
            type="checkbox"
            id="rgpdCheckBox"
            className="radioCheckInput"
          />
          <label htmlFor="rgpdCheckBox" className="required">
            J'accepte le traitement informatisé des données nominatives qui me
            concernent comme indiqué dans la politique de données personnelles.
          </label>
        </div>
        <p className="rgpdText">
          J'accepte le traitement informatisé des données nominatives qui me
          concernent en conformité avec le Règlement (UE) 2016/679, la directive
          (UE) 2016/80 du 27 avril 2016 et les dispositions de la loi n°2004-801
          du 6 août 2004 relative à la protection des personnes et modifiant la
          loi n° 78-17 du 6 janvier 1978 relative à l'informatique, aux fichiers
          et aux libertés. Comme indiqué dans la politique de protection des
          données personnelles (liens vers une page de présentation de cette
          politique), j'ai noté que je pourrai exercer mon droit d'accès et de
          rectification garanti par les articles 39 et 40 de cette loi en
          m'adressant auprès du webmaster de Au Temps Donné
          autempsdonne@gmail.com{" "}
        </p>
        <p className="required-before rgpdText redColor">Champs obligatoires</p>
      </div>
      <div className="btnContainer">
        <button
          type="submit"
          id="nextSignIn"
          className="sendBtnForm sendApplicationBtn"
          onClick={submitApplication}
        >
          Envoyer
        </button>
        <p id="errorMsg"></p>
      </div>
    </>
  );
};

export default AdditionalInfosVolunteer;
