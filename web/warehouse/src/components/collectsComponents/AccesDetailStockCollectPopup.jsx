import React, {useEffect, useState, useRef} from "react";
import { Grid } from "gridjs";
import customFr from "../../assets/customFrGrid.ts";
const baseUrl = require("../../config.json").baseUrl;

const AccesDetailStockCollectPopup = (props) => {
    const wrapperRef = useRef(null);
    const idCollect = props.collect

    function closeModifyPopup() {
        props.setVisibilitDetailStockPopup(false);
    }

    useEffect(() => {
        const grid = new Grid({
          search: true,
          columns: ['ID','Titre','Quantité','Code Barre','Date d\'expiration', 'Location'],
          server: {
            method: 'GET',
            url: `${baseUrl}/api/collects/get/getAllStockByCollect/${idCollect}`,
            then: data => data.result.map(stock =>
              [stock.id, stock.title, stock.amount, stock.barcode, stock.expiry_date, stock.location ]
            )},
          sort: true,
          pagination: {
            limit: 3,
            summary: false, 
            language: customFr
          },
        });
    
        grid.render(wrapperRef.current);
    
        return () => {
          grid.destroy();
        };
      }, []);

    return (
        <div id="createNewCollectPopup" className="collects-module module-popup-access-datail-stock">
            <h3>Récolte</h3>
            <section className="user-informations-section">
                <div ref={wrapperRef}/>
            </section>  
            <div id="accessFormationPopupButtons" className="popup-buttons-box">
                <button onClick={closeModifyPopup} className="cancel-button">Fermer</button>
            </div>          
        </div>
    );
};

export default AccesDetailStockCollectPopup;