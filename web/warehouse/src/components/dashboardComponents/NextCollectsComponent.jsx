import React from "react";
import { useState, useEffect, useRef } from "react";
import "../../css/dashboard.css";
import { useNavigate } from "react-router-dom";
import { Grid } from "gridjs";
import "gridjs/dist/theme/mermaid.css";
const baseUrl = require("../../config.json").baseUrl;

const NextCollectsComponent = () => {
  const navigate = useNavigate();
  const wrapperRef = useRef(null);

  const grid = new Grid({
    columns: ["Date de Début", "Date de Fin", "Conducteur"],
    server: {
        method: 'GET',
        credentials: 'include',
        url: `${baseUrl}/api/collects/get/getNextCollect`,
        then: data => data.map(result =>
          [result.start_date, result.end_date, result.driver])
    }
  });

  useEffect(() => {
    grid.render(wrapperRef.current);
  });

  return <div className="lastStocksAdded" ref={wrapperRef} />;
};

export default NextCollectsComponent;