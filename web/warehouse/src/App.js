import "./App.css";
import React from "react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import StockPage from "./pages/stock";
import DetailStockPage from "./pages/detailStock";
import CollectDetail from "./components/collectsComponents/AccesCollectDetails";
import CollectsModule from "./components/collectsComponents/collectsModule";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/login";
import Error404 from "./pages/errors/error404";
import Dashboard from "./pages/dashboad";
import PartnersModule from "./components/partnersComponents/PartnersModule";

function App() {
  return (
    <Router>
      {/*this.state.isLogged && <WareHouseHeader onSuccessLogout={() => this.setState({ isLogged: false })}/> */}
      <Routes>
        <Route exact path="/" element={<Login/>} />
          <Route path="/dashboard" element={<Dashboard/>} />
          <Route path="/stock" element={<StockPage/>} />
          <Route
            path="/detailStock"
            element={<DetailStockPage/>}
          />
          <Route path="/collects" element={<CollectsModule/>}/>
          <Route path="/collectDetail" element={<CollectDetail/>}/>
          <Route path="/partners" element={<PartnersModule/>}/>
        <Route path="*" element={<Error404 />} />
      </Routes>
    </Router>
  );
}

export default App;