import React from "react";
import { useState, useEffect } from "react";
import "../../css/dashboard.css";
import { useNavigate } from "react-router-dom";
import ChartMissingStockComponent from "./ChartMissingStockComponent";
const baseUrl = require("../../config.json").baseUrl;

const MissingStockComponent = () => {
  const [missingStock, setMissingStock] = useState(null);
  const navigate = useNavigate();

  async function getMissingStock() {
    try {
      let res = await fetch(`${baseUrl}/api/warehouse/getMissingStock`, {
        // rajoute ?missingAmount=<VALEUR> pour voir les éléments qui ont un stock inférieur à <VALUE>
        method: "GET",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        credentials: "include",
      });
      let stock = await res.json();
      let missingStock = stock.count;
      console.log("stock : " + stock)
      setMissingStock(missingStock);
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    getMissingStock();
  }, []);

  function changeStatePopup(){
    let popUp = document.getElementsByClassName("popUpChart")[0];
    if(popUp.classList.contains("none")){
      popUp.classList.remove("none")
    }else{
      popUp.classList.add("none")
    }
  }
  return (
    <>
      <div className="missingStock componentDashboard" onClick={()=>changeStatePopup()}>
        <div className="rowDashboardComponent">
          <p>{missingStock}</p>
          <span class="material-symbols-outlined">rule</span>
        </div>
        <p>Elements manquants</p>
      </div>
      <div className="popUpChart none">
        <div className="popUpContent">
          <div className="popUpHeader">
            <h2>Stock par catégories :</h2>
            <span class="material-symbols-outlined pointer" onClick={() => changeStatePopup()}>close</span>
          </div>

          <ChartMissingStockComponent />
        </div>
      </div>
    </>
  );
};

export default MissingStockComponent;
