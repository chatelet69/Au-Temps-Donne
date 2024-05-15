import React, {useEffect, useRef, useState} from "react";
import {Grid, h} from "gridjs";
import "gridjs/dist/theme/mermaid.css";
import CreateFormationPopup from "./CreateFormationPopup";
import customFr from "../assets/customFrGrid.ts";
import "../css/components.css"
import AccessFormationPopup from "./AccessFormationPopup";
import FormationDetails from "./FormationDetails";
import AuthUser from "./AuthUser";

const baseUrl = require("../config.json").baseUrl;

const FormationsModule = (props) => {
    const [filterViewFormation, setFilterViewFormation] = useState("all");
    const wrapperRef = useRef(null);
    const [visibilityPopup, setVisibilityPopup] = useState(false);
    const [accessFormationPopup, setAccessFormationPopup] = useState(false);
    const [accessFormation, setAccessFormation] = useState(null);

    const userIdConnect = AuthUser.id

    

    /*useEffect(() => {
        getAllValidFormation();
    }, []);*/

    function changeFilterViewFormation(newFilter) { setFilterViewFormation(newFilter); }

    let grid;
    let url;
    if (filterViewFormation === "scheduled") {
        url = `${baseUrl}/api/formations/getFuturFormations`;
    } else if (filterViewFormation === "all"){
        url = `${baseUrl}/api/formations`;
    }

    useEffect(() => {
        if (!url) return;

        if (grid) {
            grid.destroy();
        }

        const newGrid = new Grid({
            search: true,
            columns: ['ID','Titre','Lieu','Date de Début','Date de Fin','Places', 'Responsable', 'Type', 'Status',
                {
                    name: 'Accéder',
                    formatter: (cell, row) => { 
                            return h('button', {
                                className: "access-user-button",
                            onClick: () => props.changeModule(<FormationDetails formation={row.cells[0].data}/>),
                            }, "Accéder");
                    },
                }
            ],
            server: {
                method: 'GET',
                url: url,
                then: data => data.results.map(result =>
                    [result.id, result.title, result.place, result.datetime_start, result.datetime_end, result.nb_places, result.responsable, result.activities, result.status]
                )
            },
            sort: true,
            pagination: {
                limit: 6,
                summary: false
            },
            language: customFr,
        });

        newGrid.render(wrapperRef.current);

        grid = newGrid;   
    }, []);


    function showPopup() {
        setVisibilityPopup(true);
    }

    function showAccessFormationPopup(formation) {
        setAccessFormationPopup(true);
        setAccessFormation(formation);
    }



    return (
        <div>
            <div className="module-head events-module-head">
                <h2>Liste des Formations</h2>
            <button onClick={showPopup} id="createFormationButtonAction" className="add-formation-button-container">Créer une nouvelle formation</button>
                {visibilityPopup && <CreateFormationPopup setVisibilityPopup={setVisibilityPopup}/>}
                {accessFormationPopup && <AccessFormationPopup formation={accessFormation}
                                                               setAccessFormationPopup={setAccessFormationPopup}/>}
            </div>
            <div ref={wrapperRef}/>
        </div>
    );
};

export default FormationsModule;