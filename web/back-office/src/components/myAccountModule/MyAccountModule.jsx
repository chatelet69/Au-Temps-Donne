import { Component } from "react";
import "../../css/components.css";
import SuccessActionPopup from "../functionsComponents/SuccessActionPopup";
import FormatDate from "../functionsComponents/FormatDate";
import InputsEditComponent from "../functionsComponents/UtilInputsComponent";
import CalendarPlanning from "../functionsComponents/CalendarPlanning";
import AddPlaningElementPopup from "./AddPlaningElementPopup";
import SearchPlanningEditPopup from "./SearchPlanningEditPopup";
import UtilFunctions from "../functionsComponents/UtilFunctions";
import EditMyPasswordPopup from "./EditMyPassword";
import AuthUser from "../AuthUser";
const baseUrl = require("../../config.json").baseUrl;

class MyAccount extends Component {
    state = {
        currentDate: new Date().toLocaleDateString("fr-FR"),
        userData: {},
        successPopup: false,
        changeMyPfpPopup: false,
        userUpdated: false,
        userPlanningUpdated: false,
        hasClosedSuccessPopup: false,
        message: "Pas de message particulier",
        addPlanningPopup: false,
        userFiles: [],
        changePasswordPopup: false,
        searchEditPlanningPopup: false,
        deleteMyPfpPopup: false,
        deleteMyPfpErrorMessage: null,
        editMyPfpMessage: null
    };

    formatedRanks = {
        "9": "Administrateur+",
        "8": "Staff",
        "5": "Responsable",
        "4": "Bénévole",
        "3": "Partenaire",
        "2": "Bénéficiaire",
        "1": "Utilisateur"
    }

    genders = ["Homme", "Femme", "Autre"];

    moveDate(type) {
        if (type !== -1 && type !== 1) return;
        const planningDate = document.getElementById("planningDateValue");
        let date = null;
        if (planningDate) {
            const tmpDateArray = planningDate.innerText.split("/");
            date = new Date(tmpDateArray[2], Number.parseInt(tmpDateArray[1]) - 1, Number.parseInt(tmpDateArray[0]));
        }

        if (date && !isNaN(date)) date.setDate(date.getDate() + type);
        if (date) {
            date = date.toLocaleDateString("fr-FR");
            planningDate.innerText = date;
            this.setState({ currentDate: date });
        }
    }

    async getMyAccountData() {
        try {
            let tmpUserData = {};
            tmpUserData = this.props.token;
            let res = await fetch(baseUrl + "/api/me", {
                method: "GET",
                credentials: "include"
            });
            let data = await res.json();    
            if (data) tmpUserData = data;
            this.setState({ userData: tmpUserData });
            if (AuthUser.pfp.localeCompare(data.pfp) !== 0) {
                AuthUser.pfp = data.pfp;
                const sideHeaderPfp = document.getElementById("sideHeaderUserPfp");
                if (sideHeaderPfp !== null) sideHeaderPfp.src = AuthUser.pfp;
            }
        } catch (error) {
            alert("Erreur durant la récupération du profil (Contactez un administrateur si l'erreur se répète)");
        }
    }

    async getMyFiles() {
        let res = await fetch(`${baseUrl}/users/${this.state.userData.id}/files`, {
            method: "GET",
            credentials: "include",
        })
        let resData = await res.json();
        if (resData && !resData.error) this.setState({ userFiles: resData.files });
    }

    async confirmSaveEditMyAccount() {
        let data = InputsEditComponent.getEditedValues("myAccountEditableInfosContainer");
        if (data && Object.keys(data).length > 0) {
            let res = await fetch(`${baseUrl}/users/${this.state.userData.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(data)
            })
            let resData = await res.json();
            if (resData && !resData.error) {
                // Affichage de la popup de succès
                this.setState({ message: resData.message });
                this.setState({ successPopup: true });
                this.setState({ userUpdated: true });
            } else {
                alert(resData.error);
            }
        }
    }

    formatPhoneNumber(phoneNumber) {
        let tmp = [];
        for (let i = 0; i < phoneNumber.length; i++) {
            if (i > 0 && i % 2 === 0) tmp.push(" ");
            tmp.push(phoneNumber[i]);
        }
        return tmp.join("");
    }

    showChangeMyPfpPopup() {
        this.setState({ changeMyPfpPopup: true });
        this.setState({ editMyPfpMessage: null });
    }

    showDeleteMyPfpPopup() {
        this.setState({ deleteMyPfpPopup: true });
        this.setState({ deleteMyPfpErrorMessage: null });
    }

    updatePlanning = () => this.setState({ userPlanningUpdated: true });

    async saveNewPfp() {
        try {
            let file = document.getElementById("newPfpInput");
            if (file && file.value.length > 0) {
                const formData = new FormData();
                const finalName = "user-" + this.state.userData.id + "-pfp." + file.files[0].name.split(".")[1];
                formData.append("pfp", file.files[0], finalName);
                let res = await fetch(`${baseUrl}/users/${this.state.userData.id}/file`, {
                    method: "POST",
                    mode: "cors",
                    headers: {
                        //"Content-Type": `multipart/form-data; boundary=${formData}`,
                        "Access-Control-Allow-Origin": "*"
                    },
                    credentials: "include",
                    body: formData
                })
                let resData = await res.json();
                if (resData && !resData.error) {
                    //this.setState({ message: resData.message });
                    //this.setState({ successPopup: true });
                    setTimeout(async () => {
                        this.setState({ changeMyPfpPopup: false });
                        await this.getMyAccountData();
                        await this.getMyFiles();
                    }, 2500);
                } else {
                    this.setState({ editMyPfpMessage: resData.error });
                }
            }
        } catch (error) {}
    }

    async deleteMyPfp() {
        try {
            let isDefault = (this.state.userData.pfp.includes("default-pfp")) ? true : false;
            if (!isDefault) {
                let res = await fetch(`${baseUrl}/users/${this.state.userData.id}/pfp`, {
                    method: "DELETE",
                    credentials: "include",
                });
                let resData = await res.json();
                if (resData && !resData.error) {
                    this.setState({ deleteMyPfpPopup: false });
                    this.setState({ deleteMyPfpErrorMessage: null });
                    await this.getMyAccountData();
                    await this.getMyFiles();
                } else {
                    this.setState({ deleteMyPfpErrorMessage: resData.error });
                }
            }
        } catch (error) {}
    }

    changeMyPfpPopup = () => {
        return (
            <div id="changeMyPfpPopup" className="module-popup flexbox-column justify-center text-center">
                <h4>Importer ma nouvelle photo de profil</h4>
                <input id="newPfpInput" type="file" accept="image/png" name="pfp" />
                <div className="flexbox-row justify-around">
                    <button className="edit-button" onClick={() => this.setState({ changeMyPfpPopup: false })}>Annuler</button>
                    <button className="confirm-button" onClick={() => this.saveNewPfp()}>Enregistrer</button>
                </div>
                {
                    this.state.editMyPfpMessage !== null &&
                    <p className="text-center">{this.state.editMyPfpMessage}</p>
                }
            </div>
        );
    }

    deleteMyPfpPopup = () => {
        return (
            <div id="changeMyPfpPopup" className="module-popup flexbox-column justify-center text-center">
                <h4>Voulez-vous vraiment supprimer votre de photo de profil ?</h4>
                <div className="flexbox-row justify-around">
                    <button className="edit-button" onClick={() => this.setState({ deleteMyPfpPopup: false })}>Annuler</button>
                    <button className="delete-button" onClick={() => this.deleteMyPfp()}>Confirmer</button>
                </div>
                {
                    this.state.deleteMyPfpErrorMessage !== null &&
                    <p className="text-center">{this.state.deleteMyPfpErrorMessage}</p>
                }
            </div>
        );
    }

    async componentDidMount() {
        await this.getMyAccountData();
        await this.getMyFiles();
    }

    async componentDidUpdate() {
        if (this.state.userUpdated) {
            await this.getMyAccountData();
            this.setState({ userUpdated: false });
            document.getElementById("newsletterSelectInput").value = this.state.userData.newsletter;
        }

        if (this.state.userPlanningUpdated) this.setState({ userPlanningUpdated: false });
    }

    changeMyPassword() {
        this.setState({ changePasswordPopup: true });
    }

    formatFileName(name) {
        name = name.replace("users-files/user-" + this.state.userData.id + "/", "");
        if (name.lastIndexOf("/") !== -1) name = name.slice(name.lastIndexOf("/")+1, name.length);
        return name;
    }

    render() {
        if (this.state.userData && this.state.userData.id) {
            return (
                <div className="myaccount-module-container flexbox-column">
                    <div className="myaccount-sections-container flexbox-row">
                        <section className="myaccount-section flexbox-column myaccount-pfp-section module-container-bg">
                            <div className="my-account-pfp-box">
                                <h3 className="title-section">Ma photo de profil</h3>
                                {this.state.userData && this.state.userData.pfp &&
                                    <img className="myaccount-pfp-img" alt="User Pfp" src={this.state.userData.pfp} />}
                            </div>
                            <div className="myaccount-buttons-container flexbox-row">
                                <button onClick={() => this.showDeleteMyPfpPopup()} className="delete-button">Supprimer</button>
                                <button onClick={() => this.showChangeMyPfpPopup()} className="edit-button">Modifier</button>
                            </div>
                        </section>
                        {
                            this.state.changeMyPfpPopup && this.changeMyPfpPopup()
                        }
                        {
                            this.state.deleteMyPfpPopup && this.deleteMyPfpPopup()
                        }
                        <section id="myAccountEditableInfosContainer"
                            className="myaccount-section flexbox-column myaccount-informations-section module-container-bg">
                            <h3 className="title-section">Mes informations</h3>
                            <div className="myaccount-informations-boxs-container flexbox-row">
                                <div className="myaccount-editable-infos-box">
                                    <h5>Identifiant</h5>
                                    <input placeholder={this.state.userData.id} disabled />
                                </div>
                                <div className="myaccount-editable-infos-box">
                                    <h5>Nom d'utilisateur</h5>
                                    <input name="username" autoComplete="off" defaultValue={this.state.userData.username} placeholder={this.state.userData.username} />
                                </div>
                                <div className="myaccount-editable-infos-box">
                                    <h5>Email</h5>
                                    <input name="email" autoComplete="off" defaultValue={this.state.userData.email} placeholder={this.state.userData.email} />
                                </div>
                                <div className="myaccount-editable-infos-box">
                                    <h5>Rôle</h5>
                                    <input name="rank" placeholder={this.formatedRanks[this.state.userData.rank]} disabled />
                                </div>
                            </div>
                            <div className="myaccount-informations-boxs-container flexbox-row">
                                <div className="myaccount-editable-infos-box">
                                    <h5>Prénom</h5>
                                    <input name="name" type="text" max={75} defaultValue={this.state.userData.name} placeholder={this.state.userData.name} />
                                </div>
                                <div className="myaccount-editable-infos-box">
                                    <h5>Nom de famille</h5>
                                    <input name="lastname" type="text" defaultValue={this.state.userData.lastname} placeholder={this.state.userData.lastname} />
                                </div>
                                <div className="myaccount-editable-infos-box">
                                    <h5>Adresse</h5>
                                    <input type="text" defaultValue={this.state.userData.address} placeholder={this.state.userData.address} />
                                </div>
                                <div className="myaccount-editable-infos-box">
                                    <h5>Situation</h5>
                                    <input placeholder={this.state.userData.situation} disabled />
                                </div>
                            </div>
                            <div className="myaccount-informations-boxs-container flexbox-row">
                                <div className="myaccount-editable-infos-box">
                                    <h5>Recevoir la newsletter</h5>
                                    <select id="newsletterSelectInput" name="newsletter" className="select-input" placeholder={this.state.userData.newsletter}>
                                        <option value={this.state.userData.newsletter}>
                                            {(this.state.userData.newsletter) ? "Recevoir" : "Ne pas recevoir"}
                                        </option>
                                        <option value={(this.state.userData.newsletter) ? 0 : 1}>
                                            {(this.state.userData.newsletter) ? "Ne pas recevoir" : "Recevoir"}
                                        </option>
                                    </select>
                                </div>
                                <div className="myaccount-editable-infos-box">
                                    <h5>Genre</h5>
                                    <select name="gender" className="select-input" placeholder={this.state.userData.gender}>
                                        <option value={this.state.userData.gender}>
                                            {this.genders[this.state.userData.gender]}
                                        </option>
                                        {this.genders.map((gender) => {
                                            if (gender !== this.genders[this.state.userData.gender]) {
                                                return (<option key={gender} value={this.genders.indexOf(gender)}>
                                                    {gender}
                                                </option>);
                                            } else { return null; }
                                        })}
                                    </select>
                                </div>
                                <div className="myaccount-editable-infos-box">
                                    <h5>Date de naissance</h5>
                                    <input name="birthday" placeholder={FormatDate(this.state.userData.birthday, "d-m-Y")} type="date" max={new Date().toISOString().slice(0, 10)}
                                        defaultValue={FormatDate(this.state.userData.birthday, "d-m-Y")} />
                                </div>
                                <div className="myaccount-editable-infos-box">
                                    <h5>Numéro de téléphone</h5>
                                    <input name="phone" type="text" defaultValue={this.formatPhoneNumber(this.state.userData.phone)}
                                        placeholder={this.formatPhoneNumber(this.state.userData.phone)} />
                                </div>
                            </div>
                            <div id="myAccountSaveEditButton" className="flexbox-row myaccount-buttons-container">
                                <button onClick={() => this.changeMyPassword()} className="myaccount-button edit-password-button">Modifier mon mot de passe</button>
                                <button onClick={() => this.confirmSaveEditMyAccount()} className="myaccount-button confirm-button">Enregistrer les modifications</button>
                            </div>
                        </section>
                        <section className="myaccount-section flexbox-column myaccount-files-section module-container-bg">
                            <h3 className="title-section">Mes fichiers</h3>
                            {
                                this.state.userFiles.length <= 0 &&
                                <h5>Pas de fichiers trouvés</h5>
                            }
                            {
                                this.state.userFiles.length > 0 &&
                                <div className="flexbox-column myaccount-files-container align-center">
                                    {
                                        this.state.userFiles.map((file) => {
                                            return (
                                                <div className="user-file-box-container flexbox-row">
                                                    <div className="user-file-box flexbox-column">
                                                        <button className="user-file-link" onClick={() => this.getUserFileDownload(file.name, this.state.userData.id)}>
                                                            {this.formatFileName(file.name)}
                                                        </button>
                                                        <p>Taille : {InputsEditComponent.getSizeInMo(file.size)} Mo</p>
                                                        <p>Type : {file.type.replace("/", " -> ")}</p>
                                                    </div>
                                                    <div className="flexbox-column user-file-actions-box">
                                                        {/*<button className="delete-user-file-button hover-pointer">&#10006;</button>*/}
                                                        <span onClick={() => UtilFunctions.getUserFileDownload(file.name, this.state.userData.id)} className="hover-pointer material-symbols-outlined">download</span>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    }
                                </div>
                            }
                        </section>
                    </div>
                    <div className="myaccount-sections-container flexbox-row">
                        <section className="myaccount-section flexbox-column myaccount-files-section module-container-bg">
                            <div className="myaccount-planning-action-buttons-container flexbox-row">
                                <button className="myaccount-button confirm-button" onClick={() => this.setState({ addPlanningPopup: true })}>
                                    Ajouter un élément au planning
                                </button>
                                <button className="myaccount-button edit-button" onClick={() => this.setState({ searchEditPlanningPopup: true })}>
                                    Modifier une entrée de mon planning
                                </button>
                            </div>
                            <div id="globalPlanningHead" className="flexbox-row">
                                <span onClick={() => this.moveDate(-1)} className="arrow-go_back material-symbols-outlined">arrow_back</span>
                                <h3 className="text-center" id="datePlanningTitle">
                                    Planning du jour<br /><span id="planningDateValue">{this.state.currentDate}</span>
                                </h3>
                                <span onClick={() => this.moveDate(1)} className="arrow-go_back material-symbols-outlined">arrow_forward</span>
                            </div>
                            <div className="planning-calendar my-planning">
                                <CalendarPlanning planningUpdated={this.state.userPlanningUpdated}
                                    isPersonnal={true} date={this.state.currentDate} userId={this.state.userData.id} />
                            </div>
                        </section>
                    </div>
                    {this.state.successPopup &&
                        <SuccessActionPopup
                            setSuccessActionPopup={() => this.setState({ successPopup: false })}
                            message={this.state.message}
                            setCloseStatus={() => this.setState({ hasClosedSuccessPopup: true })}
                        />
                    }
                    {
                        this.state.addPlanningPopup &&
                        <AddPlaningElementPopup userPlanningUpdated={() => this.updatePlanning()}
                            closePopup={() => this.setState({ addPlanningPopup: false })} userId={this.state.userData.id} />
                    }
                    {
                        this.state.searchEditPlanningPopup &&
                        <SearchPlanningEditPopup userPlanningUpdated={() => this.updatePlanning()}
                            closePopup={() => this.setState({ searchEditPlanningPopup: false })}
                            message={this.state.message} userId={this.state.userData.id}
                        />
                    }
                    {
                        this.state.changePasswordPopup &&
                        <EditMyPasswordPopup 
                            userId={this.state.userData.id} 
                            closePopup={() => this.setState({ changePasswordPopup: false })} 
                        />
                    }
                </div>
            );
        } else {
            return (
                <div className="loading-box flexbox-column">
                    <h3>Récupération de mon profil en cours</h3>
                    <div><span className="sync-icon material-symbols-outlined">sync</span></div>
                </div>
            );
        }
    }
};

export default MyAccount;