import React from "react";
import { useState, useEffect } from "react";
import "../../css/dashboard.css"
import { useNavigate } from "react-router-dom";
const baseUrl = require("../../config.json").baseUrl;

const StockFoodComponent = () => {
    const [foodStock, setFoodStock] = useState(null);
    const navigate = useNavigate();

    async function getFoodStock(){
        let res = await fetch(`${baseUrl}/api/warehouse/getStockByType/Food`, {
            method: "GET",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            credentials: "include",
        });
        let stock = await res.json();
        let foodStock = stock.count;
        setFoodStock(foodStock);
    }

    useEffect(()=>{
        getFoodStock();
    }, [])
  return (
    <div className="foodStock componentDashboard"> {/*Mettre un onclick qui mène à un graphique */}
      <div className="rowDashboardComponent">
        <p>{foodStock}</p>
        <span class="material-symbols-outlined">bakery_dining</span>
      </div>
      <p>Stock alimentaire</p>
    </div>
  );
};

export default StockFoodComponent;
