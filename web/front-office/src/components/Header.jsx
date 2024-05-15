import React from "react";
import logo from "../assets/logoForDark.png";
import "../css/headerFooter.css"
import { Link, NavLink, useLocation } from "react-router-dom";
import Welcome from "../pages/welcome";
import Cookies from "js-cookie";
const baseUrl = require("../config.json").baseUrl
const deconnexion = require("../util.json").deconnexion

const FrontHeader = () => {
  const location = useLocation();
  function deleteCookie(){
    if(Cookies.get('atdCookie')){
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
            <Link to="/" className="headerLinks">Accueil</Link>
            <Link to="/events" className="headerLinks">Évènements</Link>
            <Link to="/actualities" className="headerLinks">Actualités</Link>
            <Link to="/donate" className="headerLinks">Faire un don</Link>
            <Link to="/contact" className="headerLinks">Contact</Link>
            <Link to="/faq" className="headerLinks">FAQ</Link>
            <Link to="/about" className="headerLinks">A propos</Link>
            {
              deconnexion.includes(location.pathname) ?
              <Link id="deconnexionButton" to="/" onClick={deleteCookie}>Se deconnecter</Link>
              :
              <Link id="joinUsButton" to="/login">Mon espace</Link>
            }
          </nav>
        </header>

    );
};
 
export default FrontHeader;