import React from "react";
import { useState, useEffect } from "react";
import "../../css/dashboard.css"
import { useNavigate } from "react-router-dom";
const baseUrl = require("../../config.json").baseUrl;

const FuturCollectComponent = () => {
    const [collects, setCollectsCount] = useState(null);
    const navigate = useNavigate();

    async function getCollects(){
        let res = await fetch(`${baseUrl}/api/collects/allCollects`, {
            method: "GET",
            credentials: "include",
        });
        let resultCollects = await res.json();
        let collectsCount = resultCollects.count;
        setCollectsCount(collectsCount);
    }

    useEffect(()=>{
      getCollects();
    }, [])
  return (
    <div className="futurCollect componentDashboard">
      <div className="rowDashboardComponent">
        <p>{collects}</p>
        <span class="material-symbols-outlined">acute</span>
      </div>
      <p>Collectes prévues</p>
    </div>
  );
};

export default FuturCollectComponent;