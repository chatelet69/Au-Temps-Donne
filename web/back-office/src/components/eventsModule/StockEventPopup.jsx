import React, { Component } from "react";
import "../../css/components.css"
import { Grid, h } from "gridjs";
import customFr from "../../assets/customFrGrid.ts";
import ErrorActionPopup from "../functionsComponents/ErrorPopup";
import AddStockElementPopup from "./AddStockElementPopup.jsx";
import EditEventStockPopup from "./EditEventStockPopup.jsx";
const baseUrl = require("../../config.json").baseUrl;

class StockEventPopup extends Component {
    grid;
    state = {
        errorPopup: false,
        errorMessage: "Pas de message d'erreur",
        stockElementsCount: 0,
        totalElementsCount: 0,
        wrapperRef: React.createRef(),
        eventId: this.props.eventId,
        addStockElementVisibility: false,
        editStockPopupVisibility: false,
        eventStockElementIdToEdit: null,
        eventStockElementNameToEdit: null,
        stockElementIdToEdit: null,
        stockElementAmountToEdit: 0,
        deliverStockMessage: null,
        deliverStockElement: false,
        cancelDeliverStockElement: false,
        isDelivered: false
    };

    editStockElementAction(row) {
        try {
            const eventStockElementId = Number.parseInt(row._cells[0].data);
            const stockElementId = Number.parseInt(row._cells[1].data);
            const stockAmount = Number.parseInt(row._cells[3].data);
            const eventStockElementName = row._cells[2].data;
            this.setState({ eventStockElementIdToEdit: eventStockElementId });
            this.setState({ stockElementIdToEdit: stockElementId });
            this.setState({ stockElementAmountToEdit: stockAmount });
            this.setState({ eventStockElementNameToEdit: eventStockElementName });
            this.setState({ editStockPopupVisibility: true });
        } catch (error) {
            this.setState({ errorMessage: "Erreur durant la suppresion" });
            this.setState({ errorPopup: true });
        }
    }

    deliverStockElementAction(row) {
        try {
            const eventStockElementId = Number.parseInt(row._cells[0].data);
            const stockElementId = Number.parseInt(row._cells[1].data);
            const stockAmount = Number.parseInt(row._cells[3].data);
            const isDelivered = row._cells[4].data;

            this.setState({ eventStockElementIdToEdit: eventStockElementId });
            this.setState({ stockElementIdToEdit: stockElementId });
            this.setState({ stockElementAmountToEdit: stockAmount });

            if (isDelivered === "delivered") {
                this.setState({ cancelDeliverStockElement: true });
                this.setState({ isDelivered: true });
                this.setState({ deliverStockElement: false });
            } else {
                this.setState({ cancelDeliverStockElement: false });
                this.setState({ deliverStockElement: true });
                this.setState({ isDelivered: false });
            }
        } catch (error) {
            this.setState({ errorMessage: "Erreur durant l'exécution de l'action" });
            this.setState({ errorPopup: true });
        }
    }

    showDeliverStockElement = () => {
        return (
            <div id="confirmDeliverStockEvent" className="module-popup flexbox-column justify-center text-center">
                <h4>Confirmer la sortie des stocks de cet élément ?</h4>
                <div className="flexbox-row justify-around">
                    <button className="edit-button" onClick={() => this.setState({ deliverStockElement: false })}>Annuler</button>
                    <button className="delete-button" onClick={() => this.confirmDeliverAction()}>Confirmer</button>
                </div>
                {
                    this.state.deliverStockMessage !== null &&
                    <p className="text-center">{this.state.deliverStockMessage}</p>
                }
            </div>
        );
    }

    showCancelDeliverStockElement = () => {
        return (
            <div id="confirmCancelDeliverStockEvent" className="module-popup flexbox-column justify-center text-center">
                <h4>Annuler la sortie du stock de l'élément ?</h4>
                <div className="flexbox-row justify-around">
                    <button className="edit-button" onClick={() => this.setState({ cancelDeliverStockElement: false })}>Annuler</button>
                    <button className="delete-button" onClick={() => this.confirmDeliverAction()}>Confirmer</button>
                </div>
                {
                    this.state.deliverStockMessage !== null &&
                    <p className="text-center">{this.state.deliverStockMessage}</p>
                }
            </div>
        );
    }

    async confirmDeliverAction() {
        try {
            const deliverEndpoint = (this.state.isDelivered) ? "cancelDeliver" : "deliver";
            this.setState({ deliverStockMessage: null });
            const bodyData = { stockId: this.state.stockElementIdToEdit, stockAmount: this.state.stockElementAmountToEdit };
            const res = await fetch(`${baseUrl}/events/event/${this.state.eventId}/stockElements/${this.state.eventStockElementIdToEdit}/${deliverEndpoint}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(bodyData)
            });
            const data = await res.json();
            if (data && !data.error) {
                this.setState({ deliverStockElement: false });
                this.setState({ cancelDeliverStockElement: false });
                this.updateGrid();
            }
        } catch (error) {
            this.setState({ deliverStockMessage: "Erreur durant l'opération" });
        }
    }

    // I have to go quickly so there is surely code that could be simplified / refacto

    async deleteStockElementAction(row) {
        try {
            const eventStockElementId = Number.parseInt(row._cells[0].data);
            if (eventStockElementId >= 0) {
                const res = await fetch(`${baseUrl}/events/event/${this.state.eventId}/stockElements/${eventStockElementId}`, {
                    method: "DELETE",
                    credentials: "include",
                });
                const data = await res.json();
                if (data === null || data.error) {
                    this.setState({ errorMessage: (data.error) ? data.error : "Erreur durant la suppresion" });
                    this.setState({ errorPopup: true });
                } else {
                    this.updateGrid(true);
                }
            }
        } catch (error) {
            this.setState({ errorMessage: "Erreur durant la suppresion" });
            this.setState({ errorPopup: true });
        }
    }

    initDataGrid() {
        this.grid = new Grid().updateConfig({
            columns: [{ name: "LId", width: "8%", hidden: true }, { name: "ID", hidden: true, },
                "Nom", { name: "Montant", width: "10%" }, "Statut", { name: "Catégorie", width: "20%" }, "DLC", "Entrepôt", "Case",
            {
                formatter: (cell, row) => {
                    return h('span', {
                        className: "material-symbols-outlined cross remove-stock-button",
                        onClick: () => this.deleteStockElementAction(row),
                    }, "close");
                },
            },
            {
                formatter: (cell, row) => {
                    return h('span', {
                        className: "material-symbols-outlined edit-stock-button",
                        onClick: () => this.editStockElementAction(row),
                    }, "edit");
                },
            },
            {
                formatter: (cell, row) => {
                    return h('span', {
                        className: "material-symbols-outlined edit-stock-button",
                        onClick: () => this.deliverStockElementAction(row),
                    }, (row._cells[4].data === "delivered") ? "inventory_2" : "inventory");
                },
            }],
            search: false,
            server: {
                method: "GET",
                url: `${baseUrl}/events/event/${this.state.eventId}/stockElements`,
                credentials: "include",
                then: data => data.stocks.map(stock => [
                    stock.id, stock.elementStockId, stock.name, stock.amount, stock.status,
                    ((stock.category.length > 35) ? stock.category.slice(0, 35) + "..." : stock.category),
                    stock.expiry_date, stock.warehouseName, stock.location
                ])
            },
            style: { table: { "text-align": "center" }, },
            sort: true,
            pagination: { limit: 3 },
            language: customFr
        });
        this.grid.render(this.state.wrapperRef.current);
    }

    updateGrid() {
        this.state.wrapperRef.current.innerHTML = "";
        this.grid.updateConfig({
            server: {
                method: "GET",
                url: `${baseUrl}/events/event/${this.state.eventId}/stockElements`,
                credentials: "include",
                then: data => data.stocks.map(stock => [
                    stock.id, stock.elementStockId, stock.name, stock.amount, stock.status,
                    ((stock.category.length > 35) ? stock.category.slice(0, 35) + "..." : stock.category),
                    stock.expiry_date, stock.warehouseName, stock.location
                ])
            },
        });
        this.grid.render(this.state.wrapperRef.current);
        this.grid.forceRender();
    }

    async componentDidMount() {
        this.initDataGrid(false);
    }

    openAddStockElementPopup() {
        this.setState({ addStockElementVisibility: true });
    }

    closeStockEventPopup() {
        this.props.setVisibilityPopup(false);
    }

    render() {
        return (
            <div id="stockEventPopup" className="events-module module-popup">
                <h3>Stocks liés à l'évènement</h3>
                <section className="event-create-form flexbox-column">
                    <div className="event-option-box event-create-contributors-container contributors-list flexbox-column">
                        <button onClick={() => this.openAddStockElementPopup()} className="event-option-add-button" id="addStockElementButton">
                            Ajouter un élément
                        </button>
                        <div className="" id="stockElementsContainer">
                            <div id="stockElementsGridbox" ref={this.state.wrapperRef} />
                        </div>
                    </div>
                </section>
                <h5 id="forgotValuesNewEvent">Des entrées sont manquantes</h5>
                <div className="popup-buttons-box">
                    <button onClick={() => this.closeStockEventPopup()} className="cancel-button">Fermer</button>
                </div>
                {
                    this.state.errorPopup &&
                    <ErrorActionPopup message={this.state.errorMessage} closePopup={() => this.setState({ errorPopup: false })} />
                }
                {
                    this.state.addStockElementVisibility &&
                    <AddStockElementPopup
                        eventId={this.props.eventId}
                        setVisibilityPopup={() => this.setState({ addStockElementVisibility: false })}
                        updateGrid={() => this.updateGrid()}
                    />
                }
                {
                    this.state.editStockPopupVisibility &&
                    <EditEventStockPopup
                        eventId={this.props.eventId}
                        setVisibilityPopup={() => this.setState({ editStockPopupVisibility: false })}
                        elementStockId={this.state.eventStockElementIdToEdit}
                        stockId={this.state.stockElementIdToEdit}
                        oldAmount={this.state.stockElementAmountToEdit}
                        elementStockName={this.state.eventStockElementNameToEdit}
                        updateGrid={() => this.updateGrid()}
                    />
                }
                {
                    this.state.deliverStockElement &&
                    this.showDeliverStockElement()
                }
                {
                    this.state.cancelDeliverStockElement &&
                    this.showCancelDeliverStockElement()
                }
            </div>
        );
    }
};

export default StockEventPopup;