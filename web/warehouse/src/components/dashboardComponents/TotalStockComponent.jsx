import React from "react";
import { useState, useEffect } from "react";
import "../../css/dashboard.css"
import { useNavigate } from "react-router-dom";
import ChartTotalStockComponent from "./ChartTotalStockComponent"
const baseUrl = require("../../config.json").baseUrl;

const TotalStockComponent = () => {
    const [totalStock, setTotalStock] = useState(null);
    const navigate = useNavigate();

    async function getTotalStock(){
        let res = await fetch(`${baseUrl}/api/warehouse/getTotalStock`, {
            method: "GET",
            credentials: "include",
        });
        let stock = await res.json();
        let totalStock = stock.count
        setTotalStock(totalStock);
    }

    useEffect(()=>{
        getTotalStock();
    }, [])

    function changeStatePopup(){
      let popUp = document.getElementsByClassName("popUpChartTotalStock")[0];
      if(popUp.classList.contains("none")){
        popUp.classList.remove("none")
      }else{
        popUp.classList.add("none")
      }
    }

  return (
    <div>
      <div className="totalStock componentDashboard" onClick={()=>changeStatePopup()}> 
        <div className="rowDashboardComponent">
          <p>{totalStock}</p>
          <span class="material-symbols-outlined">background_dot_small</span>
        </div>
        <p>Stock total</p>
      </div>
      <div className="popUpChartTotalStock none">
        <div className="popUpContent">
          <div className="popUpHeader">
            <h2>Evolution du Stock Total :</h2>
            <span class="material-symbols-outlined pointer" onClick={() => changeStatePopup()}>close</span>
          </div>

          <ChartTotalStockComponent/>
        </div>
      </div>
    </div>
  );
};

export default TotalStockComponent;
