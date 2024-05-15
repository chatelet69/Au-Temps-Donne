import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useTranslation } from 'react-i18next';
const baseUrl = require("../../config.json").baseUrl;
const minioBaseUrl = require("../../config.json").minioBaseUrl;

const ApplicationsInfos = (props) => {
  const { t } = useTranslation();
  const [cookieInfos, setCookieInfos] = useState([]);
  const [volunteerApplicationInfos, setVolunteerApplicationInfos] = useState(
    []
  );
  const [beneficiaryApplicationInfos, setBeneficiaryApplicationInfos] =
    useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    verifConnexion();
  }, []);

  useEffect(() => {
    if (cookieInfos.userId) {
      whichApplication();
    }
  }, [cookieInfos]);

  function verifConnexion() {
    try {
      if (!Cookies.get("atdCookie")) {
        navigate("/error", { replace: true });
      } else {
        const decoded = jwtDecode(Cookies.get("atdCookie"));
        setCookieInfos(decoded);
      }
    } catch (error) {
      navigate("/error", { replace: true });
    }
  }

  async function whichApplication() {
    let res = await getVolunteerApplicationData();
    let res2 = await getBeneficiaryApplicationData();
    if (res) {
      setVolunteerApplicationInfos(res);
    }
    if (res2) {
      setBeneficiaryApplicationInfos(res2);
    }
    if (!res && !res2) {
      document.getElementById("errorMsg").textContent =
        "Une erreur est survenue durant la récupération de vos données personnelles.";
    }
  }

  async function downloadFile(pathFile) {
    try {
      const res = await fetch(
        `${baseUrl}/api/minIO/getFileByName?filename=${pathFile}`,
        {
          method: "GET",
          headers: { "Access-Control-Allow-Origin": "origin" },
          credentials: "include",
        }
      );
      let link = await res.json();
      if (res.status > 400) {
        document.getElementById("errorMsg").textContent =
          "Une erreur est survenue durant la récupération du fichier";
        return false;
      } else {
        document.getElementById("errorMsg").textContent = "";
        link = link.link;
        window.open(link);
      }
    } catch (error) {
      console.error("Erreur durant la récupération du fichier", error);
    }
  }

  async function getVolunteerApplicationData() {
    try {
      let res = await fetch(
        `${baseUrl}/api/volunteer/getApplicationByUserId/` + cookieInfos.userId,
        {
          method: "GET",
          credentials: "include",
        }
      );
      let data = await res.json();
      if (res.status === 200) {
        document.getElementById("errorMsg").textContent = "";
        return data.application[0];
      } else {
        return false;
      }
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async function getBeneficiaryApplicationData() {
    try {
      let res = await fetch(
        `${baseUrl}/api/beneficiaries/getBeneficiaryApplications/` +
          cookieInfos.userId,
        {
          method: "GET",
          credentials: "include",
        }
      );
      let data = await res.json();
      if (res.status === 200) {
        document.getElementById("errorMsg").textContent = "";
        return data.application;
      } else {
        return false;
      }
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async function editInfos() {
    try {
      let pTab = document.getElementsByClassName("valueProfilInfo");
      let selectTab = document.getElementsByTagName("select");
      let inputTab = document.getElementsByClassName("inputProfilInfo");
      let btnTab = document.getElementsByClassName("btnEditProfil");
      for (let k = 0; k < btnTab.length; k++) {
        if (btnTab[k].classList.contains("none")) {
          btnTab[k].classList.remove("none");
        } else {
          btnTab[k].classList.add("none");
        }
      }
      for (let j = 0; j < selectTab.length; j++) {
        if (selectTab[j].classList.contains("none")) {
          selectTab[j].classList.remove("none");
        } else {
          selectTab[j].classList.add("none");
        }
      }
      for (let i = 2; i < pTab.length; i++) {
        if (pTab[i].classList.contains("none")) {
          // si les p sont cachés
          pTab[i].classList.remove("none");
          inputTab[i - 2].classList.add("none");
        } else {
          // si les p sont affichés
          pTab[i].classList.add("none");
          inputTab[i - 2].classList.remove("none");
          inputTab[i - 2].value = pTab[i].innerHTML;
        }
      }
    } catch (error) {
      console.log(error);
      document.getElementById("errorMsg").textContent =
        "Une erreur est survenue durant l'apparation des champs";
    }
  }

  async function submitEditedInfos() {
    try {
      let selectTab = document.getElementsByTagName("select");
      let inputTab = document.getElementsByTagName("input");
      let form = new FormData();
      for (let i = 0; i < selectTab.length; i++) {
        if (
          selectTab[i].value == "" ||
          selectTab[i].value == undefined ||
          selectTab[i].value < 0
        )
          continue;
        form.append(selectTab[i].name, selectTab[i].value);
      }
      for (let i = 0; i < inputTab.length; i++) {
        if (
          inputTab[i].name == "cv" ||
          inputTab[i].name == "motivation_letter" ||
          inputTab[i].name == "criminal_record"
        ) {
          if (inputTab[i].files[0] && inputTab[i].files[0].name) {
            form.append(
              inputTab[i].name,
              inputTab[i].files[0],
              inputTab[i].files[0].name
            );
          }
        } else {
          if (inputTab[i].value == "Non renseigné") continue;
          form.append(inputTab[i].name, inputTab[i].value);
        }
      }
      let res = await fetch(
        `${baseUrl}/api/volunteers/volunteerApplication/update/` +
          cookieInfos.userId,
        {
          method: "PATCH",
          mode: "cors",
          headers: {
            "Access-Control-Allow-Origin": "origin",
            Accept: "*/*",
            "Access-Control-Allow-Credentials": "true",
          },
          credentials: "include",
          body: form,
        }
      );
      if (res.status >= 400) {
        document.getElementById("errorMsg").textContent =
          "Une erreur est survenue durant la modification de vos informations.";
        return false;
      }
      document.getElementById("errorMsg").textContent = "";
      whichApplication();
      editInfos();
    } catch (error) {
      document.getElementById("errorMsg").textContent =
        "Une erreur est survenue durant la modification de vos informations.";
      console.log(error);
      return false;
    }
  }

  async function submitBeneficiaryEditedInfos() {
    try {
      let inputTab = document.getElementsByTagName("input");
      let form = new FormData();
      for (let i = 0; i < inputTab.length; i++) {
        console.log(inputTab[i].name)
        if (
          inputTab[i].name == "debts_proof" ||
          inputTab[i].name == "home_proof" ||
          inputTab[i].name == "situation_proof" ||
          inputTab[i].name == "payslip"
        ) {
          if (inputTab[i].files && inputTab[i].files[0] && inputTab[i].files[0].name) {
            form.append(
              inputTab[i].name,
              inputTab[i].files[0],
              inputTab[i].files[0].name
            );
          }
        } else {
          if (inputTab[i].value == "Non renseigné") continue;
          
          form.append(inputTab[i].name, inputTab[i].value);
        }
      }
      let res = await fetch(
        `${baseUrl}/api/beneficiaryApplication/update/` +
          cookieInfos.userId,
        {
          method: "PATCH",
          mode: "cors",
          headers: {
            "Access-Control-Allow-Origin": "origin",
            Accept: "*/*",
            "Access-Control-Allow-Credentials": "true",
          },
          credentials: "include",
          body: form,
        }
      );
      if (res.status >= 400) {
        document.getElementById("errorMsg").textContent =
          "Une erreur est survenue durant la modification de vos informations.";
        return false;
      }
      document.getElementById("errorMsg").textContent = "";
      whichApplication();
      editInfos();
    } catch (error) {
      document.getElementById("errorMsg").textContent =
        "Une erreur est survenue durant la modification de vos informations.";
      console.log(error);
      return false;
    }
  }

  if (Object.keys(volunteerApplicationInfos).length > 0) {
    return (
      <div className="profilInfoContainer">
        <span
          class="material-symbols-outlined editIcon pointer"
          onClick={() => {
            editInfos();
          }}
        >
          edit
        </span>
        <div className="rowProfilContainer">
          <div className="containerInfoProfil">
            <p className="titleProfilInfo">{t('applicationInfoStatus')}</p>
            <p className="valueProfilInfo">
              {volunteerApplicationInfos.status == 0
                ? t('applicationInfoCandidStatusInCheck')
                : volunteerApplicationInfos.status == 1
                ? t('applicationInfoCandidStatusAccepted')
                : volunteerApplicationInfos.status == 2
                ? t('applicationInfoCandidStatusRefused')
                : t('noCompleted')}
            </p>
          </div>
          <div className="containerInfoProfil">
            <p className="titleProfilInfo">{t('applicationInfoDateSend')}</p>
            <p className="valueProfilInfo">
              {volunteerApplicationInfos.date
                ? volunteerApplicationInfos.date
                : t('noCompleted')}
            </p>
          </div>
          <div className="containerInfoProfil">
            <p className="titleProfilInfo">{t('applicationInfoDispoType')}</p>
            <p className="valueProfilInfo">
              {volunteerApplicationInfos.disponibility_type == 0
                ? t('applicationInfoCandidDispoTypeRegul')
                : volunteerApplicationInfos.disponibility_type == 1
                ? t('applicationInfoCandidDispoTypePonct')
                : t('noCompleted')}
            </p>
            <select
              name="disponibility_type"
              className="inputProfilInfo none"
              id="disponibility_type"
            >
              <option value="0">{t('applicationInfoCandidDispoTypeRegul')}</option>
              <option value="1">{t('applicationInfoCandidDispoTypePonct')}</option>
            </select>
          </div>
        </div>
        <div className="rowProfilContainer">
          <div className="containerInfoProfil">
            <p className="titleProfilInfo">
              Nombre de jours libre par semaines
            </p>
            <p className="valueProfilInfo">
              {volunteerApplicationInfos.disponibility_days == 0
                ? "Moins d'une journée"
                : volunteerApplicationInfos.disponibility_days == 1
                ? "Entre 1 et 2 jours"
                : volunteerApplicationInfos.disponibility_days == 2
                ? "Plus de deux jours"
                : t('noCompleted')}
            </p>
            <select
              name="disponibility_days"
              className="inputProfilInfo none"
              id="disponibility_days"
            >
              <option value="0">Moins d'une journée</option>
              <option value="1">Entre 1 et 2 jours</option>
              <option value="2">Plus de deux jours</option>
            </select>
          </div>
          <div className="containerInfoProfil">
            <p className="titleProfilInfo">Compétence</p>
            <p className="valueProfilInfo">
              {volunteerApplicationInfos.knowledges
                ? volunteerApplicationInfos.knowledges
                : t('noCompleted')}
            </p>
            <input
              type="text"
              className="inputProfilInfo none"
              name="knowledges"
            />
          </div>
          <div className="containerInfoProfil">
            <p className="titleProfilInfo">Remarques</p>
            <p className="valueProfilInfo">
              {volunteerApplicationInfos.remarks
                ? volunteerApplicationInfos.remarks
                : t('noCompleted')}
            </p>
            <input
              type="text"
              className="inputProfilInfo none"
              name="remarks"
            />
          </div>
        </div>
        <div className="rowProfilContainer">
          <div className="containerInfoProfil">
            <p className="titleProfilInfo">CV</p>
            <p
              className="valueProfilInfo pointer"
              onClick={() => {
                downloadFile(volunteerApplicationInfos.cv);
              }}
            >
              {volunteerApplicationInfos.cv
                ? "Cliquer pour voir le fichier"
                : t('noCompleted')}
            </p>
            <label htmlFor="cv" className="inputProfilInfo none pointer">
              Cliquer pour changer de fichier
            </label>
            <input
              type="file"
              name="cv"
              id="cv"
              accept="image/png, image/jpeg, image/jpg, application/pdf"
              hidden
            />
          </div>
          <div className="containerInfoProfil">
            <p className="titleProfilInfo">Lettre de motivation</p>
            <p
              className="valueProfilInfo pointer"
              onClick={() => {
                downloadFile(volunteerApplicationInfos.motivation_letter);
              }}
            >
              {volunteerApplicationInfos.motivation_letter
                ? "Cliquer pour voir le fichier"
                : t('noCompleted')}
            </p>
            <label
              htmlFor="motivation_letter"
              className="inputProfilInfo pointer none"
            >
              Cliquer pour changer de fichier
            </label>
            <input
              type="file"
              name="motivation_letter"
              id="motivation_letter"
              accept="image/png, image/jpeg, image/jpg, application/pdf"
              hidden
            />
          </div>
          <div className="containerInfoProfil">
            <p className="titleProfilInfo">Casier judiciaire</p>
            <p
              className="valueProfilInfo pointer"
              onClick={() => {
                downloadFile(volunteerApplicationInfos.criminal_record);
              }}
            >
              {volunteerApplicationInfos.criminal_record
                ? "Cliquer pour voir le fichier"
                : t('noCompleted')}
            </p>
            <label
              htmlFor="criminal_record"
              className="inputProfilInfo pointer none"
            >
              Cliquer pour changer de fichier
            </label>
            <input
              type="file"
              name="criminal_record"
              id="criminal_record"
              accept="image/png, image/jpeg, image/jpg, application/pdf"
              hidden
            />
          </div>
        </div>
        <div className="btnContainerEdit">
          <button
            className="btnEditProfil none red"
            onClick={() => {
              editInfos();
            }}
          >
            Annuler
          </button>
          <button
            className="btnEditProfil none green"
            onClick={() => {
              submitEditedInfos();
            }}
          >
            Enregistrer
          </button>
        </div>
      </div>
    );
  } else if (Object.keys(beneficiaryApplicationInfos).length > 0) {
    return (
      <div className="profilInfoContainer">
        <span
          class="material-symbols-outlined editIcon pointer"
          onClick={() => {
            editInfos();
          }}
        >
          edit
        </span>
        <div className="rowProfilContainer">
          <div className="containerInfoProfil">
            <p className="titleProfilInfo">Status</p>
            <p className="valueProfilInfo">
              {beneficiaryApplicationInfos.status == 0
                ? "Candidature en cours d'analyse"
                : beneficiaryApplicationInfos.status == 1
                ? "Candidature acceptée"
                : beneficiaryApplicationInfos.status == 2
                ? "Candidature refusée"
                : t('noCompleted')}
            </p>
          </div>
          <div className="containerInfoProfil">
            <p className="titleProfilInfo">Date d'envoi</p>
            <p className="valueProfilInfo">
              {beneficiaryApplicationInfos.date
                ? beneficiaryApplicationInfos.date
                : t('noCompleted')}
            </p>
          </div>
          <div className="containerInfoProfil">
            <p className="titleProfilInfo">Raison de candidature</p>
            <p className="valueProfilInfo">
              {beneficiaryApplicationInfos.reason_application
                ? beneficiaryApplicationInfos.reason_application
                : t('noCompleted')}
            </p>
            <input
              type="text"
              className="inputProfilInfo none"
              name="reason_application"
            />
          </div>
        </div>
        <div className="rowProfilContainer">
          <div className="containerInfoProfil">
            <p className="titleProfilInfo">Preuve de dette</p>
            <p
              className="valueProfilInfo pointer"
              onClick={() => {
                downloadFile(beneficiaryApplicationInfos.debts_proof);
              }}
            >
              {beneficiaryApplicationInfos.debts_proof != "null"
                ? "Cliquer pour voir le fichier"
                : t('noCompleted')}
            </p>
            <label
              htmlFor="debts_proof"
              className="inputProfilInfo pointer none"
            >
              Cliquer pour changer de fichier
            </label>
            <input
              type="file"
              name="debts_proof"
              id="debts_proof"
              accept="image/png, image/jpeg, image/jpg, application/pdf"
              hidden
            />
          </div>
          <div className="containerInfoProfil">
            <p className="titleProfilInfo">Preuve de logement</p>
            <p
              className="valueProfilInfo pointer"
              onClick={() => {
                downloadFile(beneficiaryApplicationInfos.home_proof);
              }}
            >
              {beneficiaryApplicationInfos.home_proof != "null"
                ? "Cliquer pour voir le fichier"
                : t('noCompleted')}
            </p>
            <label
              htmlFor="home_proof"
              className="inputProfilInfo pointer none"
            >
              Cliquer pour changer de fichier
            </label>
            <input
              type="file"
              name="home_proof"
              id="home_proof"
              accept="image/png, image/jpeg, image/jpg, application/pdf"
              hidden
            />
          </div>
        </div>
        <div className="rowProfilContainer">
          <div className="containerInfoProfil">
            <p className="titleProfilInfo">Fiche de paie</p>
            <p
              className="valueProfilInfo pointer"
              onClick={() => {
                downloadFile(beneficiaryApplicationInfos.payslip);
              }}
            >
              {beneficiaryApplicationInfos.payslip != "null"
                ? "Cliquer pour voir le fichier"
                : t('noCompleted')}
            </p>
            <label
              htmlFor="payslip"
              className="inputProfilInfo pointer none"
            >
              Cliquer pour changer de fichier
            </label>
            <input
              type="file"
              name="payslip"
              id="payslip"
              accept="image/png, image/jpeg, image/jpg, application/pdf"
              hidden
            />
          </div>
          <div className="containerInfoProfil">
            <p className="titleProfilInfo">Preuve de votre situation</p>
            <p
              className="valueProfilInfo pointer"
              onClick={() => {
                downloadFile(beneficiaryApplicationInfos.situation_proof);
              }}
            >
              {beneficiaryApplicationInfos.situation_proof != "null"
                ? "Cliquer pour voir le fichier"
                : t('noCompleted')}
            </p>
            <label
              htmlFor="situation_proof"
              className="inputProfilInfo pointer none"
            >
              Cliquer pour changer de fichier
            </label>
            <input
              type="file"
              name="situation_proof"
              id="situation_proof"
              accept="image/png, image/jpeg, image/jpg, application/pdf"
              hidden
            />
          </div>
        </div>
        <div className="btnContainerEdit">
          <button
            className="btnEditProfil none red"
            onClick={() => {
              editInfos();
            }}
          >
            Annuler
          </button>
          <button
            className="btnEditProfil none green"
            onClick={() => {
              submitBeneficiaryEditedInfos();
            }}
          >
            Enregistrer
          </button>
        </div>
      </div>
    );
  } else {
    return (
      <div className="profilInfoContainer">
        <p>Données non trouvées</p>
      </div>
    );
  }
};

export default ApplicationsInfos;
