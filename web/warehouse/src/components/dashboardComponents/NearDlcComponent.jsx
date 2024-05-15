import React from "react";
import { useState, useEffect } from "react";
import "../../css/dashboard.css"
import { useNavigate } from "react-router-dom";
const baseUrl = require("../../config.json").baseUrl;

const NearDlcComponent = () => {
    const [nearDlcStock, setNearDlcStock] = useState(null);
    const navigate = useNavigate();

    async function getNearDlcStock(){
        let res = await fetch(`${baseUrl}/api/warehouse/getNearDlcProducts`, {
            method: "GET",
            credentials: "include",
        });
        let stock = await res.json();
        let nearDlcStock = stock.count;
        setNearDlcStock(nearDlcStock);
    }

    useEffect(()=>{
        getNearDlcStock();
    }, [])
  return (
    <div className="nearDlcStock componentDashboard"> {/*Mettre un onclick qui mène à un graphique */}
      <div className="rowDashboardComponent">
        <p>{nearDlcStock}</p>
        <span class="material-symbols-outlined">pace</span>
      </div>
      <p>DLC proche</p>
    </div>
  );
};

export default NearDlcComponent;
