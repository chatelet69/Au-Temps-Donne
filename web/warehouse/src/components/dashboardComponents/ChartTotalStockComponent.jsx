import React, {useEffect, useState} from "react";
import "../../css/dashboard.css"
import { Line } from "react-chartjs-2";
import Chart, { plugins } from 'chart.js/auto';
const baseUrl = require("../../config.json").baseUrl;

const ChartTotalStockComponent = () => {
    const [evolutionStockData, setEvolutionStockData] = useState([]);

    async function getEvolution() {
        try {
            let res = await fetch(`${baseUrl}/api/warehouse/getEvolutionStock`, {
                method: "GET",
                credentials: "include",
            });
            let evolution = await res.json();
            if (evolution) setEvolutionStockData(evolution.result);
        } catch (error) {
            return false;
        }
    }

    useEffect(() => {
        getEvolution();
    }, [])
    

    const labels = Array.isArray(evolutionStockData) ? evolutionStockData.map(item => new Date(item.date).toLocaleDateString()) : [];
    const data = Array.isArray(evolutionStockData) ? evolutionStockData.map(item => item.amount) : [];

    return (
        <div>
            {evolutionStockData.length > 0 ? (
                <Line data={{
                    labels: labels,
                    datasets: [
                        {
                            label: "Stock",
                            data: data,
                        },
                    ],
                }} 
                    options={{
                        plugins: {
                        title: {
                            display: true,
                            text: "Aperçu des stocks",
                        },
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                            },
                        },
                    }} 
                />
            ) : (
                <div>Loading...</div>
            )}
        </div>
    );
};

export default ChartTotalStockComponent;

