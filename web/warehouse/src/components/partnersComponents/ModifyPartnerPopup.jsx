import React, {Component, useEffect, useState, useRef} from "react";
import moment from "moment/moment";
const baseUrl = require("../../config.json").baseUrl;

const ModifyPartnerPopup = (props) => {
    const [partnerData, setPartnerData] = useState([]);


    function closeModifyPopup() {
        props.setModifyPartnerPopup(false);
    }

    async function getPartner() {
        try {
            let res = await fetch(`${baseUrl}/api/partners/getPartner/${props.partner}`, {method: "GET",credentials: "include"});
            let partnerData = await res.json();
            partnerData = partnerData.result
            if (partnerData) {
                setPartnerData(partnerData);
            }
        } catch (error) {
            return false;
        }
    }

    useEffect(() => {
        getPartner();
    },[])


    async function getEditedValuesPartern() {
        let data = {};
       
        let inputs = document.querySelectorAll("#createNewCollectPopup input");
        inputs.forEach((element) => {
            if (element.value){
                data[element.name] = element.value;
            } else {
                data[element.name] = element.placeholder;
            }
            
        });
    
        return data;
    }


    async function confirmModifyPartner(){
        let data = await getEditedValuesPartern();
        console.log(data);
        let message = "";
        let res = await fetch(`${baseUrl}/api/partners/editPartner/${props.partner}`, {
            method: "PATCH",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        let resData = await res.json();
        if (resData) {
            message = "Modification effectuée";
            const afficheMessage = document.getElementById("message");
            afficheMessage.innerText = message;
            document.getElementById("message").style.display = "block";
        }

    }

    return (
        <div id="createNewCollectPopup" className="collects-module module-popup">
            <h3>Récolte</h3>
            <section className="collect-modify-info-section">
                {partnerData.map((data, index) => (
                    <div key={index}>
                        <input type="text" id="description" name="description" placeholder={data.description} />
                        <input type="text" id="address" name="address" placeholder={data.address} />
                        <input type="text" id="city" name="city" placeholder={data.city} />
                        <input type="text" id="zipCode" name="zip_code" placeholder={data.zip_code} />  
                    </div>
                ))}
            </section>  
            <h5 id="message"></h5>
            <div id="accessFormationPopupButtons" className="popup-buttons-box">
                <button onClick={confirmModifyPartner} className="confirm-button">Enregistrer</button>
                <button onClick={closeModifyPopup} className="cancel-button">Fermer</button>
            </div>          
        </div>
    );
};

export default ModifyPartnerPopup;