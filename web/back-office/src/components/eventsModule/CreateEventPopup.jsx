import { Component } from "react";
import "../../css/components.css"
import ErrorActionPopup from "../functionsComponents/ErrorPopup";
import InputsEditComponent from "../functionsComponents/UtilInputsComponent";
import AuthUser from "../AuthUser";
import LoadingPopup from "../functionsComponents/LoadingPopup";
const baseUrl = require("../../config.json").baseUrl;

class CreateEventPopup extends Component {
    contributorTypesOptions = [
        { value: "", text: "Rôle à choisir" },
        { value: "contributor", text: "Intervenant" },
        { value: "driver", text: "Chauffeur" }
    ];

    state = {
        itineraryPointsCount: 0,
        eventTypes: [],
        errorPopup: false,
        errorMessage: "Pas de message d'erreur",
        contributorsCount: 0,
        managersList: [],
        addressList: [],
        userId: (AuthUser.id !== 0) ? AuthUser.id : 0,
        loadingPopup: false
    };

    async componentDidMount() {
        const eventsData = await InputsEditComponent.getAllEventTypes();
        if (eventsData !== null) this.setState({ eventTypes: eventsData });
        await this.getManagersList();
    }

    async componentDidUpdate() {
        const contributorsText = document.getElementById("noContributorsText");
        if (contributorsText) contributorsText.style.display = (this.state.contributorsCount > 0) ? "none" : "block";
        const noRoadText = document.getElementById("noRoadFileText");
        if (noRoadText) noRoadText.style.display = (this.state.itineraryPointsCount > 0) ? "none" : "block";
    }

    getDefaultContributorType(contribNum) {
        const select = document.createElement("select");
        select.name = "contributor-" + contribNum + "-type";
        select.id = "contributorType-" + contribNum;

        this.contributorTypesOptions.forEach((typeOption) => {
            const option = document.createElement("option");
            option.innerText = typeOption.text;
            option.value = typeOption.value;
            select.appendChild(option);
        })

        return select;
    }

    addContributorInput() {
        const contribVal = this.state.contributorsCount + 1;
        this.setState({ contributorsCount: this.state.contributorsCount + 1 });
        const contributorsContainer = document.getElementById("contributorsContainer");

        if (contributorsContainer) {
            const newContributorDiv = document.createElement("div");
            newContributorDiv.classList.add("event-create-inputs-container");
            newContributorDiv.id = "contributorBox-" + contribVal;

            const selectContrib = document.createElement("select");
            selectContrib.name = `contributor-${contribVal}`;

            let options = "<option value=''>Intervenant à choisir</option>";
            this.state.managersList.forEach((manager) => {
                options += `
                <option key=${manager.id} value=${manager.id}>
                    ${manager.name[0].toUpperCase() + manager.name.slice(1)
                    + " " + manager.lastname[0].toUpperCase() + manager.lastname.slice(1)}
                </option>`;
            });

            selectContrib.innerHTML = options;            

            const select = this.getDefaultContributorType(contribVal);
            const deleteContributor = document.createElement("button");
            deleteContributor.innerHTML = "&#10006;";
            deleteContributor.classList.add("delete-contributor-button");
            deleteContributor.id = "deleteContributor-" + contribVal;
            deleteContributor.onclick = () => this.removeOptionItem("contributorsContainer", newContributorDiv.id);

            newContributorDiv.appendChild(selectContrib);
            newContributorDiv.appendChild(select);
            newContributorDiv.appendChild(deleteContributor);
            contributorsContainer.appendChild(newContributorDiv);
        }
    }

    addPointRoadFile() {
        const itineraryPointsCount = this.state.itineraryPointsCount + 1;
        this.setState({ itineraryPointsCount: this.state.itineraryPointsCount + 1 });
        const itineraryPointsContainer = document.getElementById("itineraryPointsContainer");

        if (itineraryPointsContainer) {
            const newRoadPointDiv = document.createElement("div");
            newRoadPointDiv.classList.add("event-road-point-box");
            newRoadPointDiv.classList.add("flexbox-row");
            newRoadPointDiv.id = "itineraryPoint-" + itineraryPointsCount;

            const inputsContainer = document.createElement("div");
            inputsContainer.classList.add("event-road-point-inputs-box");

            const addressInput = document.createElement("input");
            addressInput.placeholder = "Adresse";
            addressInput.type = "text";
            addressInput.id = `address-point-${itineraryPointsCount};`

            const cityInput = document.createElement("input");
            cityInput.placeholder = "Ville";
            cityInput.type = "text";
            cityInput.id = `city-point-${itineraryPointsCount};`

            const zipCodeInput = document.createElement("input");
            zipCodeInput.placeholder = "Code Postal";
            zipCodeInput.type = "text";
            zipCodeInput.id = `zip_code-point-${itineraryPointsCount};`

            const deleteButton = document.createElement("button");
            deleteButton.innerHTML = "&#10006;";
            deleteButton.classList.add("delete-contributor-button");
            deleteButton.id = "delete-itinerary-point-" + itineraryPointsCount;
            deleteButton.onclick = () => this.removeOptionItem("itineraryPointsContainer", newRoadPointDiv.id);

            inputsContainer.appendChild(addressInput);
            inputsContainer.appendChild(cityInput);
            inputsContainer.appendChild(zipCodeInput);
            newRoadPointDiv.appendChild(inputsContainer);
            newRoadPointDiv.appendChild(deleteButton);
            itineraryPointsContainer.appendChild(newRoadPointDiv);
        }
    }

    removeOptionItem(containerId, itemId) {
        console.log(containerId, itemId);
        const container = document.getElementById(containerId);
        const elementToDelete = document.getElementById(itemId);

        if (container && elementToDelete) {
            container.removeChild(elementToDelete);
            if (containerId === "itineraryPointsContainer") this.setState({ itineraryPointsCount: this.state.itineraryPointsCount - 1 });
            else this.setState({ contributorsCount: this.state.contributorsCount - 1 });
        }
    }

    closeCreateEventPopup() {
        this.props.setVisibilityPopup(false);
    }

    async confirmCreateEvent() {
        if (InputsEditComponent.checkInputData("createNewEventPopup", "forgotValuesNewEvent")) {
            const inputs = document.querySelectorAll("#createNewEventPopup .event-base-infos input, #createNewEventPopup .event-base-infos select");
            let bodyData = {};
            inputs.forEach((input) => {
                if (input.name.indexOf("contributor") === -1) bodyData[input.name] = input.value;
            });

            const contribInputs = document.querySelectorAll("#createNewEventPopup .contributors-list input, #createNewEventPopup .contributors-list select");
            if (contribInputs.length > 0) {
                bodyData.contributors = [];
                contribInputs.forEach((contributor) => {
                    if (contributor.name.indexOf("type") === -1) {
                        let contribIndex = contributor.name.split("-")[1];
                        const typeValue = document.getElementById("contributorType-" + contribIndex).value;
                        bodyData.contributors.push({
                            name: contributor.value, type: typeValue
                        });
                    }
                });
            }

            const waypointsInputs = document.querySelectorAll("#createNewEventPopup .waypoints-list input");
            if (waypointsInputs.length > 0) {
                bodyData.waypoints = [];
                waypointsInputs.forEach((waypoint) => {
                    if (waypoint.id.indexOf("address-point-") !== -1) {
                        let waypointIndex = waypoint.id.split("-")[2];
                        const addressValue = document.getElementById("address-point-" + waypointIndex).value;
                        const cityValue = document.getElementById("city-point-" + waypointIndex).value;
                        const zipCodeValue = document.getElementById("zip_code-point-" + waypointIndex).value;
                        bodyData.waypoints.push({
                            description: waypoint.value, address: addressValue, city: cityValue, zip_code: zipCodeValue
                        });
                    }
                });
            }

            this.setState({ loadingPopup: true });
            let res = await fetch(`${baseUrl}/events/addNewEvent`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(bodyData)
            })
            let resData = await res.json();
            this.setState({ loadingPopup: false });
            if (resData && resData.message === "success") {
                this.props.changeReloadStatus();
                this.closeCreateEventPopup();
            } else {
                this.setState({ errorPopup: true });
                this.setState({ errorMessage: (resData.error) ? resData.error : "Erreur durant la création (Contactez un administrateur si besoin)" });
            }
        } else {
            return;
        }
    }

    getManagersList = async () => {
        try {
            const res = await fetch(`${baseUrl}/users/search/by?min_rank=4`, { credentials: "include" });
            const data = await res.json();
            if (data && data.count && data.count > 0) this.setState({ managersList: data.users });
        } catch (error) {
            this.setState({ managersList: [] });
        }
    }

    /*searchManager = async (input) => {
        try {
            const value = input.target.value.split(" ");
            const formated = `name=${value[0]}` + ((value.length > 1) ? `&lastname=${value[1]}` : "");
            if (value.length > 0 && value[0] !== "") {
                const res = await fetch(`${baseUrl}/users/search/by?min_rank=4&${formated}`, { credentials: "include" });
                const data = await res.json();
                if (data && data.count && data.count > 0) this.setState({ managersList: data.users });
            }
        } catch (error) {
            this.setState({ managersList: [] });
        }
    }*/

    searchAddress = async (input) => {
        try {
            const value = input.target.value;
            if (value.length > 0 && value[0] !== "") {
                //const res = await fetch(`${baseUrl}/users/search/by?min_rank=4&${formated}`, { credentials: "include" });
                //const data = await res.json();
                //if (data && data.count && data.count > 0) this.setState({ managersList: data.users });
            }
        } catch (error) {
            this.setState({ addressList: [] });
        }
    }

    render() {
        return (
            <div id="createNewEventPopup" className="events-module module-popup">
                <h3>Créer un nouvel évènement</h3>
                <section className="event-create-form flexbox-column">
                    <div className="event-create-inputs-container event-base-infos">
                        <input name="title" max={50} min={10} type="text" placeholder="Titre" />
                        <input name="description" max={255} min={10} type="text" placeholder="Description" />
                        <select name="event_type" id="selectEventTypeInput">
                            <option value="">Type d'évènement</option>
                            {
                                this.state.eventTypes.map((eventType) =>
                                    <option key={eventType.name} value={eventType.name}>
                                        {eventType.name[0].toUpperCase() + eventType.name.replaceAll("_", " ").slice(1)}
                                    </option>
                                )
                            }
                        </select>
                    </div>
                    <div className="event-create-inputs-container event-base-infos">
                        <div>
                            <h5>Date de début</h5>
                            <input name="start_datetime" defaultValue={new Date().toISOString().slice(0, 16)} min={new Date().toISOString().slice(0, 16)} id="startDatetimeInput" type="datetime-local" />
                        </div>
                        <div>
                            <h5>Date de fin</h5>
                            <input name="end_datetime" id="endDatetimeInput" min={new Date().toISOString().slice(0, 16)} type="datetime-local" />
                        </div>
                    </div>
                    <div className="event-create-inputs-container event-base-infos">
                        <div>
                            <h5>Responsable</h5>
                            <select name="responsable" id="searchManagerInput">
                                <option value="">Choisir le responsable</option>
                                {
                                    this.state.managersList.map((manager) =>
                                        <option key={manager.id} value={manager.id}>
                                            {manager.name[0].toUpperCase() + manager.name.slice(1)
                                             + " " + manager.lastname[0].toUpperCase() + manager.lastname.slice(1)}
                                        </option>
                                    )
                                }
                            </select>
                        </div>
                        <div>
                            <h5>Lieu</h5>
                            <input name="place" placeholder="Adresse" max={255} />
                        </div>
                    </div>
                    <div className="flexbox-row event-options-container">
                        <div className="event-option-box event-create-contributors-container contributors-list flexbox-column">
                            <h4>Intervenants</h4>
                            <button onClick={() => this.addContributorInput()} className="event-option-add-button" id="addContributorToEventButton">Ajouter un intervenant</button>
                            <div className="scrollbar-thin-dark-blue event-option-content-container" id="contributorsContainer">
                                <h5 id="noContributorsText">Pas d'intervenants</h5>
                            </div>
                        </div>
                        <div className="event-option-box flexbox-column waypoints-list">
                            <h4>Feuille de route</h4>
                            <button onClick={() => this.addPointRoadFile()} className="event-option-add-button" id="addPointToRoadFile">Ajouter un point de passage</button>
                            <div className="scrollbar-thin-dark-blue event-option-content-container" id="itineraryPointsContainer">
                                <h5 id="noRoadFileText">Pas d'itinéraire actuellement</h5>
                            </div>
                        </div>
                    </div>
                </section>
                <h5 id="forgotValuesNewEvent">Des entrées sont manquantes</h5>
                <div className="popup-buttons-box">
                    <button onClick={() => this.closeCreateEventPopup()} className="cancel-button">Annuler</button>
                    <button onClick={() => this.confirmCreateEvent()} className="confirm-button">Confirmer</button>
                </div>
                {
                    this.state.errorPopup &&
                    <ErrorActionPopup message={this.state.errorMessage} closePopup={() => this.setState({ errorPopup: false })} />
                }
                {
                    this.state.loadingPopup && 
                    <LoadingPopup />
                }
            </div>
        );
    }
};

export default CreateEventPopup;