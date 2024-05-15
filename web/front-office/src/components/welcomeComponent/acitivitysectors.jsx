import React from "react";
import "../../css/welcome.css"

function activitySectors(){
    return(
        <div className="activityContainer">
            <h2 className="activityBigTitle">Nos secteurs d'activité</h2>
            <div className="activityBox">
                <div className="activity">
                    <span className="material-symbols-outlined">restaurant</span>
                    <p>Distributions alimentaires</p>
                </div>
                <div className="activity">
                    <span className="material-symbols-outlined">unknown_document</span>
                    <p>Services administratifs</p>
                </div>
                <div className="activity">
                    <span className="material-symbols-outlined">airport_shuttle</span>
                    <p>Navettes</p>
                </div>
                <div className="activity">
                    <span className="material-symbols-outlined">school</span>
                    <p>Cours en ligne</p>
                </div>
                <div className="activity">
                    <span className="material-symbols-outlined">cottage</span>
                    <p>Visites et activités pour personnes âgées</p>
                </div>
                <div className="activity">
                    <span className="material-symbols-outlined">volunteer_activism</span>
                    <p>Récoles de fonds</p>
                </div>

            </div>
        </div>
    );
}
export default activitySectors;