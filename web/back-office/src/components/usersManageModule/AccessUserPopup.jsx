import { Component } from "react";
import "../../css/components.css"
import SuccessActionPopup from "../functionsComponents/SuccessActionPopup";
import ConfirmDeleteUserPopup from "./ConfirmDeleteUserPopup";
import InputsEditComponent from "../functionsComponents/UtilInputsComponent";
const baseUrl = require("../../config.json").baseUrl;

class AccessUserPopup extends Component {
    state = {
        user: null,
        successPopup: false,
        message: "Pas de message additionnel",
        hasClosedSuccessPopup: false,
        confirmDeleteUserPopup: false,
        userFiles: null
    };

    closeAccessUserPopup() { this.props.setVisibilityPopup(false); }
    //closeSuccessPopup() { this.setState({ successPopup: false }) }

    deleteUserAction() { this.setState({ confirmDeleteUserPopup: true }); }

    async getUser(userId) {
        // The first cell of the row is the userId
        let res = await fetch(`${baseUrl}/users/${userId}/full`, {
            method: "GET",
            credentials: "include",
        })
        let resData = await res.json();
        if (resData && !resData.error) this.setState({ user: resData });
    }

    async getUserFiles(userId) {
        let res = await fetch(`${baseUrl}/users/${userId}/files`, {
            method: "GET",
            credentials: "include",
        })
        let resData = await res.json();
        if (resData && !resData.error) this.setState({ userFiles: resData.files });
    }

    async confirmSaveEditUser() {
        let data = InputsEditComponent.getEditedValues("accessUserPopup");
        if (Number.parseInt(document.getElementById("selectRankUserInput").value) !== Number.parseInt(this.state.user.rank)) {
            data.rank = Number.parseInt(document.getElementById("selectRankUserInput").value);
        }
        if (data && Object.keys(data).length > 0) {
            let res = await fetch(`${baseUrl}/users/${this.state.user.id}`, {
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
            } else {
                alert(resData.error);
            }
        }
    }

    async getUserFileDownload(fileName, userId) {
        if (fileName.length > 0 && userId !== 0) {
            let res = await fetch(`${baseUrl}/users/${this.state.user.id}/file?filename=${fileName}`, {
                method: "GET",
                mode: "cors",
                credentials: "include"
            })
            let resData = await res.json();
            if (resData && !resData.error) {
                let link = document.createElement("a");
                link.href = resData.fileLink;
                link.target = "_blank";
                link.setAttribute("download", fileName.replace("users-files/user-" + userId + "/", ""));
                link.click();
                link.remove();
            } else {
                alert(resData.error);
            }
        }
    }

    // Component Mounting (Creation)
    async componentDidMount() {
        const userId = this.props.user._cells[0].data;
        await this.getUser(userId);
        await this.getUserFiles(userId);
    }

    // Component updating (the state or other stuff of the component)
    async componentDidUpdate() {
        if (this.state.hasClosedSuccessPopup) {
            this.closeAccessUserPopup();
            // Met à jour le statut (chez le parent) afin que le module parent rafraichisse sa grille 
            this.props.setUserEditedStatus();
        }
    }

    render() {
        // Show User Popup or Loading Message
        if (this.state.user) {
            return (
                <div id="accessUserPopup" className="user-module module-popup">
                    <h4 className="text-center">Utilisateur {this.state.user.username}</h4>
                    <section className="user-section flexbox-row">
                        <section className="user-informations-section flexbox-column">
                            <div className="user-informations-under-section flexbox-row basic-informations">
                                <div className="user-infos-box id-box">
                                    <h6>Identifiant</h6>
                                    <h5>{this.state.user.id}</h5>
                                </div>
                                <div className="user-infos-box username-box">
                                    <h6>Pseudonyme</h6>
                                    <input type="text" name="username" placeholder={this.state.user.username} />
                                </div>
                                <div className="user-infos-box email-box">
                                    <h6>Email</h6>
                                    <input type="text" max={255} name="email" placeholder={this.state.user.email} />
                                </div>
                            </div>
                            <div className="user-informations-under-section flexbox-row">
                                <div className="user-infos-box email-box">
                                    <h6>Prénom</h6>
                                    <input type="text" name="name" placeholder={this.state.user.name} />
                                </div>
                                <div className="user-infos-box email-box">
                                    <h6>Nom</h6>
                                    <input type="text" max={255} name="lastname" placeholder={this.state.user.lastname} />
                                </div>
                                <div className="user-infos-box email-box">
                                    <h6>Date de naissance</h6>
                                    <input type="text" max={255} name="birthday" placeholder={this.state.user.birthday} />
                                </div>
                            </div>
                            <div className="user-informations-under-section flexbox-row">
                                <div className="user-infos-box rank-box">
                                    <h6>Rôle actuel</h6>
                                    <select name="rank" defaultValue={this.state.user.rank} id="selectRankUserInput">
                                        <option value="">Rang à attribuer</option>
                                        <option value="1">Utilisateur</option>
                                        <option value="2">Bénéficiaire</option>
                                        <option value="3">Partenaire</option>
                                        <option value="4">Bénévole</option>
                                        <option value="5">Responsable</option>
                                        <option value="8">Administrateur</option>
                                    </select>
                                </div>
                                <div className="user-infos-box address-box">
                                    <h6>Adresse</h6>
                                    <input name="address" placeholder={this.state.user.address} max={255} min={10} type="text" />
                                </div>
                                <div className="user-infos-box phone-box">
                                    <h6>Téléphone</h6>
                                    <input name="phone" type="text" placeholder={this.state.user.phone} />
                                </div>
                            </div>
                            {/*<div className="user-informations-under-section flexbox-row">*/}
                                {/*<div className="user-infos-box notifications-box">
                                    <h6>Notifications</h6>
                                    <input name="responsable" min={0} max={1} type="number" placeholder={this.state.user.notifications} />
            </div>*/}
                                {/*<div className="user-infos-box newsletter-box">
                                    <h6>Newsletter</h6>
                                    <input name="newsletter" max={1} min={0} type="number" placeholder={this.state.user.newsletter} />
            </div>*/}
                            {/*</div>*/}
                        </section>
                        <section className="user-pfp-section">
                            <h5>Photo de profil</h5>
                            <div id="userPfpContainer" className="user-pfp-container">
                                {this.state.user.pfp && <img alt="User Pfp" src={this.state.user.pfp} />}
                                {!this.state.user.pfp && <h3>Pas de photo</h3>}
                            </div>
                        </section>
                        <section className="user-files-section">
                            <h5>Fichiers de l'utilisateur</h5>
                            <div id="userFilesContainer" className="user-files-container">
                                {this.state.userFiles && this.state.userFiles.length > 0 &&
                                    this.state.userFiles.map((userFile) =>
                                        <div className="user-file-box-container flexbox-row">
                                            <div className="user-file-box flexbox-column">
                                                <button className="user-file-link" onClick={() => this.getUserFileDownload(userFile.name, this.state.user.id)}>
                                                    {userFile.name.replace("users-files/user-" + this.state.user.id + "/", "")}
                                                </button>
                                                <p>Taille : {InputsEditComponent.getSizeInMo(userFile.size)} Mo</p>
                                                <p>Type : {userFile.type.replace("/", " -> ")}</p>
                                            </div>
                                            <div className="flexbox-column user-file-actions-box">
                                                <button className="delete-user-file-button hover-pointer">&#10006;</button>
                                                <span onClick={() => this.getUserFileDownload(userFile.name, this.state.user.id)} className="hover-pointer material-symbols-outlined">download</span>
                                            </div>
                                        </div>
                                    )
                                }
                                {!this.state.userFiles && <h3>Aucun fichier</h3>}
                            </div>
                        </section>
                    </section>
                    <div id="accessUserPopupButtons" className="popup-buttons-box">
                        <div>
                            <button onClick={() => this.deleteUserAction()} className="delete-button">Supprimer</button>
                            <button onClick={() => this.confirmSaveEditUser()} className="confirm-button">Enregistrer</button>
                        </div>
                        <button onClick={() => this.closeAccessUserPopup()} className="cancel-button">Fermer</button>
                    </div>
                    {this.state.successPopup &&
                        <SuccessActionPopup
                            setSuccessActionPopup={() => this.setState({ successPopup: false })}
                            message={this.state.message}
                            setCloseStatus={() => this.setState({ hasClosedSuccessPopup: true })}
                        />}
                    {this.state.confirmDeleteUserPopup &&
                        <ConfirmDeleteUserPopup
                            setConfirmDeleteUserPopup={() => this.setState({ confirmDeleteUserPopup: false })}
                            username={this.state.user.username}
                            userIdToDelete={this.state.user.id}
                            setCloseStatus={() => this.setState({ hasClosedSuccessPopup: true })}
                        />}
                </div>
            );
        } else {
            return (
                <div id="createNewEventPopup" className="events-module module-popup">
                    <h4>Chargement en cours de l'utilisateur</h4>
                </div>
            );
        }
    }
};

export default AccessUserPopup;