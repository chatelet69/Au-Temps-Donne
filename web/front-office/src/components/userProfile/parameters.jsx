import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useTranslation } from "react-i18next";

const baseUrl = require("../../config.json").baseUrl;

const Parameters = (props) => {
  const { t, i18n } = useTranslation();
  const [cookieInfos, setCookieInfos] = useState(null);
  const [languages, setLanguages] = useState([]);
  const [actualLang, setActualLang] = useState(null);
  const [paramsInfos, setparamsInfos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    verifConnexion();
    // getParamsData();
  }, []);

  useEffect(() => {
    if (cookieInfos && cookieInfos.userId) {
      console.log("ok cookie")
      getLanguageList();
      getUserLanguage();
    }
  }, [cookieInfos]);
  
  useEffect(()=>{
    if(actualLang){
      i18n.changeLanguage(actualLang);
    }
  }, [actualLang])

  const translateWebsite = () => {
    var selectElement = document.getElementById("languages");
    var selectedLanguage = selectElement.value;
    i18n.changeLanguage(selectedLanguage);
    setUserLanguage(selectedLanguage);
  };

  function deleteLogCookie() {
    if (Cookies.get("atdCookie")) {
      document.cookie = "atdCookie=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
    }
  }

  function popUpDisplay() {
    let popup = document.getElementById("popUpDelete");
    if (popup.classList.contains("none")) {
      popup.classList.remove("none");
    } else {
      popup.classList.add("none");
    }
  }

  function verifConnexion() {
    try {
      if (!Cookies.get("atdCookie")) {
        navigate("/login", { replace: true });
      } else {
        const decoded = jwtDecode(Cookies.get("atdCookie"));
        setCookieInfos(decoded);
      }
    } catch (error) {
      navigate("/login", { replace: true });
    }
  }

  async function setUserLanguage(language) {
    try {
      let res = await fetch(
        `${baseUrl}/api/setLanguage/` + cookieInfos.userId,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          credentials: "include",
          body: `language=${language}:`,
        }
      );
      if (res.status === 200) {
        document.getElementById("errorMsg").textContent = "";
      } else {
        document.getElementById("errorMsg").textContent =
          "Une erreur est survenue durant le changement de langue";
      }
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async function getUserLanguage() {
    try {
      console.log("OKK" + cookieInfos.userId)
      let res = await fetch(`${baseUrl}/api/getLanguage/` + cookieInfos.userId,{credentials: "include"});
      let data = await res.json();
      if (res.status === 200) {
        document.getElementById("errorMsg").textContent = "";
        setActualLang(data.language);
        let select = document.getElementsByTagName("select")[0];
        setTimeout(() => {
          for (let i = 0; i < select.options.length; i++) {
            if (select.options[i].value == data.language)
              select.selectedIndex = i;
          }
        }, 100);
      } else {
        document.getElementById("errorMsg").textContent =
          "Une erreur est survenue durant le changement de langue";
      }
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async function deleteAccount() {
    try {
      let res = await fetch(`${baseUrl}/users/` + cookieInfos.userId, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.status === 200) {
        document.getElementById("errorMsg").textContent = "";
        popUpDisplay();
        deleteLogCookie();
        navigate("/", { replace: true });
      } else {
        document.getElementById("errorMsg").textContent =
          "Une erreur est survenue durant la suppression de votre compte";
      }
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async function getLanguageList() {
    try {
      let res = await fetch(`${baseUrl}/api/getLanguages`);
      if (res.status === 200) {
        let data = await res.json();
        let languages = data.languages;
        document.getElementById("errorMsg").textContent = "";
        setLanguages(languages);
      } else {
        document.getElementById("errorMsg").textContent =
          "Une erreur est survenue durant la sélection des languages";
      }
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  if (!cookieInfos) {
    return <div>Loading...</div>;
  } else {
    return (
      <>
        <div className="paramsContainer">
          <div className="paramsCol">
            <div className="paramsInfo">
              <p className="titleProfilInfo">{t("paramsEditPfp")}</p>
              <label htmlFor="pfp">
                <span class="material-symbols-outlined">upload</span>
              </label>
              <input
                type="file"
                name="pfp"
                id="pfp"
                accept="image/png, image/jpeg, image/jpg"
                className="pointer"
                hidden
              />
            </div>
            <div className="paramsInfo">
              <p className="titleProfilInfo">{t("paramsDarkMode")}</p>
              <input type="checkbox" />
            </div>
            <div className="paramsInfo">
              <p className="titleProfilInfo">Newsletter</p>
              <input type="checkbox" />
            </div>
          </div>
          <div className="paramsCol">
            <div className="paramsInfo">
              <p className="titleProfilInfo">Notifications</p>
              <input type="checkbox" />
            </div>
            <div className="paramsInfo">
              <p className="titleProfilInfo">{t("paramsLanguageLabel")}</p>
              <select
                name="languages"
                id="languages"
                onChange={() => translateWebsite("fr")}
              >
                {languages.map((language) => {
                  return (
                    <option value={language.language_acr}>
                      {language.language_name}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="paramsInfo">
              <p
                className="deleteAccount pointer"
                onClick={() => popUpDisplay()}
              >
                {t("paramsDeleteAccount")}
              </p>
              <div className="none" id="popUpDelete">
                <p className="areYouSure">{t("paramsAreYouSure")}</p>
                <p className="no pointer" onClick={() => popUpDisplay()}>
                  {t("paramsDeleteAccountNo")}
                </p>
                <p className="yes pointer" onClick={() => deleteAccount()}>
                  {t("paramsDeleteAccountYes")}
                </p>
              </div>
            </div>
          </div>
        </div>
        <p id="errorMsg"></p>
      </>
    );
  }
};

export default Parameters;
