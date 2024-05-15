import React from 'react';
import { useCookies } from 'react-cookie';
import logo from "../assets/logoForLight.png"
import '../css/login.css';

const Logout = () => {
    const [cookies] = useCookies(["atdCookie"]);
	let logged = (cookies["atdCookie"] && (cookies.atdCookie || cookies.userJwt)) ? true : false;
    if (logged === false) {
        window.location = "/";
    } else { 
        logoutBackOffice();
        document.body.classList.add("logout-body");
        return (
            <div className="Logout-page">
                <img src={logo} alt='Logo'/>
                <h1>Vous avez bien été déconnecté</h1>
                <h3>Redirection vers la page de connexion</h3>
            </div>
        );
    }
}

async function logoutBackOffice() {
    try {
        localStorage.clear();
        const domain = (document.location.hostname.includes("autempsdonne.lol")) ? ".autempsdonne.lol" : "localhost";
        //document.cookie = `atdCookie=; domain=${domain}; SameSite=None; expires=Thu, 01 Jan 1970 00:00:00; path=/;`;
        document.cookie = `atdCookie=; domain=${domain}; expires=Thu, 01 Jan 1970 00:00:00; path=/;`;
        //localStorage.setItem("currentModule", "MainModule");
        document.location.href = "/";
    } catch (error) {
        throw error;
    }
}

export default Logout;
