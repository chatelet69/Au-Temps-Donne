import React, {useEffect, useState, useRef} from "react";
import "../../css/collects.css";
const baseUrl = require("../../config.json").baseUrl;

const DeletePartnerPopup = (props) => {
    const partnerId = props.partner;
    function closePopup() {
        props.setaccessPartnerPopup(false);
    }

    async function confirmeDeletePartner(){
        let message = ""

        let res = await fetch(`${baseUrl}/api/partners/deletePartner/${partnerId}`, {
            method: "PATCH",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
        });

        if(res.status === 200){
            message = "Suppression réalisé avec succès"
            const afficheMessage = document.getElementById("message");
            afficheMessage.innerText = message;
            document.getElementById("message").style.display = "block";
        } else {
            message = "Suppression impossible"
            const afficheMessage = document.getElementById("message");
            afficheMessage.innerText = message;
            document.getElementById("message").style.display = "block";
        }
    }


    return (
        <div id="createNewCollectPopup" className="collects-module module-popup" >
            <h4>Voulez-vous supprimer ce partenaire ?</h4>
            <div className="popup-buttons-box">
                <button onClick={closePopup} className="cancel-button">Annuler</button>
                <button onClick={confirmeDeletePartner} className="confirm-button">Comfirmer</button>
            </div>
            <h5 id="message"></h5>
        </div>
    );

}

export default DeletePartnerPopup;