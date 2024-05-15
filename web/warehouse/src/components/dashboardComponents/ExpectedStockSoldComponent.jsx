import React from "react";
import { useState, useEffect } from "react";
import "../../css/dashboard.css"
const baseUrl = require("../../config.json").baseUrl;

const ExpectedStockSoldComponent = () => {
  const [expectedStocks, setexpectedStocks] = useState(null);

  async function getExpectedStock() {
    let res = await fetch(`${baseUrl}/api/warehouse/getExpectedFlow`, {
      method: "GET",
      credentials: "include",
    });
    let stock = await res.json();
    let expectedStocks = stock.count;
    setexpectedStocks(expectedStocks);
  }

  useEffect(() => {
    getExpectedStock();
  }, [])

  return (
    <div className="expectedStockDown componentDashboard"> {/*Mettre un onclick qui mène à un graphique */}
      <div className="rowDashboardComponent">
        <p>{expectedStocks}</p>
        <span class="material-symbols-outlined">move_item</span>
      </div>
      <p>Ecoulement prévues</p>
    </div>
  );
};

export default ExpectedStockSoldComponent;
