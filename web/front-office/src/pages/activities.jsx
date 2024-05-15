import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import "../css/activities.css"
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import SideHeaderFront from "../components/SideHeaderFront";
import { jwtDecode } from "jwt-decode";
import PopUpRequestInfo from "../components/activitiesComponents/PopUpRequestInfo";
import PopUpCreateEvent from "../components/activitiesComponents/PopUpCreateRequestEvent";
import PopUpFuturActivity from "../components/activitiesComponents/PopUpFuturActivity";
const minioBaseUrl = require("../config.json").minioBaseUrl;
const baseUrl = require("../config.json").baseUrl;

const Activities = () => {
  const [userInfos, setUserInfos] = useState([]);
  const [requestInfos, setRequestInfos] = useState(null);
  const [UserActivityInfos, setUserActivityInfos] = useState(null);
  const [popUpUserActivity, setPopUpUserActivity] = useState(false);
  const [popUpRequestInfoState, changePopUpRequestInfoState] = useState(false);
  const [popUpCreateRequestState, changepopUpCreateRequestState] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    verifConnexion();
  }, []);

  useEffect(()=>{
    if(Object.keys(userInfos).length>0){
      getRequestActivity()
      getUserActivity()
    } 
  }, [userInfos])

  async function getRequestActivity() {
    try {
      let res = await fetch(baseUrl+"/requestEvent/getRequestByUserId/"+userInfos.userId+"?waiting=y", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      });
      let data = await res.json()
      if(!data.error) setRequestInfos(data.request);
      else document.getElementById("errorGetRequest").textContent = data.error
    } catch (error) {
      console.log(error)
      document.getElementById("errorGetRequest").textContent = "Erreur lors de la récupération des demandes"
    }
  }

  async function getUserActivity() {
    try {
      let res = await fetch(baseUrl+"/events/getEventsByUser/"+userInfos.userId, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      });
      let data = await res.json()
      console.log(data.events)
      if(!data.error) setUserActivityInfos(data.events);
      else document.getElementById("errorGetFuturActivity").textContent = data.error
    } catch (error) {
      console.log(error)
      document.getElementById("errorGetFuturActivity").textContent = "Erreur lors de la récupération des demandes"
    }
  }

  function verifConnexion() {
    try {
      if (!Cookies.get("atdCookie")) {
        navigate("/login", { replace: true });
      } else {
        const decoded = jwtDecode(Cookies.get("atdCookie"));
        if(decoded.rank<2){
            navigate("/login", { replace: true });
        } 
        setUserInfos(decoded);
      }
    } catch (error) {
      navigate("/login", { replace: true });
    }
  }
  
if(requestInfos && UserActivityInfos){
  return (
    <div id="div-container-children" className="SectionMain">
        <main className="mainContainer">
            <div className="loggedSideHeader">
                <SideHeaderFront pfp={userInfos.pfp} />
            </div>
            <div className="mainContainerBox">
              <div className="rowActivities">
                <div className="activitiesContainer">
                  <h2>Mes demandes</h2>
                  <div className="listActivities">
                    {
                      requestInfos.map((request)=>
                        <div className="requestContainer" onClick={() => changePopUpRequestInfoState(request)}>
                          <p>Type d'event : {request.type_event}</p>
                          <p>Date : {request.start_datetime.split(" ")[0]}</p>
                          <p>Emplacement : {request.place}</p>
                        </div>
                      )
                    }
                    {
                      requestInfos.length==0 && <p className="noRequest">Vous n'avez encore fait aucune demande</p>
                    }
                  </div>
                  <p id="errorGetRequest"></p>
                </div>
                <button className="buttonRequestActivity" onClick={()=> changepopUpCreateRequestState(true)}>Demander une activité</button>
                <div className="activitiesContainer">
                  <h2>Mes prochaines activités</h2>
                  <div className="listActivities">
                  {
                      UserActivityInfos.map((activity)=>
                        <div className="requestContainer" onClick={() => setPopUpUserActivity(activity)}>
                          <p>Type d'event : {activity.event_type}</p>
                          <p>Date : {activity.start_datetime.split(" ")[0]}</p>
                          <p>Emplacement : {activity.place}</p>
                        </div>
                      )
                    }
                    {
                      requestInfos.length==0 && <p className="noRequest">Vous n'avez encore fait aucune demande</p>
                    }
                  </div>
                  <p id="errorGetFuturActivity"></p>
                </div>
              </div>
            </div>
            {popUpRequestInfoState && <PopUpRequestInfo changePopUpRequestInfoState={changePopUpRequestInfoState} popUpRequestInfoState={popUpRequestInfoState} getRequestActivity={getRequestActivity} />}
            {popUpCreateRequestState && <PopUpCreateEvent changepopUpCreateRequestState={changepopUpCreateRequestState} userInfos={userInfos} getRequestActivity={getRequestActivity} />}
            {popUpUserActivity && <PopUpFuturActivity setPopUpUserActivity={setPopUpUserActivity} popUpUserActivity={popUpUserActivity} getUserActivity={getUserActivity} />}
        </main>
      <Footer />
    </div>
  );
};
}

export default Activities;
