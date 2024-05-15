import React, {useEffect, useState, useRef} from "react";
import "../../css/collects.css";
const baseUrl = require("../../config.json").baseUrl;

const AddPartnerPopup = (props) => {
    const addressContainerRef = useRef(null);

    function closePopup() {
        props.setVisibilityAddPartnerPopup(false);
    }

    function removeAddress(addressId) {
        const addressToRemove = document.getElementById(`addressDiv${addressId}`);
        addressToRemove.remove();
    }

    function addAddress(){
        const addressContainer = document.getElementById('addressContainer');
        const numberOfDivs = addressContainer.childElementCount;
        const newAddressId = numberOfDivs +1 ;
        const newAddressDiv = document.createElement('div');
        newAddressDiv.classList.add('address');
        newAddressDiv.id = `addressDiv${newAddressId}`;
        newAddressDiv.innerHTML = `
            <input type="text" id="Description${newAddressId}" name="Description${newAddressId}" placeholder="Description">
            <input type="text" id="Address${newAddressId}" name="Address${newAddressId}" placeholder="Addresse">
            <input type="text" id="City${newAddressId}" name="City${newAddressId}" placeholder="Ville">
            <input type="text" id="zipCode${newAddressId}" name="zipCode${newAddressId}" placeholder="Code Postal">
            `;
        addressContainerRef.current.appendChild(newAddressDiv);
        const deleteButton = document.createElement("button");
        deleteButton.id = "deleteButton" + newAddressDiv;
        deleteButton.textContent = "Supprimer";
        deleteButton.onclick = () => removeAddress(newAddressId);
        newAddressDiv.appendChild(deleteButton);
    };

    async function confirmCreateCollect() {
            const addresses = [];
            let message = ""


            const addressDivs = document.querySelectorAll('.address');
            addressDivs.forEach((addressDiv) => {
            const description = addressDiv.querySelector(`#Description${addressDiv.id.replace('addressDiv', '')}`).value;
            const address = addressDiv.querySelector(`#Address${addressDiv.id.replace('addressDiv', '')}`).value;
            const city = addressDiv.querySelector(`#City${addressDiv.id.replace('addressDiv', '')}`).value;
            const zipCode = addressDiv.querySelector(`#zipCode${addressDiv.id.replace('addressDiv', '')}`).value;

            addresses.push({
                description,
                city,
                address,
                zip_code: zipCode
            });
        });

        let check = true

        let res = ""

        for (let i = 0; i < addresses.length; i++) {
            const address = addresses[i];
            res = await fetch(`${baseUrl}/api/collects/addPartner`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(address)
            });  

            if(res.status === 500 || res.status === 400){
                check = false;

            }
        }

        if(check === true){
            message = "Ajout réalisé avec succès"
            const afficheMessage = document.getElementById("message");
            afficheMessage.innerText = message;
            document.getElementById("message").style.display = "block";
        } else{
            message = "Ajout impossible"
            const afficheMessage = document.getElementById("message");
            afficheMessage.innerText = message;
            document.getElementById("message").style.display = "block";
        }  

    }


    return (
        <div id="createNewCollectPopup" className="collects-module module-popup" >
            <h4>Ajouter un Partenaire</h4>
            <div>
                <button onClick={addAddress}>Ajouter une adresse</button>
                <div id="addressContainer" ref={addressContainerRef}>
                </div>
            </div>
            <h5 id="forgotValuesNewCollect"></h5>
            <div className="popup-buttons-box">
                <button onClick={closePopup} className="cancel-button">Annuler</button>
                <button onClick={confirmCreateCollect} className="confirm-button">Confirmer</button>
            </div>
            <h5 id="message"></h5>
        </div>
    );

}

export default AddPartnerPopup;