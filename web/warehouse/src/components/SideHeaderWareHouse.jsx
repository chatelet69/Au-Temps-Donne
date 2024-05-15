import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import "../css/headerFooter.css";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const baseUrl = require("../config.json").baseUrl;

const SideHeaderWarehouse = (props) => {
  const [actualLang, setActualLang] = useState(null);
  const [cookieInfo, setCookieInfo] = useState(null);
  const [languages, setLanguages] = useState(null);
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    verifConnexion();
  }, []);

  useEffect(() => {
    if (cookieInfo && cookieInfo.userId) {
      getLanguageList();
      getUserLanguage();
    }
  }, [cookieInfo]);

  useEffect(() => {
    if (actualLang) {
      i18n.changeLanguage(actualLang);
    }
  }, [actualLang]);

  const translateWebsite = () => {
    var selectElement = document.getElementById("languages");
    var selectedLanguage = selectElement.value;
    i18n.changeLanguage(selectedLanguage);
    setUserLanguage(selectedLanguage);
  };

  function verifConnexion() {
    try {
      if (Cookies.get("atdCookie") == null) {
        navigate("/", { replace: true });
      }else{
        setCookieInfo(jwtDecode(Cookies.get("atdCookie")))
      }
    } catch (error) {
      navigate("/", { replace: true });
    }
  }

  async function setUserLanguage(language) {
    try {
      let res = await fetch(
        `${baseUrl}/api/setLanguage/` + cookieInfo.userId,
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
        console.log("Une erreur est survenue durant le changement de langue");
      } else {
        console.log("Une erreur est survenue durant le changement de langue");
      }
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async function getUserLanguage() {
    try {
      let res = await fetch(
        `${baseUrl}/api/getLanguage/` + cookieInfo.userId,
        { credentials: "include" }
      );
      let data = await res.json();
      if (res.status === 200) {
        setActualLang(data.language);
      } else {
        console.log("Une erreur est survenue durant le changement de langue");
      }
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  useEffect(() => {
    let select = document.getElementsByTagName("select")[0];
    if (select) {
      for (let i = 0; i < select.options.length; i++) {
        if (select.options[i].value == actualLang) {
          select.selectedIndex = i;
        }
      }
    }
  }, [document.getElementsByTagName("select")[0]]);

  async function getLanguageList() {
    try {
      let res = await fetch(`${baseUrl}/api/getLanguages`);
      if (res.status === 200) {
        let data = await res.json();
        setLanguages(data.languages);
      } else {
        console.log(
          "Une erreur est survenue durant la sélection des languages"
        );
      }
    } catch (error) {
      console.log(error);
      return false;
    }

  }
  if (cookieInfo == null || !languages) {
    return (
      <div>
        <h1>Loading...</h1>
      </div>
    );
  } else {
    function changePage(path) {
      navigate('/'+path)
    }
    return (
      <div className="sideHeaderWarehouse">
        <div onClick={() => changePage("dashboard")}>
          <span class="material-symbols-outlined">dashboard</span>
          <p>Dashboard</p>
        </div>
        <div onClick={() => changePage("collects")}>
          <span class="material-symbols-outlined">pending_actions</span>
          <p>{t("sideHeaderWareHouseRecoltes")}</p>
        </div>
        <div onClick={() => changePage("stock")}>
          <span class="material-symbols-outlined">garage_door</span>
          <p>Stocks</p>
        </div>
        <div onClick={() => changePage("partners")}>
        <span class="material-symbols-outlined">handshake</span>
          <p>Partenaires</p>
        </div>
        <div onClick={() => changePage("warehouse")}>
          <span class="material-symbols-outlined">warehouse</span>
          <p>Entrepots</p>
        </div>
        <div onClick={() => changePage("local")}>
          <span class="material-symbols-outlined">apartment</span>
          <p>Locaux</p>
        </div>
        <div onClick={() => changePage("truck")}>
          <span class="material-symbols-outlined">local_shipping</span>
          <p>Camions</p>
        </div>
        <div className="rowSideHeader">
          <span class="material-symbols-outlined">light_mode</span>
          <select
            name="languages"
            id="languages"
            onChange={() => translateWebsite()}
          >
            {languages.map((language) => {
              return (
                <option value={language.language_acr}>
                  {language.language_acr}
                </option>
              );
            })}
          </select>
        </div>
      </div>
    );
  }
};

export default SideHeaderWarehouse;
