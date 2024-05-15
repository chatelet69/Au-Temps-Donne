import { useEffect, useRef, useState } from "react";
import { Grid, h } from "gridjs";
import "../../css/components.css"
import "gridjs/dist/theme/mermaid.css";
import customFr from "../../assets/customFrGrid.ts";
import CreateUserPopup from "./CreateUserPopup.jsx";
import AccessUserPopup from "./AccessUserPopup.jsx";
import { useCookies } from "react-cookie";
import { jwtDecode } from "jwt-decode";
import ForbiddenPopup from "../functionsComponents/ForbiddenPopup.jsx";
import PopUpLanguage from "./PopUpLanguage.jsx";
import UpdateTradPopUp from "./UpdateTradPopUp.jsx";
const baseUrl = require("../../config.json").baseUrl;

const UserManageModule = (props) => {
    const [cookies] = useCookies(["atdCookie"]);
    const userCookie = jwtDecode(cookies.atdCookie);
    let wrapperRef = useRef(null);
    const [filterView, setFilterView] = useState("all");
    const [createUserPopupVisibility, setVisibilityPopup] = useState(false);
    const [accessUserPopup, setAccessUserPopup] = useState(false);
    const [userEditedStatus, setUserEditedStatus] = useState(false);
    const [currentGrid, setcurrentGrid] = useState(null);
    const [accessUser, setAccessUser] = useState(null);
    const [forbiddenPopup, setForbiddenPopup] = useState(false);
    const [addLanguagePopup, setLanguagePopup] = useState(false);
    const [addUpdateTradPopup, setUpdateTradPopup] = useState(false);

    const ranksName = {
        0: "Banni",
        1: "Utilisateur",
        2: "Bénéficiaire",
        3: "Bénévole",
        4: "Responsable",
        8: "Staff",
        9: "Administration"
    }

    function createGrid() {
        const grid = new Grid({
            columns: [{name: "Id", width: "8%"}, "Pseudo", "Prénom", "Nom", "Email","Rôle",
                {
                    name: 'Accéder',
                    formatter: (cell, row) => {
                        return h('button', {
                            className: "access-button access-user-button",
                            onClick: () => showAccessUserPopup(row)
                        }, "Accéder");
                    },
                },
            ],
            search: true,
            server: {
                method: "GET",
                url: `${baseUrl}/users`,
                credentials: "include",
                then: data => data.users.map(user => [
                    user.id, user.username, user.name, user.lastname,
                    user.email, ranksName[user.rank] + " ("+user.rank+")"
                ])
            },
            sort: true,
            pagination: { limit: (props.dimensions.windowHeight > 820) ? 8 : 5 },
            language: customFr
        });
        if (currentGrid && wrapperRef.current && wrapperRef.current.innerHTML.length > 0) {
            grid.forceRender();
        } else {
            grid.render(wrapperRef.current);
        }
        setcurrentGrid(grid);
        setUserEditedStatus(false);
    }

    function updateGridConfig() {
        setUserEditedStatus(false);
        if (currentGrid && wrapperRef && wrapperRef.current) {
            currentGrid.config.plugin.remove("pagination");
            currentGrid.config.plugin.remove("search");
            wrapperRef.current.innerHTML = "";
            currentGrid.updateConfig({
                server: {
                    method: "GET",
                    url: `${baseUrl}/users?filter=${filterView}`,
                    credentials: "include",
                    then: data => data.users.map(user => [
                        user.id, user.username, user.name, user.lastname,
                        user.email, ranksName[user.rank] + " ("+user.rank+")"
                    ])
                }
            });
            currentGrid.render(wrapperRef.current);
            currentGrid.forceRender();
        }
    }

    useEffect(() => {
        if (!currentGrid) createGrid();
        else updateGridConfig();
    }, [filterView, userEditedStatus]);

    function showCreateUserPopup() { setVisibilityPopup(true); }
    function changeFilterView(newFilter) { setFilterView(newFilter); }

    function showAccessUserPopup(user) {
        const rankValue = user._cells[5].data.split("(")[1].replace(')', '');
        const userIdAccess = user._cells[0].data;
        if (Number.parseInt(rankValue) >= userCookie.rank && userCookie.userId !== userIdAccess) {
            setForbiddenPopup(true);
        } else {
            setAccessUserPopup(true);
            setAccessUser(user);
        }
    }

    return (
        <div className="module-container user-manage-module-container">
            <div className="module-head user-manage-module-head">
                <h2>Gestion Administrative</h2>
                <select className="button-module" id="usersTypeViewSelect" onChange={() => changeFilterView(document.getElementById("usersTypeViewSelect").value)}>
                    <option value="all">Tout types d'utilisateurs</option>
                    <option value="volunteers">Bénévoles</option>
                    <option value="beneficiary">Bénéficiaires</option>
                    <option value="users">Utilisateurs normaux</option>
                </select>
                <button onClick={showCreateUserPopup} className="button-module create-new-action-button">Créer un nouvel utilisateur</button>
                {/*<button className="button-module create-new-action-button">Créer un nouveau bénévole</button>*/}
                <button onClick={() => setLanguagePopup(true)} className="button-module create-new-action-button">Ajouter une langue</button>
                <button onClick={()=> setUpdateTradPopup(true)} className="button-module create-new-action-button">Mettre à jour les traductions</button>
            </div>
            <div ref={wrapperRef} />
            {createUserPopupVisibility && <CreateUserPopup setVisibilityPopup={setVisibilityPopup} />}
            {accessUserPopup && <AccessUserPopup user={accessUser} setUserEditedStatus={setUserEditedStatus} setVisibilityPopup={setAccessUserPopup} />}
            {forbiddenPopup && <ForbiddenPopup setForbiddenPopup={setForbiddenPopup} />}
            {addLanguagePopup && <PopUpLanguage setLanguagePopup={setLanguagePopup} />}
            {addUpdateTradPopup && <UpdateTradPopUp setUpdateTradPopup={setUpdateTradPopup} />}
        </div>
    );
};

export default UserManageModule;