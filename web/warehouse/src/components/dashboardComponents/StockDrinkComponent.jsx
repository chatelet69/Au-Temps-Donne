import React from "react";
import { useState, useEffect } from "react";
import "../../css/dashboard.css"
import { useNavigate } from "react-router-dom";
const baseUrl = require("../../config.json").baseUrl;

const StockDrinkComponent = () => {
    const [drinkStock, setDrinkStock] = useState(null);
    const navigate = useNavigate();

    async function getDrinkStock(){
        let res = await fetch(`${baseUrl}/api/warehouse/getStockByType/Drink`, {
            method: "GET",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            credentials: "include",
        });
        let stock = await res.json();
        let drinkStock = stock.count;
        setDrinkStock(drinkStock);
    }

    useEffect(()=>{
        getDrinkStock();
    }, [])
  return (
    <div className="drinkStock componentDashboard"> {/*Mettre un onclick qui mène à un graphique */}
      <div className="rowDashboardComponent">
        <p>{drinkStock}</p>
        <span class="material-symbols-outlined">water_drop</span>
      </div>
      <p>Stock liquide</p>
    </div>
  );
};

export default StockDrinkComponent;
