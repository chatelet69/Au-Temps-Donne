import React, { useEffect, useState } from 'react';
import FrontFooter from "../components/Footer";
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import "../css/loginSignIn.css";
import { Link } from "react-router-dom";
import Cookies from 'js-cookie';

const baseUrl = require("../config.json").baseUrl;
const Login = () => {  
  useEffect(() => {
    const checkAndChangePage = () => {
      const atdCookie = Cookies.get('atdCookie');
      if (atdCookie) {
        const decoded = jwtDecode(atdCookie);
        changePage(atdCookie, decoded.rank);
      }
    };
    checkAndChangePage();
  }, []);

  function changePage(cookie, rank){
    switch (rank) {
      case 1:
      case 2:
        navigate('/profilUsers', { replace: true });
        break;
      case 3:
        navigate('/homePartners', { replace: true });
        break;
        case 4:
        case 5:
        case 6:
        case 7:
        case 8:
        case 9:  
        {
          window.location.replace('https://backoffice.autempsdonne.lol/');
          Cookies.set('atdCookie', cookie, { domain: 'https://backoffice.autempsdonne.lol/' })
        }
        break;
      default:
        navigate('/', { replace: true });
        break;
    }
  }

  async function SubmitLogin() {
    try {
      const login = document.getElementById("loginInput").value;
      const password = document.getElementById("passwordInput").value;
      if (login.length > 0 && password.length > 0) {
        let res = await fetch(`${baseUrl}/login`, {
          method: "POST",
          mode: "cors",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            //"Access-Control-Allow-Origin": "origin",
            Accept: "*/*",
            //"Access-Control-Allow-Credentials": "true",
          },
          credentials: "include",
          body: `username=${login}&password=${password}`,
        });
        let data = await res.json();
        if (!data || (data && data.error) || res.status === 403) {
          document.getElementById("errorMsg").textContent =
          "Une erreur est survenue durant la connexion";
          return false;
        }
        document.getElementById("errorMsg").textContent = "";
        const decoded = jwtDecode(data.jwt);
        changePage(data, decoded.rank);
      } else {
        document.getElementById("errorMsg").textContent =
        "Merci de compléter tous les inputs";
      }
    } catch (error) {
      console.log(error);
      document.getElementById("errorMsg").textContent =
      "Une erreur est survenue durant la connexion";
    }
  }
  
  const navigate = useNavigate();
  return (
    <div className="loginPageContainer">
      <div className="separatorContainer">
        <div className="registerList">
          <h2 className="loginTitles">Pas encore inscrit ?</h2>
          <div className="links-container">
            <Link to="/beneficiarySignIn" className="register-links">
              --{">"} Devenir bénéficiaire
            </Link>
            <Link to="/volunteerSignIn" className="register-links">
              --{">"} Devenir bénévole
            </Link>
            <Link to="/partnersSignIn" className="register-links">
              --{">"} Devenir partenaire
            </Link>
          </div>
        </div>
        <div className="formContainer">
          <h2 className="loginTitles">Se connecter</h2>
          <div className="formLogin">
            <label for="loginInput">Email ou pseudonyme :</label>
            <input
              type="text"
              name="loginInput"
              autoComplete="off"
              id="loginInput"
            />
            <label for="passwordInput">Mot de passe :</label>
            <input type="password" name="passwordInput" id="passwordInput" />
            <button className="sendBtnForm" id="pwdInput" onClick={() => SubmitLogin()}>
              Envoyer
            </button>
            <p id="errorMsg"></p>
          </div>
        </div>
      </div>
      <FrontFooter />
    </div>
  );
};

export default Login;
