import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
const baseUrl = require("../../config.json").baseUrl;

const DonationsInfos = (props) => {
  const [cookieInfos, setCookieInfos] = useState(false);
  const [donationList, setDonationList] = useState(false);
  const navigate = useNavigate();

  useEffect(()=>{
    verifConnexion()
  }, [])
  useEffect(()=>{
    if(cookieInfos){
      getDonations()
    }
  }, [cookieInfos])

  function verifConnexion() {
    try {
      if (!Cookies.get("atdCookie")) {
        navigate("/login", { replace: true });
      } else {
        const decoded = jwtDecode(Cookies.get("atdCookie"));
        setCookieInfos(decoded);
      }
    } catch (error) {
      navigate("/login", { replace: true });
    }
  }

  async function getDonations() {
    let res = await fetch(baseUrl+"/api/invoices/getMyInvoices", {
      method: "GET",
      headers:{"Content-Type": "application/x-www-form-urlencoded"},
      credentials: "include"
    })
    let data = await res.json()
    console.log(baseUrl+"/api/invoices/getMyInvoices")
    console.log(data)
    if(data.error) document.getElementById("errorMsg").textContent = data.error
    else{
      document.getElementById("errorMsg").textContent = ""
      setDonationList(data.invoices)
    } 
  }

  if(cookieInfos && donationList){
    return (
      <div>
        <div className="profileLogDonations">
          {
            donationList.map((donation)=>
              <div className="logDonation">
                <p>{donation.date}</p>
                <p>{donation.amount}</p>
                <p>{donation.type == 0 ? "Don ponctuel" : "Don mensuel"}</p>
              </div>
            )
          }
        </div>
        <p id="errorMsg"></p>
      </div>
    );
  };
}

export default DonationsInfos;
