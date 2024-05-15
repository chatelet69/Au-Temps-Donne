//import moment from "moment";
import React, {useEffect, useState, useRef} from "react";
import "../../css/collects.css";
const baseUrl = require("../../config.json").baseUrl;


const CreateCollectPopup = (props) => {
    const [partners, setPartners] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [selectedPartners, setSelectedPartners] = useState([]);
    let message ="";
    const addressContainerRef = useRef(null);
    const tabSelectedPartners = {};
    



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

    async function getAllPartner() {
        try {
            let res = await fetch(`${baseUrl}/api/collects/get/getAllPartner`, {method: "GET",credentials: "include"});
            let data = await res.json();
            data = data.result
            if (data) {
                setPartners(data);
            }
        } catch (error) {
            return false;
        }
    }

    useEffect(() => {
        getAllUsers();
        getAllPartner()
    }, [])

    function checkInputData() {
        let check = true;
        const inputs = document.querySelectorAll("#createNewCollectPopup input, #createNewCollectPopup select");
        inputs.forEach((input) => {
            if (input.value === "") {
                input.style.border = "2px solid red";
                check = false;
            }
        });

        const dateStart = document.getElementById('startDatetimeInput').value;
        const dateEnd = document.getElementById('endDatetimeInput').value;
        //if (moment(dateEnd).isBefore(dateStart)) {
        //    message = "La date de fin est avant la date de début";
        //    check = false;
        //}
        //if (moment(dateEnd).isBefore(moment())) {
        //    message = "La date de fin est dans le passé";
        //    check = false;
        //}
        //if (moment(dateStart).isBefore(moment())) {
        //    message = "La date de début est dans le passé";
        //    check = false;
        //}

        

        const message = document.getElementById("message");
        if (!check) {
            message.innerText = message;
            document.getElementById("message").style.display = "block";
        }
        else {
            document.getElementById("message").style.display = "none";
        }

        return true;
    }

    const handleSelectUsers = (event) => {
        setSelectedUserId(event.target.value);
    };

    function handlePartnerChange(event) {
        const selectedPartnerValue = event.target.value;
        tabSelectedPartners.push(selectedPartnerValue);
        console.log("tab : " + tabSelectedPartners);
    }

    function closeCreateCollectPopup() { props.setVisibilityPopup(false); }

    async function confirmCreateCollect() {
        //if (checkInputData()) {
            const collectData =  {
                start_date: document.getElementById('startDatetimeInput').value,
                end_date: document.getElementById('endDatetimeInput').value,
                driver: parseInt(document.getElementById('selectDriverInput').value, 10)
            };

            const selectedPartners = [];
            const addressContainer = document.getElementById('addressContainer');
            const addressDivs = addressContainer.querySelectorAll('.address');
            addressDivs.forEach((addressDiv) => {
                const selectPartnerInput = addressDiv.querySelector('select');
                const selectedPartnerId = selectPartnerInput.value;
                selectedPartners.push({selectedPartnerId});
            });

            //console.log(selectedPartners);

            const requestData = {
                collectData: collectData,
                partners: selectedPartners
            };

            console.log(requestData)

            let res = await fetch(`${baseUrl}/api/collects/addCollect`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(requestData)
            });

            let resData = await res.json();
            console.log(resData.message)
        if (resData.message) {
            message = "Création réalisée avec succès"
            const afficheMessage = document.getElementById("message");
            afficheMessage.innerText = message;
            document.getElementById("message").style.display = "block";
        }
        if (resData.error) {
            message = "Création Impossible"
            const afficheMessage = document.getElementById("message");
            afficheMessage.innerText = message;
            document.getElementById("message").style.display = "block";
        }
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
        partners.map((partner) => {
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


    return (
        <div id="createNewCollectPopup" className="collects-module module-popup" >
            <h3>Créer une nouvelle récolte</h3>
            <div>
                <div className="collects-create-inputs-container">
                    <div>
                        <h6>Date de début</h6>
                        <input name="start_datetime" defaultValue={new Date().toISOString().slice(0, 16)} min={new Date().toISOString().slice(0, 16)} id="startDatetimeInput" type="datetime-local" />
                    </div>
                    <div>
                        <h6>Date de fin</h6>
                        <input name="end_datetime" id="endDatetimeInput" min={new Date().toISOString().slice(0, 16)} type="datetime-local" />
                    </div>
                </div>
                <div className="collects-create-inputs-container">
                    <div>
                        <h6>Selectionner un utilisateur</h6>
                        <select name="inscrit" id="selectDriverInput" onChange={handleSelectUsers}>
                            {users.map((user) => (
                                <option key={user.id} value={user.id}>{user.name} {user.lastname}</option>
                            ))}
                        </select>
                    </div> 
                </div>
                <h4>Feuille de route</h4>
                <button onClick={addAddress} className="collect-option-add-button">Ajouter une adresse</button>
                <div id="addressContainer" className="collect-option-content-container" ref={addressContainerRef}>        
                </div>
            </div>
            <h5 id="message"></h5>
            <div className="popup-buttons-box">
                <button onClick={closeCreateCollectPopup} className="cancel-button">Annuler</button>
                <button onClick={confirmCreateCollect} className="confirm-button">Confirmer</button>
            </div>
        </div>

);
}

export default CreateCollectPopup;