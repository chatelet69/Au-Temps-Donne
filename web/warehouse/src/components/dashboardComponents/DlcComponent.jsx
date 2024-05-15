import React from "react";
import { useState, useEffect } from "react";
import "../../css/dashboard.css"
import { useNavigate } from "react-router-dom";
const baseUrl = require("../../config.json").baseUrl;

const DlcComponent = () => {
    const [dlcStock, setDlcStock] = useState(null);
    const navigate = useNavigate();

    async function getDlcStock(){
        let res = await fetch(`${baseUrl}/api/warehouse/getDlcProducts`, {
            method: "GET",
            credentials: "include",
        });
        let stock = await res.json();
        let dlcStock = stock.count;
        setDlcStock(dlcStock);
    }

    useEffect(()=>{
        getDlcStock();
    }, [])
  return (
    <div className="dlcStock componentDashboard"> {/*Mettre un onclick qui mène à un graphique */}
      <div className="rowDashboardComponent">
        <p>{dlcStock}</p>
        <span class="material-symbols-outlined">no_food</span>
      </div>
      <p>DLC atteinte</p>
    </div>
  );
};

export default DlcComponent;
