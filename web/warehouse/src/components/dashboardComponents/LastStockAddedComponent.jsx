import React from "react";
import { useState, useEffect, useRef } from "react";
import "../../css/dashboard.css";
import { useNavigate } from "react-router-dom";
import { Grid } from "gridjs";
import "gridjs/dist/theme/mermaid.css";
const baseUrl = require("../../config.json").baseUrl;

const LastStockAddedComponent = () => {
  const navigate = useNavigate();
  const wrapperRef = useRef(null);

  const grid = new Grid({
    columns: ["Site", "Nom", "Date", "Quantité"],
    server: {
        method: 'GET',
        credentials: 'include',
        url: `${baseUrl}/api/warehouse/getLastStock`,
        then: data => data.lastStock.map(stock => [stock.place_name, stock.title, stock.date, stock.amount])
    }
  });

  useEffect(() => {
    grid.render(wrapperRef.current);
  });

  return <div className="lastStocksAdded" ref={wrapperRef} />;
};

export default LastStockAddedComponent;
