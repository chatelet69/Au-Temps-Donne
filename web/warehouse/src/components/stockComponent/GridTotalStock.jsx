import React from "react";
import { useState, useEffect, useRef } from "react";
import "../../css/stock.css";
import { useNavigate } from "react-router-dom";
import { Grid, h } from "gridjs";
import { _ } from "gridjs-react";
import { frFR } from "gridjs/l10n";
import "gridjs/dist/theme/mermaid.css";
const baseUrl = require("../../config.json").baseUrl;
const categoryList = require("../../form.json").categoryList;

const GridTotalStock = () => {
  const navigate = useNavigate();
  const wrapperRef = useRef(null);

  const grid = new Grid({
    width:'90%',
    autoWidth: true,
    sort: true,
    pagination:{
        limit: 10
    },
    search: true,
    language: frFR,
    resizable: true,
    columns: ["Code barre", "Nom", "Rangement", "Catégorie", "Date d'ajout", "DLC", "Quantité", "Action"],
    server: {
      method: "GET",
      credentials: "include",
      url: `${baseUrl}/api/warehouse/getTotalStock`,
      then: (data) =>
        data.stock.map((stock) => [
          stock.barcode,
          stock.title,
          stock.entrepot + " " + stock.location,
          categoryList.indexOf(stock.category) != -1 ? stock.category : "Autre",
          stock.insert_date,
          stock.expiry_date,
          stock.amount,
          _(<span className="material-symbols-outlined btn-arrow pointer" onClick={() => {navigate("/detailStock?stockId="+stock.stockId)}}>arrow_forward</span>)
        ]),
    },
  });

  useEffect(() => {
    grid.render(wrapperRef.current);
  });

  return <div className="gridTotalStock" ref={wrapperRef} />;
};

export default GridTotalStock;
