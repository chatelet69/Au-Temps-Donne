import React, {useEffect, useState, useRef} from "react";
import { Grid, h } from "gridjs";
import ModifyStatusRegisterPopup from "./ModifyStatusRegisterPopup";
import customFr from "../assets/customFrGrid.ts";
const baseUrl = require("../config.json").baseUrl;

const ShowRegisterFormationPopup = (props) => {
    const wrapperRef = useRef(null);
    const [modifyStatusFormationPopup, setModifyStatusFormationPopup] = useState(false);
    const [modifyStatus, setModifyStatus] = useState(null);

    function closePopup() {
        props.setRegisterFormationPopup(false);
    }

    const formationId = props.formationId


useEffect(() => {
    if (wrapperRef.current) {
        const grid = new Grid({
            search: true,
            columns: ['ID','Nom', 'Prenom', 'Status', 'Date',{
                name: 'Modifier le statut',
                formatter: (cell, row) => {
                    return h('button', {
                        className: "access-user-button",
                    onClick: () => showModifyStatusPopup(row.cells[0].data)
                    }, "Modifier");
                },
            }],
            server: {
                method: 'GET',
                url: `${baseUrl}/api/formations/getInscrits/${formationId}`,
                then: data => data.results.map(result =>
                    [result.user_id_fk, result.lastname, result.name, result.status, result.date]
                )
            },
            sort: true,
            pagination: {
                limit: 5,
                summary: false
            },
            language: customFr,
        });

        grid.render(wrapperRef.current);
    }
}, []);

function showModifyStatusPopup(user) {
    setModifyStatusFormationPopup(true);
    setModifyStatus(user);
}

console.log()

return (
    <div id="createNewCollectPopup" className="collects-module module-popup-access-datail-stock">
        <h3>Liste des Inscrits</h3>
        <section className="user-informations-section">
            <div ref={wrapperRef}/>
        </section>  
        <div id="accessFormationPopupButtons" className="popup-buttons-box">
            <button onClick={closePopup} className="cancel-button">Fermer</button>
        </div>      
        {modifyStatusFormationPopup && <ModifyStatusRegisterPopup setModifyStatusFormationPopup={setModifyStatusFormationPopup} user={modifyStatus} formationType={props.formationType} formationId={formationId}/>}    
    </div>
);

}

export default ShowRegisterFormationPopup;