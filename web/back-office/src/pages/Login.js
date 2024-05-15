import React, { useState } from 'react';
import { useCookies } from 'react-cookie';
import { Navigate } from "react-router-dom";
import logo from '../assets/logoForLight.png';
import '../css/login.css';
import ForgetPasswordView from './ForgetPassword';
const baseUrl = require("../config.json").baseUrl;

const Login = () => {
	const [forgetPasswordVisibility, setForgetPasswordVisibility] = useState(false);
	const [cookies] = useCookies(["atdCookie"]);
	if (cookies["atdCookie"]) Navigate({ to: "/", replace: true });

	return (
		<div className="Login-page">
			<div id="loginBoxContainer">
				<div className='login-header-box'>
					<img src={logo} alt='logo' />
					<h2 id='loginHeaderTitle'>
						{!forgetPasswordVisibility && "Espace de connexion"}
						{forgetPasswordVisibility && "Mot de passe oublié"}
					</h2>
				</div>
				{
					!forgetPasswordVisibility &&
					<div className='login-form' id='loginFormBox'>
						<input placeholder='Pseudo ou email' type='text' name='login' id='loginInput' />
						<input placeholder="Mot de passe" type="password" name='password' id='passwordInput' />
						<button className="login-button" onClick={loginBackOffice}>Se connecter</button>
						<h5 id='loginFailed'>Impossible de se connecter avec ces identifiants !</h5>
						<button className="forget-password-button" onClick={() => setForgetPasswordVisibility(true)}>Mot de passe oublié</button>
					</div>
				}
				{
					forgetPasswordVisibility === true && <ForgetPasswordView setForgetPasswordVisibility={setForgetPasswordVisibility} />
				}
			</div>
		</div>
	);
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
					//"Access-Control-Allow-Origin": "origin",
					"Accept": "*/*",
					//"Access-Control-Allow-Credentials": "true",
				},
				credentials: "include",
				body: `username=${login}&password=${password}&backOffice=true`
			});
			let data = await res.json();
			const loginFailed = document.getElementById("loginFailed");
			if (loginFailed && (!data || (data && data.error) || res.status === 403)) loginFailed.style.display = "block";
			else if (loginFailed) loginFailed.style.display = "none";
		}
	} catch (error) {
		const loginFailed = document.getElementById("loginFailed");
		if (loginFailed) loginFailed.style.display = "block";
	}
}

export default Login;
