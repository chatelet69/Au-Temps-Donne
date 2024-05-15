import moment from "moment";
import "../css/components.css"
import React, {useEffect, useState} from "react";
const baseUrl = require("../config.json").baseUrl;



const AddRegisterPopUp = (props) => {
    const [registers, setRegister] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState(null);

    const formationId = {
        id: props.formation
    };

    async function getAllRegistered() {
        try {
            let res = await fetch(`${baseUrl}/users`, {method: "GET",credentials: "include"});
            let data = await res.json();
            if (data) {
                setRegister(data.users);
            }
        } catch (error) {
            return false;
        }
    }

    const handleSelectRegistered = (event) => {
        setSelectedUserId(event.target.value);
    };


    useEffect(() => {
        getAllRegistered();
    }, [props.setAccessFormationPopup])


    function closePopup() { props.setVisibilityPopup(false); }

    async function addUser() {
        console.log("addUser");
        let message ="";

        const requestBody = {
            user: selectedUserId,
            formation: props.formation.id
            
        };
        console.log("requestBody", requestBody)
        
        let res = await fetch(`${baseUrl}/api/formationsRegister`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestBody)
        });

        let resData = await res.json();
        console.log(resData)
        if (resData.error == "inscription impossible") {
            message = "Inscription impossible";
            const afficheMessage = document.getElementById("message");
            afficheMessage.innerText = message;
            document.getElementById("message").style.display = "block";
        }

        if (resData.message == "success") {
            message = "Inscription effectuée";
            const afficheMessage = document.getElementById("message");
            afficheMessage.innerText = message;
            document.getElementById("message").style.display = "block";
        }

        
    }

    return (
        <div className="events-module module-popup">
            <span class="material-symbols-outlined pointer" onClick={closePopup}>close</span>
            <h1 className="text-center">Ajouter un inscrit</h1>
            <h6>Selectionner un utilisateur</h6>
            <select name="inscrit"  className="collect-modify-info-section" onChange={handleSelectRegistered}>
                {registers.map((user) => (
                    <option key={user.id} value={user.id}>{user.name} {user.lastname}</option>
                ))}
            </select>
            <button onClick={addUser}>Ajouter</button>
            <h5 id="message"></h5>
        </div>
    );
}

export default AddRegisterPopUp;