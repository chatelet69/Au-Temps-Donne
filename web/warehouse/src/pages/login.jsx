import React from "react";
import logo from "../assets/logoForLight.png";
import "../css/login.css";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { useState, useEffect } from "react";
const baseUrl = require("../config.json").baseUrl;

const Login = (props) => {
  const [formations, setFormations] = useState({});
  const navigate = useNavigate();

  useEffect(()=>{
    if(Cookies.get("atdCookie") != null && jwtDecode(Cookies.get("atdCookie")).rank >=4){
      navigate('/dashboard', {replace: true})
    }
  }, [])

  return (
    <>
      <div className="Login-page">
        <div id="loginBoxContainer">
          <div className="login-header-box">
            <img src={logo} alt="logo" />
            <h2 id="loginHeaderTitle">Espace de connexion</h2>
          </div>
          <div className="login-form" id="loginFormBox">
            <input
              placeholder="Pseudo ou email"
              type="text"
              name="login"
              id="loginInput"
            />
            <input
              placeholder="Mot de passe"
              type="password"
              name="password"
              id="passwordInput"
            />
            <button onClick={() => loginBackOffice()}>Se connecter</button>
            <h5 id="loginFailed">
              Impossible de se connecter avec ces identifiants !
            </h5>
            <button onClick={() => showForgetPassword()}>
              Mot de passe oublié
            </button>
          </div>
          <div id="forgetPasswordBox">
            <h5>Un mail contenant un code vous sera envoyé.</h5>
            <input
              id="forgetPassEmailInput"
              placeholder="Email"
              name="forgetPassEmail"
              type="text"
              min={1}
              max={255}
            />
            <button>Réinitialiser mot de passe</button>
            <button
              id="cancelForgetPasswordButton"
              onClick={() => hideForgetPassword()}
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    </>
  );

  function showForgetPassword() {
    document.getElementById("loginFormBox").style.display = "none";
    document.getElementById("loginHeaderTitle").textContent =
      "Mot de passe oublié";
    document.getElementById("forgetPasswordBox").style.display = "flex";
  }

  function hideForgetPassword() {
    document.getElementById("forgetPassEmailInput").value = "";
    document.getElementById("loginFormBox").style.display = "flex";
    document.getElementById("loginHeaderTitle").textContent =
      "Espace de connexion";
    document.getElementById("forgetPasswordBox").style.display = "none";
  }

  async function loginBackOffice() {
    try {
      const login = document.getElementById("loginInput").value;
      const password = document.getElementById("passwordInput").value;
      if (login.length > 0 && password.length > 0) {
        let res = await fetch(`${baseUrl}/login`, {
          method: "POST",
          mode: "cors",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "*/*",
          },
          credentials: "include",
          body: `username=${login}&password=${password}`,
        });
        let data = await res.json();
        const loginFailed = document.getElementById("loginFailed");
        if (
          loginFailed &&
          (!data || (data && data.error) || res.status === 403)
        )
          loginFailed.style.display = "block";
        else {
          loginFailed.style.display = "none";
          navigate('/dashboard', {replace: true})
        }
      }
    } catch (error) {
      const loginFailed = document.getElementById("loginFailed");
      if (loginFailed) loginFailed.style.display = "block";
    }
  }
};
export default Login;
