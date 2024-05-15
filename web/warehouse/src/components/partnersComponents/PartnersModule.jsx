import React from "react";
import { useState, useEffect, useRef, useHistory } from "react";
import { useNavigate } from "react-router-dom";
import { Grid, h } from "gridjs";
import { _ } from "gridjs-react";
import { frFR } from "gridjs/l10n";
import SideHeaderWarehouse from "../../components/SideHeaderWareHouse";
import WareHouseHeader from "../../components/Header";
import WareHouseFooter from "../../components/Footer";
import "gridjs/dist/theme/mermaid.css";
import AddPartnerPopup from "./AddPartnerPopup";
import DeletePartnerPopup from "./DeletePartnerPopup";
import ModifyPartnerPopup from "./ModifyPartnerPopup";
const baseUrl = require("../../config.json").baseUrl;
const categoryList = require("../../form.json").categoryList;


const PartnersModule = (props) => {
    const navigate = useNavigate();
    const wrapperRef = useRef(null);
    const [visibilityPopup, setVisibilityPopup] = useState(false);
    const [visibilityAddPartnerPopup, setVisibilityAddPartnerPopup] = useState(false);
    const [accessPartnerPopup, setaccessPartnerPopup] = useState(false);    
    const [accessPartner, setAccessPartner] = useState(null);
    const [modifyPartnerPopup, setModifyPartnerPopup] = useState(false);    
    const [modifyPartner, setModifyPartner] = useState(null);

  useEffect(() => {
    const grid = new Grid({
      search: true,
      columns: ['ID','Description','Adresse','Code Postal','Ville', "Latitude", "Longitude",
      {
        name: 'Modifier',
        formatter: (cell, row) => {
            const partnerId = row.cells[0].data;
            return h('button', {
                className: "access-user-button",
                onClick: () => showModifyPartnerPopup(partnerId)
            }, "Modifier");
        },
    },{
        name: 'Supprimer',
        formatter: (cell, row) => {
            const partnerId = row.cells[0].data;
            return h('button', {
                className: "access-user-button",
                onClick: () => showDeletePartnerPopup(partnerId)
            }, "Supprimer");
        },
    }],
      server: {
        method: 'GET',
        url: `${baseUrl}/api/partners/getAllPartners`,
        then: data => data.results.map(result =>
          [result.id, result.description, result.address, result.zip_code, result.city, result.lat, result.lng])},
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

  function showPopupAddPartner() {
    setVisibilityAddPartnerPopup(true);
  }

    function showDeletePartnerPopup(partnerId) {
        setAccessPartner(partnerId);
        setaccessPartnerPopup(true);
    }

    function showModifyPartnerPopup(partnerId) {
        setModifyPartner(partnerId);
        setModifyPartnerPopup(true);
    }


    return (
        <div>
            <WareHouseHeader />
            <div className="warehouseBody">
                <SideHeaderWarehouse />
                    <div className="warehouseContent">
                        <h2 className="text-center">Liste des Partenaires</h2>
                        <button id="createNewCollectButtonAction" onClick={showPopupAddPartner}>Ajouter un nouveau partenaire</button>
                        {visibilityAddPartnerPopup && <AddPartnerPopup setVisibilityAddPartnerPopup={setVisibilityAddPartnerPopup}/>}
                        {accessPartnerPopup && <DeletePartnerPopup partner={accessPartner} setaccessPartnerPopup={setaccessPartnerPopup}/>}
                        {modifyPartnerPopup && <ModifyPartnerPopup partner={modifyPartner} setModifyPartnerPopup={setModifyPartnerPopup}/>}
                        <div ref={wrapperRef}/>
                    </div>
            </div>
            <WareHouseFooter />
        </div>
    );
};

export default PartnersModule;
