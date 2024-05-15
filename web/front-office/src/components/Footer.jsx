import React from "react";
import { Outlet, Link } from "react-router-dom";

 
const FrontFooter = () => {
    return (
        <footer>
            <div className="containerLinks">
                <div className="linkCategory">
                    <h3 className="categoryTitle">Nos activités</h3>
                    <Link to="/foodDistrib" className="textLinkFooter">Distributions alimentaires</Link>
                    <Link to="/administrativeServices" className="textLinkFooter">Services administratifs</Link>
                    <Link to="/shuttle" className="textLinkFooter">Navettes</Link>
                    <Link to="/onlineLessons" className="textLinkFooter">Cours en ligne</Link>
                    <Link to="/fundraising" className="textLinkFooter">Récoltes de fonds</Link>
                    <Link to="/oldPeople" className="textLinkFooter">Visite des personnes âgées</Link>
                </div>
                <div className="linkCategory">
                    <h3 className="categoryTitle">Nous suivre</h3>
                    <Link to="/articles" className="textLinkFooter">Nos articles</Link>
                    <Link to="/events" className="textLinkFooter">Nos évènements</Link>
                    <Link to="/contact" className="textLinkFooter">Contacts</Link>
                </div>
                <div className="linkCategory">
                    <h3 className="categoryTitle">Nous rejoindre</h3>
                    <Link to="/beneficiarySignIn" className="textLinkFooter">Devenir bénéficiaire</Link>
                    <Link to="/volunteerSignIn" className="textLinkFooter">Devenir bénévole</Link>
                    <Link to="/partnerSignIn" className="textLinkFooter">Devenir partenaire</Link>
                </div>
                <div className="linkCategory">
                    <h3 className="categoryTitle">Votre espace</h3>
                    <Link to="/login" className="textLinkFooter">Se connecter</Link>
                </div>
            </div>
            <p className="textFooter">Confidentialité | Mentions légales | {new Date().getFullYear() } | Tech Waves</p>
        </footer>
    );
};
 
export default FrontFooter;