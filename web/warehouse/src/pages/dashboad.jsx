import React from "react";
import "../css/login.css";
import "../css/headerFooter.css";
import { useNavigate } from "react-router-dom";
import WareHouseHeader from "../components/Header";
import WareHouseFooter from "../components/Footer";
import SideHeaderWarehouse from "../components/SideHeaderWareHouse";
import TotalStockComponent from "../components/dashboardComponents/TotalStockComponent";
import StockFoodComponent from "../components/dashboardComponents/StockFoodComponent";
import StockDrinkComponent from "../components/dashboardComponents/StockDrinkComponent";
import NearDlcComponent from "../components/dashboardComponents/NearDlcComponent";
import DlcComponent from "../components/dashboardComponents/DlcComponent";
import MissingStockComponent from "../components/dashboardComponents/MissingStockComponent";
import FuturCollectComponent from "../components/dashboardComponents/FuturCollectComponent";
import ExpectedStockSoldComponent from "../components/dashboardComponents/ExpectedStockSoldComponent";
import LastStockAddedComponent from "../components/dashboardComponents/LastStockAddedComponent";
import ChartMissingStockComponent from "../components/dashboardComponents/ChartMissingStockComponent";
import NextCollectsComponent from "../components/dashboardComponents/NextCollectsComponent";
const baseUrl = require("../config.json").baseUrl;

const Dashboard = (props) => {
  const navigate = useNavigate();
  return (
    <>
    <WareHouseHeader/>
      <div className="warehouseBody">
        <SideHeaderWarehouse/>
        <div className="warehouseContent">
          <div className="stockInformationsContainer">
            <div className="stockInformationsRow">
              <TotalStockComponent />
              <NearDlcComponent />
              <DlcComponent />
              <ExpectedStockSoldComponent />
            </div>
            <div className="stockInformationsRow">
              <StockFoodComponent />
              <StockDrinkComponent />
              <MissingStockComponent />
              <FuturCollectComponent />
            </div>
          </div>
          <div className="rowDashboardGrid">
            <div>
              <h2>Prochaines collectes</h2>
              <NextCollectsComponent />
            </div>
            <div>
              <h2>Derniers stocks ajoutés</h2>
              <LastStockAddedComponent />
            </div>
          </div>
        </div>
      </div>
      <WareHouseFooter />
    </>
  );
};

export default Dashboard;