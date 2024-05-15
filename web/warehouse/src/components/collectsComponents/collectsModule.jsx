import React from "react";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Grid,} from "gridjs";
import { _ } from "gridjs-react";
import SideHeaderWarehouse from "../../components/SideHeaderWareHouse";
import WareHouseHeader from "../../components/Header";
import WareHouseFooter from "../../components/Footer";
import CreateCollectPopup from "./createCollectPopup";
import "gridjs/dist/theme/mermaid.css";
const baseUrl = require("../../config.json").baseUrl;


const CollectsModule = (props) => {
  const navigate = useNavigate();
  const wrapperRef = useRef(null);
  const [visibilityPopup, setVisibilityPopup] = useState(false);


  useEffect(() => {
    const grid = new Grid({
      search: true,
      columns: ['ID','Date de Début','Date de Fin','Chauffeur', "Accéder"],
      server: {
        method: 'GET',
        url: `${baseUrl}/api/collects/allCollects`,
        then: data => data.collects.map(collect =>
          [collect.id, collect.start_date, collect.end_date, collect.driver, 
            _(<span className="material-symbols-outlined btn-arrow pointer" onClick={() => {navigate("/collectDetail?collectId="+collect.id)}}>arrow_forward</span>)]
        )},
      sort: true,
      pagination: {
        limit: 10,
        summary: false
      },
    });

    grid.render(wrapperRef.current);

    return () => {
      grid.destroy();
    };
  }, []);

  function showPopup() {
    setVisibilityPopup(true);
  }


    return (
        <div>
            <WareHouseHeader />
            <div className="warehouseBody">
                <SideHeaderWarehouse />
                    <div className="warehouseContent">
                        <h2 className="text-center">Liste des Récoltes</h2>
                        <button onClick={showPopup} id="createNewCollectButtonAction">Créer une nouvelle collecte</button>
                        {visibilityPopup && <CreateCollectPopup setVisibilityPopup={setVisibilityPopup}/>}
                        <div ref={wrapperRef}/>
                    </div>
            </div>
            <WareHouseFooter />
        </div>
    );
};

export default CollectsModule;
