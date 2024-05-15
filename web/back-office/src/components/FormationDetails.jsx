import React, { useState, useEffect, useRef } from "react";
import moment from 'moment';
import "../css/components.css";
import AddRegisterPopUp from "./AddRegisterPopUp";
import ModifyStatusRegisterPopup from "./ModifyStatusRegisterPopup";
import AccessFormationPopup from "./AccessFormationPopup";
import ShowRegisterFormationPopup from "./showRegisterFormationPopup";
import FormationsModule from "./FormationsModule";
import AuthUser from "./AuthUser";
const baseUrl = require("../config.json").baseUrl;

const FormationDetails = (props) => {
    const [formationData, setFormationData] = useState([]);
    const wrapperRef = useRef(null);
    const [visibilityPopup, setVisibilityPopup] = useState(false);
    const [accessFormation, setAccessFormation] = useState(null);
    const [modifyFormationPopup, setModifyFormationPopup] = useState(false);
    const [registerFormationPopup, setRegisterFormationPopup] = useState(false);


    const userIdConnect = AuthUser.id

    const formationId = {
        id: props.formation
    };


    async function getFormation() {
        try {
            let res = await fetch(`${baseUrl}/api/formations/getFormation/${formationId.id}`, {
                method: "GET",
                credentials: "include",
            });
            let formation = await res.json();
            if (formation) setFormationData(formation);
        } catch (error) {
            console.error("Error fetching formation data:", error);
        }
    }

    async function Register() {
        let message = ""
        const data = {
            user: userIdConnect,
            formation: formationId.id
        }

        let res = await fetch(`${baseUrl}/api/formationsRegister`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        let resJson = await res.json();


        console.log("res.status", resJson.error)
        if(res.status === 200){
            message = "Inscription éffectuée avec success"
            const afficheMessage = document.getElementById("message");
            afficheMessage.innerText = message;
            document.getElementById("message").style.display = "block";
        }
        if(res.status === 500){
            message = "Inscription impossible: " + resJson.error;
            const afficheMessage = document.getElementById("message");
            afficheMessage.innerText = message;
            document.getElementById("message").style.display = "block";
        }
    }


    useEffect(() => {
        getFormation();
    }, []);   
        
    function showPopup() {
        setVisibilityPopup(true);
        setAccessFormation(formationId);
    }

    function showPopupModifyPopup(){
        setModifyFormationPopup(true);
    }

    function showRegisterFormationPopup(){
        setRegisterFormationPopup(true);
    }
    
    const currentDate = moment();

    return (
        <div>
            {formationData.map((formation, index) => {
                return (
                    <div key={index} className="formation-global">
                        <span
                            className="material-symbols-outlined pointer">
                            arrow_back
                        </span>
                        <div className="text-center"> 
                            <h1 >Formation n° {formationId.id}</h1>
                            <h2>{formation.title}</h2>
                        </div>
                        <section className="formation-informations-container formation-informations-box flexbox-column justify-center">
                            <div className="formation-informations-box">
                                <div className="flexbox-row">
                                    <div className="flexbox-column formation-info-box description-input">
                                        <h5 className="text-center">Description</h5>
                                        <input disabled type="text" placeholder={formation.description}/>
                                    </div>
                                </div>
                                <div className="flexbox-row formation-row-information">
                                    <div className="flexbox-column formation-info-box">
                                        <h5 className="text-center">Date Début</h5>
                                        <input disabled type="text" placeholder={formation.datetime_start}/>
                                    </div>
                                    <div className="flexbox-column formation-info-box">
                                        <h5 className="text-center">Date Fin</h5>
                                        <input disabled type="text" placeholder={formation.datetime_end}/>
                                    </div>
                                    <div className="flexbox-column formation-info-box">
                                        <h5 className="text-center">Responsable</h5>
                                        <input disabled type="text" placeholder={formation.responsable}/>
                                    </div>
                                </div>
                                <div className="flexbox-row formation-row-information">
                                    <div className="flexbox-column formation-info-box">
                                        <h5 className="text-center">Nombre de Places</h5>
                                        <input disabled type="text" placeholder={formation.nb_places}/>
                                    </div>
                                    <div className="flexbox-column formation-info-box">
                                        <h5 className="text-center">Lieu</h5>
                                        <input disabled type="text" placeholder={formation.place}/>
                                    </div>
                                    <div className="flexbox-column formation-info-box">
                                        <h5 className="text-center">Sujet de la formation</h5>
                                        <input disabled type="text" placeholder={formation.activities}/>
                                    </div>
                                </div>
                                <div>
                                <div>
                                    <div className="flexbox-row">
                                        {!moment(formation.datetime_end).isBefore(currentDate) && (
                                            <div>
                                                <button onClick={Register} id="button-register">S'inscrire</button>
                                            </div>
                                        )}
                                        {!moment(formation.datetime_end).isBefore(currentDate) && (
                                        <div>
                                            <button onClick={showPopupModifyPopup} id="showRegistered">Modifier</button>
                                            {modifyFormationPopup && <AccessFormationPopup setModifyFormationPopup={setModifyFormationPopup} formationId={formationId}/>}
                                        </div>
                                    )}
                                    </div> 
                                    <h5 id="message"></h5>
                                </div>
                                <div className="flexbox-row">
                                    {!moment(formation.datetime_end).isBefore(currentDate) && (
                                        <div>
                                            <button onClick={showPopup} id="buttonRegistered" >Ajouter un inscrit</button>
                                            {visibilityPopup && <AddRegisterPopUp setVisibilityPopup={setVisibilityPopup} formation={accessFormation}/>}
                                        </div>
                                    )}
                                    <div>
                                        <button onClick={showRegisterFormationPopup} id="buttonRegistered">Afficher les Inscrits</button>
                                    </div>
                                </div>
                                {registerFormationPopup && <ShowRegisterFormationPopup setRegisterFormationPopup={setRegisterFormationPopup} formationId={formationId.id} formationType={formationData[0].activities}/>}
                                </div> 
                            </div>
                        </section>
                        <div> 
                            <div className="formation-informations-box flexbox-column">
                                <div className=" inscrits-list" ref={wrapperRef}></div>
                            </div>
                        </div>
                            
                    </div>
                );
            })}
        </div>
    );
}

export default FormationDetails;
