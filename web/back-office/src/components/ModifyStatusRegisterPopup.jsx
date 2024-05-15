import moment from "moment";
import "../css/components.css"
import React, {useEffect, useState} from "react";
const baseUrl = require("../config.json").baseUrl;

const ModifyStatusRegisterPopup = (props) => {
    const [formationData, setFormationData] = useState([]);

    function closeModifyStatusPopup() { props.setModifyStatusFormationPopup(false); }

    async function getAllValidFormation() {
        try {
            let res = await fetch(`${baseUrl}/api/formations/getAllCertificatFormationById/${props.user}`, {
                method: "GET",
                credentials: "include",
            });
            let formation = await res.json();
            if (formation) setFormationData(formation);
        } catch (error) {
            console.error("Error fetching formation data:", error);
        }
    }

    useEffect(() => {
        getAllValidFormation();
    }, []);

    async function confirmChange() {
        const selectedStatus = document.getElementById("selectFormationStatusInput").value;
        console.log("Status sélectionné :", selectedStatus);
        console.log("ok")

        let data = {
            [props.formationType]: selectedStatus
        };

        let dataRegisterFormation = {}

        if (selectedStatus == 2 ){
            data = {
                [props.formationType]: 0
            };
            dataRegisterFormation = {
                "status" : "NON VALIDE",
                "idFormation" : props.formationId
            }
        }

        if (selectedStatus == 1 ){
            dataRegisterFormation = {
                "status" : "VALIDE",
                "idFormation" : props.formationId
            }
        }
        if (selectedStatus == 0 ){
            dataRegisterFormation = {
                "status" : "EN ATTENTE",
                "idFormation" : props.formationId
            }
        }

        console.log("data.props.formationType", selectedStatus);

        if (formationData.results.length === 0){
            let res = await fetch(`${baseUrl}/api/formation/addStatusFormation/${props.user}`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                }
            });
        } else {
            let res = await fetch(`${baseUrl}/api/formations/updateStatusUserFormation/${props.user}`, {
                method: "PATCH",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });  

            let resRegisterFormation = await fetch(`${baseUrl}/api/formations/updateStatusRegisterFormation/${props.user}`, {
                method: "PATCH",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(dataRegisterFormation)
            });  

        }

        props.setModifyStatusFormationPopup(false);
    }
    
    return (
        <div className="events-module module-popup">
            <h1 className="text-center">Modifier le status</h1>
            <select name="status" id="selectFormationStatusInput">
                <option value="0">EN ATTENTE</option>
                <option value="1">VALIDE</option>
                <option value="2">NON VALIDE</option>
            </select>
            <div className="popup-buttons-box">
                    <button onClick={closeModifyStatusPopup} className="cancel-button">Annuler</button>
                    <button onClick={confirmChange} className="confirm-button">Confirmer</button>
                </div>
        </div>
    );
}

export default ModifyStatusRegisterPopup;