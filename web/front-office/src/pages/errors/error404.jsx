import React from "react";
import logo from "../../assets/auTempsDonneLight.png";
import { Link } from "react-router-dom";
import Welcome from "../welcome";
import "../../css/error.css"
import FrontFooter from "../../components/Footer";
 
const Error404 = () => {
    return (
        <>
            <div className="errors">
                <img src={logo} alt="logo atd" />
                <h1>Vous êtes perdu ?</h1>
                <p>Cette page n'existe pas</p>
                <Link to="/" className="link-error">Revenir à l'accueil</Link>
            </div>
            <FrontFooter/>        
        </>
    );
};
 
export default Error404;