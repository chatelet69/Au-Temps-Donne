import React, { useEffect, useState } from "react";
import "../css/profil.css";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import SideHeaderFront from "../components/SideHeaderFront";
import ProfilInfos from "../components/userProfile/profilInfos";
import ApplicationsInfos from "../components/userProfile/applicationsInfos";
import DonationsInfos from "../components/userProfile/donationsInfos";
import Parameters from "../components/userProfile/parameters";
import { jwtDecode } from "jwt-decode";
const minioBaseUrl = require("../config.json").minioBaseUrl;
const baseUrl = require("../config.json").baseUrl;

const ProfilPage = () => {
  const [userInfos, setUserInfos] = useState([]);
  const [actualModule, setModule] = useState(<ProfilInfos />);

  let oldModule = localStorage.getItem("currentUserProfilModule");
  if (!oldModule)
    localStorage.setItem("currentUserProfilModule", "ProfilInfos");

  function changeModule(newModule) {
    localStorage.setItem("currentModule", newModule.type.name);
    setModule(newModule);
  }

  const navigate = useNavigate();
  useEffect(() => {
    verifConnexion();
  }, []);

  function verifConnexion() {
    try {
      if (!Cookies.get("atdCookie")) {
        document.getElementById("errorMsg").textContent=""
        navigate("/login", { replace: true });
      }else{
        const decoded = jwtDecode(Cookies.get("atdCookie"));
        setUserInfos(decoded)
      }
    } catch (error) {
      document.getElementById("errorMsg").textContent=""
      navigate("/login", { replace: true });
    }
  }

  function switchPage(name) {
    let h2 = document.getElementsByTagName("h2");
    for (let i = 0; i < h2.length; i++) {
      h2[i].classList.remove("underline");
    }
    if (name == "Profil") {
      document.getElementById("Profil").classList.add("underline");
      changeModule(<ProfilInfos/>);
    }
    if (name == "Dons") {
      document.getElementById("Dons").classList.add("underline");
      changeModule(<DonationsInfos />);
    }
    if (name == "Candidature") {
      document.getElementById("Candidature").classList.add("underline");
      changeModule(<ApplicationsInfos />);
    }
    if (name == "Paramètres") {
      document.getElementById("Paramètres").classList.add("underline");
      changeModule(<Parameters />);
    }
  }

  return (
    <div id="div-container-children" className="SectionMain">
      <main className="profilPageContainer">
        <div className="loggedSideHeader">
          {userInfos.rank > 1 && <SideHeaderFront pfp={userInfos.pfp} />}
        </div>
        <div className="profilContainer">
          <div className="pfpNamesContainer">
            <img src={userInfos.pfp} alt="Photo de profil" className="pfp" />
            <p className="nameLastname">
              {userInfos.name ? userInfos.name : ""} {userInfos.lastname ? userInfos.lastname : ""}
            </p>
          </div>
          <div className="profilCategories">
            <h2
              id="Profil"
              className="underline"
              onClick={() => switchPage("Profil")}
            >
              Profil
            </h2>
            <h2
              onClick={() => switchPage("Candidature")}
              id="Candidature"
            >
              Candidature
            </h2>
            <h2
              onClick={() => switchPage("Dons")}
              id="Dons"
            >
              Dons
            </h2>
            <h2
              onClick={() => switchPage("Paramètres")}
              id="Paramètres"
            >
              Paramètres
            </h2>
          </div>
          <div className="categoryDetails">{actualModule}</div>
          <p id="errorMsg"></p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProfilPage;
