import "../../css/components.css"
const baseUrl = require("../../config.json").baseUrl;

const CreateUserPopup = (props) => {
    function checkInputData() {
        let check = true;
        const inputs = document.querySelectorAll("#createNewEventPopup input, #createNewEventPopup select");
        inputs.forEach((input) => {
            if (input.value === "") {
                input.style.border = "2px solid red";
                check = false;
            }
        });

        if (!check) document.getElementById("forgotValuesNewEvent").style.display = "block";
        else document.getElementById("forgotValuesNewEvent").style.display = "none";

        return check;
    }

    function closeCreateUserPopup() { props.setVisibilityPopup(false); }

    async function confirmCreateUser() {
        if (checkInputData()) {
            const inputs = document.querySelectorAll("#createNewEventPopup input, #createNewEventPopup select");
            let bodyData = "";
            inputs.forEach((input, i) => {
                bodyData += `${input.name}=${input.value}`;
                if (i < inputs.length-1) bodyData += `&`;
            });

            let res = await fetch(`${baseUrl}/users/create`, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded"},
                credentials: "include",
                body: bodyData
            })
            let resData = await res.json();
            if (resData && resData.message) closeCreateUserPopup();
        } else {
            return;
        }
    }

    return (
        <div id="createNewEventPopup" className="events-module module-popup">
            <h4 className="text-center">Créer un nouvel utilisateur</h4>
            <section className="create-user-section-form">
                <div className="user-informations-under-section flexbox-row">
                    <div className="user-infos-box email-box">
                        <h6>Pseudonyme</h6>
                        <input type="text" name="username" />
                    </div>
                    <div className="user-infos-box email-box">
                        <h6>Email</h6>
                        <input type="text" max={255} name="email" />
                    </div>
                </div>
                <div className="user-informations-under-section flexbox-row">
                    <div className="user-infos-box email-box">
                        <h6>Prénom</h6>
                        <input type="text" name="name" />
                    </div>
                    <div className="user-infos-box email-box">
                        <h6>Nom</h6>
                        <input type="text" max={255} name="lastname" />
                    </div>
                    <div className="user-infos-box email-box">
                        <h6>Date de naissance</h6>
                        <input type="date" name="birthday" />
                    </div>
                </div>
                <div className="user-informations-under-section flexbox-row">
                    <div className="user-infos-box email-box">
                        <h6>Mot de passe</h6>
                        <input name="password" type="text" min={8} max={40} />
                    </div>
                    <div className="user-infos-box email-box">
                        <h6>Rôle</h6>
                        <select name="rank" id="selectRankUserInput">
                            <option value="">Rang à attribuer</option>
                            <option value="1">Utilisateur</option>
                            <option value="2">Bénéficiaire</option>
                            <option value="3">Partneaire</option>
                            <option value="4">Bénévole</option>
                            <option value="5">Responsable</option>
                            <option value="8">Administrateur</option>
                        </select>
                    </div>
                </div>
            </section>
            <h5 id="forgotValuesNewEvent">Des entrées sont manquantes</h5>
            <div className="popup-buttons-box">
                <button onClick={closeCreateUserPopup} className="cancel-button">Annuler</button>
                <button onClick={confirmCreateUser} className="confirm-button">Confirmer</button>
            </div>
        </div>
    );
};

export default CreateUserPopup;