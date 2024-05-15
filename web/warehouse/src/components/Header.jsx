import React from "react";
import logo from "../assets/logoForDark.png";
import "../css/headerFooter.css";
import { Link, NavLink } from "react-router-dom";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
const baseUrl = require("../config.json").baseUrl;
const backOfficeAtd = require("../config.json").backOfficeAtd;
const deconnexion = require("../config.json").deconnexion;

const WareHouseHeader = (props) => {
  const navigate = useNavigate();
  
  function deleteCookie() {
    if(Cookies.get("atdCookie") != null){
      document.cookie = "atdCookie=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.autempsdonne.lol";
    }
  }

  return (
    <header className="Front-header">
      <div id="headerTitleContainer">
        <img src={logo} className="App-logo" id="headerTitleLogo" alt="logo" />
        <div id="headerTitleTextBox">
          <h1>Au Temps donné</h1>
          <h6>Association caritative</h6>
        </div>
      </div>
      <nav id="headerMenuNav">
        <Link id="joinUsButton" to={backOfficeAtd}>
          Accéder au back-office
        </Link>
        <Link id="deconnexionButton" to="/" onClick={() => deleteCookie()}>
          Se deconnecter
        </Link>
      </nav>
    </header>
  );
};

export default WareHouseHeader;
