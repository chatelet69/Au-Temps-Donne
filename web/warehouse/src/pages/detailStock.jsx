import React from "react";
import WareHouseHeader from "../components/Header";
import WareHouseFooter from "../components/Footer";
import "../css/stock.css";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import "gridjs/dist/theme/mermaid.css";
import SideHeaderWarehouse from "../components/SideHeaderWareHouse";
import GridTotalStock from "../components/stockComponent/GridTotalStock";
const baseUrl = require("../config.json").baseUrl;

const DetailStockPage = (props) => {
  const [workPlaces, setWorkPlaces] = useState([]);
  const [stockInfo, setStockInfo] = useState([]);
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const param1 = params.get("stockId");
  const navigate = useNavigate();

  useEffect(() => {
    getAllWorkPlaces()
  }, [])

  async function getAllWorkPlaces() {
    try {
      let res = await fetch(`${baseUrl}/api/work_places/getAll`, {method: "GET", credentials:"include"});
      let data = await res.json();
      if (res.status === 200) {
        document.getElementById("errorMsg4").textContent = "";
        setWorkPlaces(data.workPlaces);
      }else{
        document.getElementById("errorMsg4").textContent =
          "Une erreur est survenue durant la récupération des lieux";
      }
    } catch (error) {
      console.log(error);
    }
  }

  function showPopUp(popUpId) {
    let popUp = document.getElementById(popUpId);
    let popUpBg = document.getElementById("popUpBg");
    if(popUp.classList.contains("none")){
      popUp.classList.remove("none")
      popUpBg.classList.remove("none")
    }else{
      popUp.classList.add("none")
      popUpBg.classList.add("none")
    }
  }

  useEffect(() => {
    verifParams(param1);
  }, [param1]);

  useEffect(() => {
    if (!stockInfo) {
      navigate("/stock", { replace: true });
    }
  }, [stockInfo]);

  async function verifParams(params) {
    try {
      let res = await fetch(baseUrl + "/api/warehouse/getStockById/" + params, {
        credentials: "include",
      });
      let data = await res.json();
      if (res.status == 200) {
        setStockInfo(data.stock);
      } else {
        setStockInfo(null);
      }
    } catch (error) {
      setStockInfo(null);
    }
  }

  async function moveStock() {
    try {
      let idEntrepot = document.getElementById("selectLocationPopUp").value;
      let newLocation = document.getElementById("inputPopUpLocation").value;
      let res = await fetch(baseUrl + "/api/warehouse/moveStockByProduct", {
        method: "PATCH",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `id=${param1}&idEntrepot_fk=${idEntrepot}&location=${newLocation}`,
        credentials: "include",
      });
      if (res.status == 200) {
        document.getElementById("errorMsg1").textContent = ""
        showPopUp("popUpMoveStock")
        verifParams(param1)
      } else {
        document.getElementById("errorMsg1").textContent = "Erreur durant la modification"
      }
    } catch (error) {
      console.log(error)
      document.getElementById("errorMsg1").textContent = "Erreur durant la modification"
    }
  }

  async function deleteStock() {
    try {
      let res = await fetch(baseUrl + "/api/warehouse/deleteStockById", {
        method: "DELETE",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `id=${param1}`,
        credentials: "include",
      });
      let data = await res.json();
      if (res.status == 200) {
        document.getElementById("errorMsg3").textContent = ""
        navigate("/stock", {replace: true})
      } else {
        document.getElementById("errorMsg3").textContent = "Erreur durant la suppresion"
      }
    } catch (error) {
      console.log(error)
      document.getElementById("errorMsg3").textContent = "Erreur durant la suppresion"
    }
  }

  async function updateStock() {
    try {
      let amount = document.getElementById("inputPopUpAmount").value;
      let res = await fetch(baseUrl + "/api/warehouse/updateStockByProduct", {
        method: "PATCH",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `id=${param1}&amount=${amount}`,
        credentials: "include",
      });
      if (res.status == 200) {
        document.getElementById("errorMsg2").textContent = ""
        showPopUp("popUpEditStock")
        verifParams(param1);
      } else {
        document.getElementById("errorMsg2").textContent = "Erreur durant la modification"
      }
    } catch (error) {
      console.log(error)
      document.getElementById("errorMsg2").textContent = "Erreur durant la modification"
    }
  }

  return (
    <>
      <WareHouseHeader/>
      <div className="warehouseBody">
        <SideHeaderWarehouse/>
        <div className="warehouseContent detailStockBody">
          <div className="detailStock">
            <span
              class="material-symbols-outlined pointer"
              onClick={() => {
                navigate("/stock", { replace: true });
              }}
            >
              arrow_back
            </span>
            <div className="detailStockRow">
              {stockInfo.picture == false ||
              !stockInfo.picture ||
              stockInfo.picture == 0 ||
              stockInfo.picture == undefined ||
              stockInfo.picture == "null" ? (
                <div className="pictureContent">
                  <span class="material-symbols-outlined">no_photography</span>
                </div>
              ) : (
                <img
                  src={stockInfo.picture}
                  className="pictureContent"
                  alt="Photo du produit"
                /> 
              )}
              <div className="detailStockProduct">
                <h2>Information produit :</h2>
                <h3>Nom du produit : {stockInfo.title}</h3>
                <p>Type : {stockInfo.type}</p>
                <p>Catégorie : {stockInfo.category}</p>
                <p>Code barre : {stockInfo.barcode}</p>
                <p>
                  Allergies :{" "}
                  {stockInfo.allergy == 0 ? "Aucune" : stockInfo.allergy}
                </p>
                <p>Date de péremption : {stockInfo.expiry_date}</p>
              </div>
              <div className="detailStockProduct">
                <h2>Information stockage</h2>
                <h3>Nom de l'entrepôt : {stockInfo.entrepot}</h3>
                <p>Id stock : {stockInfo.stockId}</p>
                <p>Date d'ajout : {stockInfo.insert_date}</p>
                <p>Rangement : {stockInfo.location}</p>
                <p>Quantité : {stockInfo.amount}</p>
              </div>
            </div>
            <div className="detailStockRow">
              <div className="stockAction">
                <h2>Actions :</h2>
                <div className="detailStockAction">
                  <div onClick={() => {showPopUp("popUpMoveStock")}}>
                    <span class="material-symbols-outlined">edit</span>
                    <p>Déplacer le stock</p>
                  </div>
                  <div onClick={() => showPopUp("popUpEditStock")}>
                    <span class="material-symbols-outlined">move_down</span>
                    <p>Modifier la quantité</p>
                  </div>
                  <div onClick={() => showPopUp("popUpDelete")}>
                    <span class="material-symbols-outlined">delete</span>
                    <p>Supprimer le stock</p>
                  </div>
                  <p id="errorMsg4"></p>
                </div>
              </div>
            </div>
          </div>
          <div className="popupBg none" id="popUpBg">
            <div className="popup none" id="popUpDelete">
              <h2 className="popupTitle">Voulez vous vraiment supprimer le stock ?</h2>
              <div className="popUpBtnBox">
                <button className="btnNo pointer" onClick={() => {showPopUp("popUpDelete")}}>Non</button>
                <button className="btnYes pointer" onClick={()=>{deleteStock()}}>Oui</button>
              </div>
              <p id="errorMsg3"></p>
            </div>

            <div className="popup none" id="popUpEditStock">
              <h2 className="popupTitle">Modifier la quantité :</h2>
              <div className="popUpInputBox">
                <input className="inputPopUp" type="number" placeholder="-10" id="inputPopUpAmount"/>
              </div>
              <div className="popUpBtnBox">
                <button className="btnNo pointer" onClick={() => {showPopUp("popUpEditStock")}}>Annuler</button>
                <button className="btnYes pointer" onClick={()=>{updateStock()}}>Valider</button>
              </div>
              <p id="errorMsg2"></p>
            </div>

            <div className="popup none" id="popUpMoveStock">
              <h2 className="popupTitle">Déplacer le stock :</h2>
              <div className="popUpInputBox">
                <input className="inputPopUp" type="text" placeholder="AA00" id="inputPopUpLocation"/>
                <select name="locationStock" id="selectLocationPopUp">
                {workPlaces.map(place => (
              <option value={place.id}>{place.place_name}</option>
            ))}
                </select>
              </div>
              <div className="popUpBtnBox">
                <button className="btnNo pointer" onClick={() => {showPopUp("popUpMoveStock")}}>Annuler</button>
                <button className="btnYes pointer" onClick={()=>{moveStock()}}>Valider</button>
              </div>
              <p id="errorMsg1"></p>
            </div>
          </div>
        </div>
      </div>
      <WareHouseFooter />
    </>
  );
};
export default DetailStockPage;
