import React, {Component, useEffect, useState, useRef} from "react";
import moment from "moment/moment";
const baseUrl = require("../../config.json").baseUrl;

const ModifyCollectPopup = (props) => {
    const [users, setUsers] = useState([]);
    const [collectData, setCollectData] = useState([]);
    const [partnersData, setPartnersData] = useState([]);
    const [allPartnersData, setAllPartnersData] = useState([]);
    const partnersContainerRef = useRef(null);
    const addressContainerRef = useRef(null);


    function closeModifyPopup() {
        props.setVisibilityModifyPopup(false);
    }

    async function getAllUsers() {
        try {
            let res = await fetch(`${baseUrl}/users`, {method: "GET",credentials: "include"});
            let data = await res.json();
            if (data) {
                setUsers(data.users);
            }
        } catch (error) {
            return false;
        }
    }

    async function getCollect() {
        try {
            let res = await fetch(`${baseUrl}/api/collects/${props.collect}`, {method: "GET",credentials: "include"});
            let dataCollect = await res.json();
            if (dataCollect) {
                setCollectData(dataCollect);
            }
        } catch (error) {
            return false;
        }
    }

    async function getPartners() {
       try {
           let res = await fetch(`${baseUrl}/api/collects/get/getAllPartnerByTraject/${props.collect}`, {method: "GET",credentials: "include"});
           let partners = await res.json();
           partners = partners.result
            if (partners) {
                setPartnersData(partners);
            }
        } catch (error) {
            return false;
        }
    }


    async function getAllPartners() {
        try {
            let res = await fetch(`${baseUrl}/api/collects/get/getAllPartner`, {method: "GET",credentials: "include"});
            let allPartners = await res.json();
            allPartners = allPartners.result
             if (allPartners) {
                setAllPartnersData(allPartners);
             }
         } catch (error) {
             return false;
         }
     }

    useEffect(() => {
        getAllUsers();
        getCollect();
        getPartners();
        getAllPartners();
    },[])


    const newSelectedPartners = [];
    const selectedPartners = [];

    async function getEditedValuesCollect() {
        let check = true;
        let message ="";
        let editedCollect = {};
        

        partnersData.forEach((partner) => {
            selectedPartners.push(partner.partner_id);
        });
        
        const selectElements = addressContainerRef.current.querySelectorAll("select");
        selectElements.forEach((select) => {
            newSelectedPartners.push(parseInt(select.value));
        });

        const partnersContainerValue = partnersContainerRef.current.querySelectorAll("select");
        partnersContainerValue.forEach((select) => {
            newSelectedPartners.push(parseInt(select.value));
        });
                
        const valueAdd = newSelectedPartners.filter(partner => !selectedPartners.includes(partner));
        const valueDelete = selectedPartners.filter(partner => !newSelectedPartners.includes(partner));
        
            const resultSelectedPartners = {
                valueAdd: valueAdd,
                valueDelete: valueDelete
            };

        
        const startDateInput = document.getElementById('datetime_start').value;;
        const endDateInput = document.getElementById('datetime_end').value;;
        const driverInput = document.getElementById('selectDriverInput').value;

        if (driverInput !== collectData.driver_id_fk){
            editedCollect['driver_id_fk'] = driverInput;
        }

        if (startDateInput !== collectData[0].start_date){
            editedCollect['start_date'] = startDateInput;
        }

        if (endDateInput !== collectData[0].end_date){
            editedCollect['end_date'] = endDateInput;
        }

        const requestValues = {
            collect: editedCollect,
            partners: resultSelectedPartners
        }

        if (moment(endDateInput).isBefore(startDateInput)) {
            message = "La date de fin est avant la date de début";
            check = false;
        }
        if (moment(endDateInput).isBefore(moment())) {
            message = "La date de fin est dans le passé";
            check = false;
        }
        if (moment(startDateInput).isBefore(moment())) {
            message = "La date de début est dans le passé";
            check = false;
        }

        const error = document.getElementById("message");
        if (!check) {
            error.innerText = message;
            document.getElementById("message").style.display = "block";
        }
        else {
            document.getElementById("message").style.display = "none";
            return requestValues;
        }
    }

    async function confirmSaveEditCollect(){
        let data = await getEditedValuesCollect();
        let message = "";
        let res = await fetch(`${baseUrl}/api/collects/editCollect/${props.collect}`, {
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

    function handlePartnerChange(event) {
        const selectedPartnerValue = event.target.value;
        newSelectedPartners.push(selectedPartnerValue);
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
        let partnersOptions = "";
        allPartnersData.map((partner) => {
            partnersOptions += `<option key=${partner.id} value=${partner.id}>${partner.description} ${partner.address}</option>`;
        })
        newAddressDiv.innerHTML = `
        <select name="partner" id={'selectPartnerInput${newAddressId}'}>
            ${partnersOptions}
        </select>
        `;
        addressContainerRef.current.appendChild(newAddressDiv);
        const addressDiv = document.getElementById(`selectPartnerInput${newAddressId}`);
        if (addressDiv !== null) addressDiv.onchange.call(handlePartnerChange);

        const deleteButton = document.createElement("button");
        deleteButton.id = "deleteButton" + newAddressDiv;
        deleteButton.textContent = "Supprimer";
        deleteButton.onclick = () => removeAddress(newAddressId);

        newAddressDiv.appendChild(deleteButton);
    };

    function handleDeletePartner(index) {
        const partnerContainer = document.getElementById(`selectPartnerInput-${index + 1}`).parentNode;
        const partnerId = partnerContainer.querySelector("select").value;
        partnerContainer.remove();
    
        const partnerIndex = newSelectedPartners.indexOf(parseInt(partnerId));
        if (partnerIndex !== -1) {
            newSelectedPartners.splice(partnerIndex, 1);
        }
    }

    return (
        <div id="createNewCollectPopup" className="collects-module module-popup">
            <h3>Récolte</h3>
            <section className="user-informations-section">
                <div className="collects-create-inputs-container">
                    <div className="user-infos-box email-box">
                        <h6>Date de Début</h6>
                        {collectData.map((collect, index) => (
                            <input
                                key={index}
                                name="datetime_start"
                                min={new Date().toISOString().slice(0, 16)}
                                defaultValue={collect.start_date}
                                id="datetime_start"
                                type="datetime-local"
                            />
                        ))}
                    </div>
                    <div className="user-infos-box email-box">
                        <h6>Date de fin</h6>
                        {collectData.map((collect, index) => (
                            <input
                                key={index}
                                name="datetime_end"
                                id="datetime_end"
                                defaultValue={collect.end_date}
                                type="datetime-local"
                            />
                        ))}
                    </div>
                </div>
                <div className="collects-create-inputs-container">
                    <div>
                        <h6>Chauffeur</h6>
                        <select name="inscrit" id="selectDriverInput">
                            {users.map((user) => (
                                <option key={user.id} value={user.id}>{user.name} {user.lastname}</option>
                            ))}
                        </select>
                    </div>
                </div>       
                <h4>Feuille de route</h4>
                <div id="partnersContainer"  className="collect-option-content-container" ref={partnersContainerRef}>
                    {partnersData.map((partner, index) => (
                        <div key={partner.partner_id}>
                            <select name="inscrit" id={`selectPartnerInput-${index + 1}`}>
                                <option value={partner.partner_id}>{partner.description} {partner.address}</option>
                                {allPartnersData.map((data) => (
                                <option key={data.id} value={data.id}>{data.description} {data.address}</option>
                                ))}
                            </select>
                            <button onClick={() => handleDeletePartner(index)}>Supprimer</button>
                        </div>
                    ))}  
                </div>
                <div>
                    <button onClick={addAddress}  className="collect-option-add-button">Ajouter une adresse</button>
                    <div id="addressContainer" className="collect-option-content-container" ref={addressContainerRef}></div>
                </div>       
            </section>  
            <h5 id="message"></h5>
            <div id="accessFormationPopupButtons" className="popup-buttons-box">
                <button onClick={confirmSaveEditCollect} className="confirm-button">Enregistrer</button>
                <button onClick={closeModifyPopup} className="cancel-button">Fermer</button>
            </div>          
        </div>
    );
};

export default ModifyCollectPopup;