import { Link } from 'react-router-dom';
import logo from '../assets/logoForLight.png';
import MyAccount from "./myAccountModule/MyAccountModule";
import EventsModule from "./eventsModule/EventsModule";
import FormationsModule from "./FormationsModule";
import MainModule from "./mainModule/MainModule";
import ApplicationModule from "./applicationModule/ViewBeneficiariesApplications";
import UserManageModule from "./usersManageModule/UserManageModule";
import changeActiveModule from "./functionsComponents/ChangeActiveModule";
import ViewTicketModule from "./supportModule/ViewTickets";
import "../css/headers.css"
import { useEffect, useState } from 'react';
import AuthUser from './AuthUser';
const userManagementRequiredRank = 4;
const frontUrl = require("../config.json").frontOfficeUrl;

const TopHeader = (props) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const themeName = localStorage.getItem("themeMode");
  const actualThemeIcon = (themeName === "darkMode") ? "dark_mode" : "light_mode";

  const handleOpenMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const checkLogin = async () => {
		const checkLogin = await AuthUser.checkUserJwt(props.atdCookie);
		if (checkLogin && AuthUser.isLogged) return;
	  else document.location = frontUrl;
	};

  /*useEffect(() => {
    checkLogin();
  }, []);*/

  const handleCloseMenu = () => {
    setMenuOpen(false);
  }

  function changeModule(newModule) {
    changeActiveModule(newModule, props.changeModule);
  }

  function changeTheme() {
		const currentTheme = localStorage.getItem("themeMode");
		document.body.classList.remove(currentTheme);
		const newTheme = (currentTheme === "darkMode") ? "lightMode" : "darkMode";
		localStorage.setItem("themeMode", newTheme);
		document.getElementById("changeThemeButton").innerText = (newTheme === "darkMode") ? "light_mode" : "dark_mode";
		document.body.classList.add(newTheme);
	}

  return (
    <header className="top-header">
      <div id="headerMenuTitle">
        <img alt="logo" src={logo} className="top-header-logo" />
        <div id="headerMenuTitleText">
          <h1>Au Temps Donné</h1>
          <h6>Back-office</h6>
        </div>
      </div>
      <nav id="headerMenuNav">
        <div className="top-menu-dropdown" onMouseLeave={() => handleCloseMenu()}
          onMouseEnter={() => handleOpenMenu()} onClick={() => handleOpenMenu()}>
          <a id="topMenuButton">Menu</a>
          {
            menuOpen &&
            <ul id="topMenuButtons" className="top-menu-buttons">
              <li className="top-menu-header-nav-box" id="MainModuleNav" onClick={() => changeModule(<MainModule userId={props.token.userId} dimensions={props.dimensions} />)}>
                <span className="material-symbols-outlined">dashboard</span>
                <p>Dashboard</p>
              </li>
              <li className="top-menu-header-nav-box" id="EventsModuleNav" onClick={() => changeModule(<EventsModule changeModule={props.changeModule} />)}>
                <span className="material-symbols-outlined">pending_actions</span>
                <p>Évènements</p>
              </li>
              <li className="top-menu-header-nav-box" id="FormationsModuleNav" onClick={() => changeModule(<FormationsModule changeModule={props.changeModule} />)}>
                <span className="material-symbols-outlined">school</span>
                <p>Formations</p>
              </li>
              <li className="top-menu-header-nav-box" id="BeneficiariesApplicationsModuleNav" onClick={() => changeModule(<ApplicationModule changeModule={props.changeModule} token={props.token} />)}>
                <span className="material-symbols-outlined">library_books</span>
                <p>Candidatures</p>
              </li>
              <li className="top-menu-header-nav-box" id="WebchatModuleNav">
                <span className="material-symbols-outlined">message</span>
                <p>Webchat</p>
              </li>
              <li className="top-menu-header-nav-box" onClick={() => document.location.href = "https://warehouse.autempsdonne.lol/"}>
                <span className="material-symbols-outlined">garage_door</span>
                <p>Stocks</p>
              </li>
              <li className="top-menu-header-nav-box" onClick={() => changeModule(<ViewTicketModule changeModule={props.changeModule} />)}>
                <span className="material-symbols-outlined">unknown_document</span>
                <p>Support</p>
              </li>
              {props.token.rank >= userManagementRequiredRank &&
                <li className="top-menu-header-nav-box" id="UserManageModuleNav" onClick={() => changeModule(<UserManageModule dimensions={props.dimensions} />)}>
                  <span className="material-symbols-outlined">manage_accounts</span>
                  <p>Gestion Utilisateurs</p>
                </li>
              }
              <span onClick={() => changeTheme()} id="changeThemeButton" className="change-theme-button material-symbols-outlined">{actualThemeIcon}</span>
            </ul>
          }
        </div>
        <Link id="MyAccountNav" className="my-account-button" onClick={() => changeActiveModule(<MyAccount token={props.token} />, props.changeModule)}>Mon Compte</Link>
        <Link id="logoutButton" to="/logout" >Se déconnecter</Link>
      </nav>
    </header>
  );
};

export default TopHeader;