import { Component } from "react";
import "../../css/components.css"
import SuccessActionPopup from "../functionsComponents/SuccessActionPopup";
import UtilInputsComponent from "../functionsComponents/UtilInputsComponent";
import ErrorActionPopup from "../functionsComponents/ErrorPopup";
import ViewPlanningElementPopup from "./ViewPlanningElementPopup";
const baseUrl = require("../../config.json").baseUrl;

class SearchPlanningEditPopup extends Component {
    state = {
        userId: this.props.userId,
        successPopup: false,
        message: "Pas de message additionnel",
        errorMessage: "Erreur lors de l'ajout",
        hasClosedSuccessPopup: false,
        userFiles: null,
        types: null,
        dispoType: "disponibility",
        planningsFound: [],
        editPlanningPopup: false,
        planningToEdit: {}
    };

    closeAccessUserPopup() { this.props.setVisibilityPopup(false); }

    async confirmAddPlanningElement() {
        if (UtilInputsComponent.checkInputData("addPlanningInputsContainer", "missingValuesPlanning")) {
            const inputs = document.querySelectorAll("#addPlanningInputsContainer input, #addPlanningInputsContainer select");
            const bodyData = {};
            inputs.forEach((input) => bodyData[input.name] = input.value);
            bodyData.disponibility_type = this.state.dispoType;

            let res = await fetch(`${baseUrl}/api/volunteer/editDisponibility`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(bodyData)
            })
            let resData = await res.json();
            if (resData && !resData.error) {
                // Show Success Popup
                this.setState({ message: resData.message });
                this.setState({ successPopup: true });
            } else {
                // Show Error Popup
                if (resData.error) this.setState({ errorMessage: resData.error });
                this.setState({ errorPopup: true });
            }
        }
    }

    getFiltersSelected() {
        try {
            const filterInputs = document.querySelectorAll("#filtersSearchPlanning input");
            let finalFilters = null;
            if (filterInputs !== undefined) {
                finalFilters = "";
                filterInputs.forEach((filterInput) => {
                    if (filterInput.checked === true) {
                        switch (filterInput.value) {
                            case "disponibility":
                            case "activity":
                                finalFilters[filterInput.value] = true;
                                break;
                            case "startDate":
                            case "endDate":
                                break;
                            case "description":
                                const descInput = document.getElementById("planningSearchInput");
                                if (descInput && descInput.value.length > 0) finalFilters = "description="+descInput.value;
                                break;
                            default: break;
                        }
                    }
                })
            }
            return finalFilters;
        } catch (error) {
            return null;
        }
    }

    openEditPlanningPopup(planning) {
        this.setState({ editPlanningPopup: true });
        this.setState({ planningToEdit: planning });
    }

    async searchPlanningElement() {
        try {
            const descInput = document.getElementById("planningSearchInput");
            if (descInput && descInput.value.length > 0) document.getElementById("descriptionFilterInput").checked = true;
            const filters = this.getFiltersSelected();
            if (filters !== null && filters !== "") {
                let res = await fetch(`${baseUrl}/api/volunteers/planning?${filters}`, { credentials: "include", })
                let resData = await res.json();
                if (resData && resData.plannings) this.setState({ planningsFound: resData.plannings });
            } else {
                this.setState({ planningsFound: [] });
            }
        } catch (error) {
            return;
        }
    }

    async componentDidMount() {
        const data = await UtilInputsComponent.getAllEventTypes();
        if (data !== null) this.setState({ types: data });
    }

    async componentDidUpdate() {
        if (this.state.hasClosedSuccessPopup === true) {
            this.props.closePopup();
            this.props.userPlanningUpdated();
        }
    }

    changeDispoType = (changeType) => this.setState({ dispoType: changeType.target.value });

    render() {
        if (this.state.userId) {
            return (
                <div id="addPlaningPopup" className="user-module module-popup">
                    <h3 className="text-center">Modifier un élément de mon planning</h3>
                    <section id="addPlanningInputsContainer" className="user-section flexbox-column">
                        <div className="flexbox-row justify-center">
                            <div className="search-planning-element-box">
                                <h5>Filtre</h5>
                                <fieldset id="filtersSearchPlanning" className="filters-checkbox-options-container flexbox-row">
                                    <div className="filter-checkbox-option">
                                        <input defaultChecked={true} type="checkbox" id="descriptionFilterInput" value="description"/>
                                        <label htmlFor="descriptionFilterInput">Description</label>
                                    </div>
                                    <div className="filter-checkbox-option">
                                        <input type="checkbox" id="disponibilityFilterInput" value="disponibility"/>
                                        <label htmlFor="disponibilityFilterInput">Disponible</label>
                                    </div>
                                    <div className="filter-checkbox-option">
                                        <input type="checkbox" id="activityFilterInput" value="activity"/>
                                        <label htmlFor="activityFilterInput">Activité</label>
                                    </div>
                                    <div className="filter-checkbox-option">
                                        <input type="checkbox" id="startDateFilterInput" value="startDate"/>
                                        <label htmlFor="startDateFilterInput">Date de début</label>
                                    </div>
                                    <div className="filter-checkbox-option">
                                        <input type="checkbox" id="endDateFilterInput" value="endDate"/>
                                        <label htmlFor="endDateFilterInput">Date de fin</label>
                                    </div>
                                </fieldset>
                            </div>
                        </div>
                        <div className="mt-1 flexbox-row justify-center">
                            <div className="search-planning-element-box">
                                <h5>Chercher l'élément à modifier</h5>
                                <input onChange={() => this.searchPlanningElement()} className="search-input-a" id="planningSearchInput" type="text" name="description"/>
                            </div>
                        </div>
                    </section>
                        {
                            this.state.planningsFound.length > 0 &&
                            <div className="planning-found-container scrollbar-thin-dark-blue flexbox-column align-center">
                            {
                                this.state.planningsFound.map((planning) => {
                                    return (
                                        <div className="planning-editable-box flexbox-row align-center">
                                            <div className="flexbox-column">
                                                <h6>ID {planning.id}</h6>
                                                <h5>
                                                    {(planning.description.length <= 12) ? planning.description : planning.description.slice(0, 12) + "..."}
                                                </h5>
                                                <p>{(planning.disponibility_type === 1) ? "Disponibilité" : "Activité"}</p>
                                            </div>
                                            <div className="action-buttons-planning-edit flexbox-row justify-center"> 
                                                <button onClick={() => this.openEditPlanningPopup(planning)} className="edit-planning-button">Modifier</button>
                                                <button className="delete-button">Supprimer</button>
                                            </div>
                                        </div>
                                    );
                                })
                            }
                            </div>
                        }
                    <div className="popup-buttons-box flexbox-row">
                        <button onClick={() => this.props.closePopup()} className="close-button">Fermer</button>
                    </div>
                    {
                        this.state.editPlanningPopup && 
                        <ViewPlanningElementPopup 
                            closePopup={() => this.setState({ editPlanningPopup: false, planning: {} })} 
                            userId={this.state.userId} 
                            planning={this.state.planningToEdit} 
                        />
                    }
                    {this.state.successPopup &&
                        <SuccessActionPopup
                            setSuccessActionPopup={() => this.setState({ successPopup: false })}
                            message={this.state.message}
                            setCloseStatus={() => this.setState({ hasClosedSuccessPopup: true })}
                        />
                    }
                    {this.state.errorPopup &&
                        <ErrorActionPopup
                            closePopup={() => this.setState({ errorPopup: false })}
                            message={this.state.errorMessage}
                        />
                    }
                </div>
            );
        }
    }
};

export default SearchPlanningEditPopup;