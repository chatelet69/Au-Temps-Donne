import React from "react";
import Cookies from 'js-cookie';
import { jwtDecode } from "jwt-decode";
import { useNavigate } from 'react-router-dom';

const LoggedPartnerPage = () => {
  window.onload = () => {
    verifConnexion();
  };
  const navigate = useNavigate();
  function verifConnexion() {
    try {
      if(!Cookies.get('atdCookie')){
        navigate('/error', { replace: true });
      }
    } catch (error) {
      navigate('/error', { replace: true });
    }
  }
  
  return (
    <div id="div-container-children" className="SectionMain">
      <main>
          <h1>Logged Partner !</h1>
      </main>
    </div>
  );
}

export default LoggedPartnerPage;
