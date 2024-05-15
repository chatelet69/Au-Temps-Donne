import React from "react";
import { Outlet, Link } from "react-router-dom";
const atdFront = require("../config.json").frontOfficeAtd;
const atdBack = require("../config.json").backOfficeAtd;

 
const WareHouseFooter = () => {
    return (
        <footer>
            <div className="containerLinks">
                <div className="linkCategory">
                    <h3 className="categoryTitle">Entrepôts</h3>
                    <Link to="/foodDistrib" className="textLinkFooter">A compléter</Link>
                </div>
                <div className="linkCategory">
                    <h3 className="categoryTitle">Stock</h3>
                    <Link to="/articles" className="textLinkFooter">A compléter</Link>
                </div>
                <div className="linkCategory">
                    <h3 className="categoryTitle">Au Temps Donné</h3>
                    <Link to={atdFront} className="textLinkFooter">Aller sur le front-office</Link>
                    <Link to={atdBack} className="textLinkFooter">Aller sur le back-office</Link>
                </div>
            </div>
            <p className="textFooter">Confidentialité | Mentions légales | {new Date().getFullYear() } | Tech Waves</p>
        </footer>
    );
};
 
export default WareHouseFooter;