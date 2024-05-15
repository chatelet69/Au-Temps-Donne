import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useTranslation } from 'react-i18next';

const baseUrl = require("../../config.json").baseUrl;

const ProfilInfos = (props) => {
  const { t } = useTranslation();
  const [cookieInfos, setCookieInfos] = useState([]);
  const [userInfos, setUserInfos] = useState([]);

  function verifConnexion() {
    try {
      if (!Cookies.get("atdCookie")) {
        navigate("/error", { replace: true });
        return false;
      } else {
        const decoded = jwtDecode(Cookies.get("atdCookie"));
        setCookieInfos(decoded);
        return true;
      }
    } catch (error) {
      navigate("/error", { replace: true });
      return false;
    }
  }

  async function editInfos() {
    let pTab = document.getElementsByClassName("valueProfilInfo");
    let btnTab = document.getElementsByClassName("btnEditProfil");
    let select = document.getElementsByTagName("select")[0];
    let inputTab = document.getElementsByTagName("input");
    
    if (select.classList.contains("none")) { // si input caché : 
      for (let i = 0; i < btnTab.length; i++) {
        btnTab[i].classList.remove("none");
      }
      for (let i = 0; i < inputTab.length; i++) {
        inputTab[i].classList.remove("none");
        if(inputTab[i].name && inputTab[i].name == "birthday"){
          let birthday = pTab[i+1].innerHTML;
          birthday = birthday.split("/")
          let finalBirth = birthday[2] + "-" + birthday[1] + "-" + birthday[0]
          inputTab[i].value = finalBirth;
        }else{
          inputTab[i].value = pTab[i+1].innerHTML; 
        }
      }
      for (let i = 0; i < pTab.length; i++) {
        pTab[i].classList.add("none");
      }
      select.selectedIndex=userInfos.gender - 1
      select.classList.remove("none");
    } else { // si input affichés
      for (let i = 0; i < btnTab.length; i++) {
        btnTab[i].classList.add("none");
      }
      for (let i = 0; i < inputTab.length; i++) {
        inputTab[i].classList.add("none");
      }
      for (let i = 0; i < pTab.length; i++) {
        pTab[i].classList.remove("none");
      }
      select.classList.add("none");
    }
  }

  async function getUserData() {
    try {
      let res = await fetch(`${baseUrl}/api/me`, {
        method: "GET",
        credentials: "include",
      });
      let data = await res.json();
      if (res.status === 200) {
        setUserInfos(data);
        document.getElementById("errorMsg").textContent = "";
      } else {
        document.getElementById("errorMsg").textContent =
          "Une erreur est survenue durant la récupération de vos données personnelles.";
      }
    } catch (error) {
      console.log(error);
      return false;
    }
  }
  useEffect(() => {
    let res = verifConnexion();
    if(res) getUserData();
  }, []);

  async function submitEditedInfos() {
    try {
      let select = document.getElementsByTagName("select");
      let inputTab = document.getElementsByTagName("input");
      let form = {};
      form[select[0].name] = select[0].value;
      for (let i = 0; i < inputTab.length; i++) {
        if(inputTab[i].name == "birthday"){
          form[inputTab[i].name] = inputTab[i].value;
        }else if(inputTab[i].value == "Non renseigné"){
          continue;
        }else if(inputTab[i].name == "phone" && isNaN(inputTab[i].value) && inputTab[i].value.length != 10 || inputTab[i].name == "email" && (!inputTab[i].value.includes('@') || !inputTab[i].value.includes("."))){
          document.getElementById("errorMsg").textContent = "Mauvais format de données, vérifiez votre numéro de téléphone ou votre mail."
          return false
        }else{
          form[inputTab[i].name] = inputTab[i].value;
        }
      }
      let res = await fetch(
        `${baseUrl}/users/`+cookieInfos.userId,
        {
          method: "PATCH",
          mode: "cors",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(form)
        }
      );
      if(res.status >= 400){
        document.getElementById("errorMsg").textContent = "Une erreur est survenue durant la modification de vos informations."
        return false
      }
      document.getElementById("errorMsg").textContent = ""
      getUserData();
      editInfos();
    } catch (error) {
      document.getElementById("errorMsg").textContent = "Une erreur est survenue durant la modification de vos informations."
      console.log(error)
      return false;
    }

  }

  const navigate = useNavigate();

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
            <p className="titleProfilInfo">{t('profilInfoGenderLabel')}</p>
            <p className="valueProfilInfo">
            {userInfos.gender == 1 ? t('profilInfoGenderOptionMale') : userInfos.gender == 2 ? t('profilInfoGenderOptionFemale') : userInfos.gender == 3 ? t('profilInfoGenderOptionOther') : t('noCompleted')}
            </p>
            <select
              name="gender"
              className="inputProfilInfo none"
              id="gender"
            >
              <option value="1">{t('profilInfoGenderOptionMale')}</option>
              <option value="2">{t('profilInfoGenderOptionFemale')}</option>
              <option value="3">{t('profilInfoGenderOptionOther')}</option>
            </select>
          </div>
          <div className="containerInfoProfil">
            <p className="titleProfilInfo">{t('profilInfoName')}</p>
            <p className="valueProfilInfo">
              {userInfos.name && userInfos.name != "null" ? userInfos.name : t('noCompleted')}
            </p>
            <input type="text" className="inputProfilInfo none" name="name"/>
          </div>
          <div className="containerInfoProfil">
            <p className="titleProfilInfo">{t('profilInfoUsername')}</p>
            <p className="valueProfilInfo">
              {userInfos.username && userInfos.username != "null" ? userInfos.username : t('noCompleted')}
            </p>
            <input type="text" className="inputProfilInfo none" name="username"/>
          </div>
        </div>
        <div className="rowProfilContainer">
          <div className="containerInfoProfil">
            <p className="titleProfilInfo">{t('profilInfoLastName')}</p>
            <p className="valueProfilInfo">
              {userInfos.lastname && userInfos.lastname != "null" ? userInfos.lastname : t('noCompleted')}
            </p>
            <input type="text" className="inputProfilInfo none" name="lastname"/>
          </div>
          <div className="containerInfoProfil">
            <p className="titleProfilInfo">{t('profilInfoBirthday')}</p>
            <p className="valueProfilInfo">
              {userInfos.birthday ? userInfos.birthday : t('noCompleted')}
            </p>
            <input type="date" className="inputProfilInfo none" name="birthday"/>
          </div>
          <div className="containerInfoProfil">
            <p className="titleProfilInfo">{t('profilInfoAddress')}</p>
            <p className="valueProfilInfo">
              {userInfos.address && userInfos.address != "null" ? userInfos.address : t('noCompleted')}
            </p>
            <input type="text" className="inputProfilInfo none" name="address"/>
          </div>
        </div>
        <div className="rowProfilContainer">
          <div className="containerInfoProfil">
            <p className="titleProfilInfo">Email</p>
            <p className="valueProfilInfo">
              {userInfos.email && userInfos.email != "null" ? userInfos.email : t('noCompleted')}
            </p>
            <input type="email" className="inputProfilInfo none" name="email"/>
          </div>
          <div className="containerInfoProfil">
            <p className="titleProfilInfo">{t('profilInfoPhone')}</p>
            <p className="valueProfilInfo">
              {userInfos.phone && userInfos.phone != "null" ? userInfos.phone : t('noCompleted')}
            </p>
            <input type="phone" className="inputProfilInfo none" name="phone"/>
          </div>
          <div className="containerInfoProfil">
            <p className="titleProfilInfo">{t('profilInfoSituation')}</p>
            <p className="valueProfilInfo">
              {userInfos.situation && userInfos.situation != "null" ? userInfos.situation : t('noCompleted')}
            </p>
            <input type="text" className="inputProfilInfo none" name="situation"/>
          </div>
        </div>
        <div className="btnContainerEdit">
        <button className="btnEditProfil none red" onClick={() => {editInfos();}}>{t('profilInfoCancel')}</button>
        <button className="btnEditProfil none green" onClick={()=>{submitEditedInfos()}}>{t('profilInfoSave')}</button>          
        </div>
      </div>
    );
};

export default ProfilInfos;
