import React from "react";
import "../css/headerFooter.css";
import { useNavigate } from 'react-router-dom';

const SideHeaderFront = (props) => {
  const navigate = useNavigate();
  function changePage(params) {
    navigate(params, { replace: true });
  }
  
  return (
    <div className="sideHeaderFront">
      <div onClick={() =>{changePage("/profilUsers")}}>
        <img src={props.pfp} alt="Photo de profil" className="sideHeaderPfp" />
        <p >Profil</p>
      </div>
      <div onClick={() =>{changePage("/dashboardUsers")}}>
        <span class="material-symbols-outlined">dashboard</span>
        <p>Dashboard</p>
      </div>
      <div onClick={() =>{changePage("/activities")}}>
        <span class="material-symbols-outlined">pending_actions</span>{" "}
        <p>Activités</p>
      </div>
    </div>
  );
};

export default SideHeaderFront;
