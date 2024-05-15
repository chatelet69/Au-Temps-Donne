import React from "react";
import { useState, useEffect } from "react";
import "../../css/dashboard.css"
import { useNavigate } from "react-router-dom";
import { Line } from "react-chartjs-2";
import Chart, { plugins } from 'chart.js/auto';
import Cookies from "js-cookie";
const baseUrl = require("../../config.json").baseUrl;


const ChartMissingStockComponent = (props) => {
    const [StockCategories, setCategories] = useState(null);
    const [StockValues, setValues] = useState(null);
    const [StockLimit, setLimit] = useState(null);
    const [totalStock, setTotalStock] = useState(null);
    const navigate = useNavigate();

    async function getTotalStock(props){
        let res = await fetch(`${baseUrl}/api/warehouse/getStockGroupByType`, {
            method: "GET",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            credentials: "include",
        });
        let stock = await res.json();
        let totalStock = stock.stock;
        let cat = [];
        let val = [];
        let lim = [];
        for (let i = 0; i < totalStock.length; i++) {
            cat.push(totalStock[i].category);
            val.push(totalStock[i].amount);
            lim.push(50)
        }
        setLimit(lim)
        setCategories(cat)
        setValues(val)
    }

    useEffect(()=>{
        if(Cookies.get("atdCookie")) getTotalStock();
    }, [])


if(StockCategories && StockValues){
    return (
        <div>
        <Line data={
            {
                datasets: [{
                    type: 'bar',
                    label: 'Catégories',
                    data: StockValues
                }, {
                    type: 'line',
                    label: 'Seuil critique',
                    data: StockLimit,
                }],
                labels: StockCategories,
                options:{
                    plugins:{
                        title:{
                            display:true,
                            text: "Titre"
                        }
                    }
                }
            }
            
        }
        />
    </div>
  );
};
}

export default ChartMissingStockComponent;
