import React from "react";
import WareHouseHeader from "../components/Header";
import WareHouseFooter from "../components/Footer";
import "../css/stock.css";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "gridjs/dist/theme/mermaid.css";
import SideHeaderWarehouse from "../components/SideHeaderWareHouse";
import GridTotalStock from "../components/stockComponent/GridTotalStock";
const form = require("../form.json");

const baseUrl = require("../config.json").baseUrl;

const StockPage = (props) => {
  const [popUpStatus, setPopUpStatus] = useState(false);
  const [Warehouse, setWarehouse] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getAllWarehouse();
  }, []);

  async function getAllWarehouse() {
    try {
      let res = await fetch(`${baseUrl}/api/warehouses/getAll`, {
        method: "GET",
        credentials: "include",
      });
      let data = await res.json();
      if (res.status === 200) {
        console.log(data.warehouses);
        setWarehouse(data.warehouses);
        document.getElementById("errorMsg").textContent = "";
      } else {
        document.getElementById("errorMsg").textContent =
          "Une erreur est survenue durant la récupération des lieux";
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function addManuallyStock() {
    const inputs = document.querySelectorAll(
      "input, select"
    );
    let bodyData = "ok=ok";
    inputs.forEach((input) => (bodyData += `&${input.id}=${input.value}`));

    try {
      let res = await fetch(`${baseUrl}/api/warehouse/addStockInLocation`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        credentials: "include",
        body: bodyData,
      });

      let data = await res.json();
      if (res.status === 200) {
        showPopUp();
        window.location.reload()
        document.getElementById("errorMsg").textContent = "";
      } else {
        document.getElementById("errorMsg").textContent =
          "Erreur durant l'envoi";
      }
    } catch (error) {
      console.log(error);
      document.getElementById("errorMsg").textContent =
        "Une erreur est survenue durant l'ajout du stock";
    }
  }

  function showPopUp() {
    if (popUpStatus == false) {
      setPopUpStatus(true);
    } else {
      setPopUpStatus(false);
    }
  }
  return (
    <>
      <WareHouseHeader />
      <div className="warehouseBody">
        <SideHeaderWarehouse />
        <div className="warehouseContent">
          <button
            id="addManuallyBtn"
            onClick={() => {
              showPopUp();
            }}
          >
            Ajouter du stock
          </button>
          {popUpStatus == true && (
            <div className="popupBg"> 
              <div className="popup addManualyStockPopUp">
                <h2 className="popupTitle">Ajouter un stock</h2>
                <div className="addManualyStockPopUpContent">
                  <div className="productInfoPopUp">
                    <h2>Information produit</h2>
                    <div>
                      <div className="labelInput">
                        <label htmlFor="barcode">Code barre</label>
                        <input
                          type="text"
                          id="barcode"
                          placeholder="code barre"
                        />
                      </div>
                      <div className="labelInput">
                        <label htmlFor="title">Nom du stock</label>
                        <input
                          type="text"
                          id="title"
                          placeholder="Nom du produit"
                        />
                      </div>
                      <div className="labelInput">
                        <label htmlFor="amount">Quantité</label>
                        <input
                          type="number"
                          id="amount"
                          placeholder="Quantité"
                        />
                      </div>
                      <div className="labelInput">
                        <label htmlFor="type">Type de stock</label>
                        <select name="type" id="type">
                          <option value="Food">Nourriture</option>
                          <option value="Drink">Boisson</option>
                        </select>
                      </div>
                      <div className="labelInput">
                        <label htmlFor="category">Catégorie</label>
                        <select name="category" id="category">
                          {form.categoryList.map((place) => (
                            <option value={place}>{place}</option>
                          ))}
                        </select>
                      </div>
                      <div className="labelInput">
                        <label htmlFor="allergy">Allergies</label>
                        <input
                          type="text"
                          id="allergy"
                          placeholder="Allergie 1, Allergie 2..."
                        />
                      </div>
                      <div className="labelInput">
                        <label htmlFor="expiry_date">Date d'éxpiration</label>
                        <input type="date" id="expiry_date" />
                      </div>
                    </div>
                  </div>
                  <div className="locationInfoPopUp">
                    <h2>Information stockage</h2>
                    <div>
                      <div className="labelInput">
                        <label htmlFor="category">Lieu</label>
                        <select name="idEntrepot_fk" id="idEntrepot_fk">
                          {Warehouse.map((place) => (
                            <option value={place.id}>{place.place_name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="labelInput">
                        <label htmlFor="location">Emplacement</label>
                        <input type="text" id="location" placeholder="AA00" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="popUpBtnBox">
                  <button
                    className="btnNo pointer"
                    onClick={() => {
                      showPopUp();
                    }}
                  >
                    Annuler
                  </button>
                  <button
                    className="btnYes pointer"
                    onClick={() => {
                      addManuallyStock();
                    }}
                  >
                    Ajouter
                  </button>
                </div>
                    <p id="errorMsg"></p>
              </div>
            </div>
          )}
          <div className="gridTotalStock">
            <GridTotalStock />
          </div>
        </div>
      </div>
      <WareHouseFooter />
    </>
  );
};
export default StockPage;