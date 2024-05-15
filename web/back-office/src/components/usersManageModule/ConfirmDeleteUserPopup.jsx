import { useState } from "react";
const baseUrl = require("../../config.json").baseUrl;

const ConfirmDeleteUserPopup = (props) => {
    const [resMessage, setResMessage] = useState(null);

    function closePopup() { props.setConfirmDeleteUserPopup(false); }

    async function confirmDeleteUser() {
        try {
            setResMessage(null);
            const res = await fetch(`${baseUrl}/users/${props.userIdToDelete}`, {
                method: "DELETE",
                credentials: "include"
            });
            const data = await res.json();
            if (data && data.error === undefined) {
                props.setCloseStatus();
                closePopup();
            } else {
                setResMessage(data.error);
            }
        } catch (error) {
            setResMessage("Erreur durant la suppression de l'utilisateur");
        }
    }

    return (
        <div id="changeconfirmDeleteUserPopupMyPfpPopup" className="module-popup flexbox-column justify-center text-center">
            <h4>Etes-vous sûr de vouloir supprimer l'utilisateur {props.username}</h4>
            <div className="flexbox-row justify-around">
                <button className="cancel-button" onClick={() => closePopup()}>Annuler</button>
                <button className="delete-button" onClick={() => confirmDeleteUser()}>Confirmer</button>
            </div>
            {
                resMessage !== null && <p className="error-message-alert text-center">{resMessage}</p>
            }
        </div>
    );
};

export default ConfirmDeleteUserPopup;