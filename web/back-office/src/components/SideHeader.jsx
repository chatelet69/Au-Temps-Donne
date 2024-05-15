import React from "react";
import "../css/headers.css"
import EventsModule from "./eventsModule/EventsModule";
import FormationsModule from "./FormationsModule";
import MainModule from "./mainModule/MainModule";
import ApplicationModule from "./applicationModule/ViewBeneficiariesApplications";
import UserManageModule from "./usersManageModule/UserManageModule";
import changeActiveModule from "./functionsComponents/ChangeActiveModule";
import MyAccount from "./myAccountModule/MyAccountModule";
import ViewTicketModule from "./supportModule/ViewTickets";
import Webchat from "./webChatModule/webChatModule";
import AuthUser from "./AuthUser";

const userManagementRequiredRank = 4;
 
const SideHeader = (props) => {
	const themeName = localStorage.getItem("themeMode");
	const actualThemeIcon = (themeName === "darkMode") ? "dark_mode" : "light_mode";

	// Sert à récupérer le module à afficher en fonction de l'historique de l'utilisateur
	const modules = {
		"MainModule": <MainModule dimensions={props.dimensions} userId={props.token.userId}/>,
		"EventsModule": <EventsModule changeModule={props.changeModule} />,
		"FormationsModule": <FormationsModule changeModule={props.changeModule}/>,
		"MyAccount": <MyAccount token={props.token} />,
		"ApplicationModule": <ApplicationModule changeModule={props.changeModule} />,
		"UserManageModule": <UserManageModule dimensions={props.dimensions} />,
		"Webchat": <Webchat changeModule={props.changeModule} />
	};

	window.onload = () => {
		let oldModule = localStorage.getItem("currentModule");
		if (oldModule && modules[oldModule]) changeModule(modules[oldModule]);//props.changeModule(modules[oldModule]);
	};

	function changeTheme() {
		const currentTheme = localStorage.getItem("themeMode");
		document.body.classList.remove(currentTheme);
		const newTheme = (currentTheme === "darkMode") ? "lightMode" : "darkMode";
		localStorage.setItem("themeMode", newTheme);
		document.getElementById("changeThemeButton").innerText = (newTheme === "darkMode") ? "light_mode" : "dark_mode";
		document.body.classList.add(newTheme);
	}

	function changeModule(newModule) {
		changeActiveModule(newModule, props.changeModule);
	}

	return (
		<div className="side-header">
			<div id="sideHeaderHead">
				<img id="sideHeaderUserPfp" alt="pfp" src={AuthUser.pfp} className="side-header-pfp" />
				<h6>{props.token.username}</h6>
			</div>
			<nav id="sideHeaderMenuNav">
				<div className="side-header-nav-box" id="MainModuleNav" onClick={() => changeModule(<MainModule userId={props.token.userId} dimensions={props.dimensions}/>)}>
					<span className="material-symbols-outlined">dashboard</span>
					<p>Dashboard</p>
				</div>
				<div className="side-header-nav-box" id="EventsModuleNav" onClick={() => changeModule(<EventsModule changeModule={props.changeModule} />)}>
					<span className="material-symbols-outlined">pending_actions</span>
					<p>Évènements</p>
				</div>
				<div className="side-header-nav-box" id="FormationsModuleNav" onClick={() => changeModule(<FormationsModule changeModule={props.changeModule}/>)}>
					<span className="material-symbols-outlined">school</span>
					<p>Formations</p>
				</div>
				<div className="side-header-nav-box" id="BeneficiariesApplicationsModuleNav" onClick={() => changeModule(<ApplicationModule changeModule={props.changeModule} token={props.token} />)}>
					<span className="material-symbols-outlined">library_books</span>
					<p>Candidatures</p>
				</div>
				<div className="side-header-nav-box" id="WebchatModuleNav" onClick={() => changeModule(<Webchat changeModule={props.changeModule} />) }>
					<span className="material-symbols-outlined">message</span>
					<p>Webchat</p>
				</div>
				<div className="side-header-nav-box" onClick={() => document.location.href = "https://warehouse.autempsdonne.lol/"}>
					<span className="material-symbols-outlined">garage_door</span>
					<p>Stocks</p>
				</div>
				<div className="side-header-nav-box" onClick={() => changeModule(<ViewTicketModule changeModule={props.changeModule}/>)}>
					<span className="material-symbols-outlined">unknown_document</span>
					<p>Support</p>
				</div>
				{props.token.rank >= userManagementRequiredRank &&
					<div className="side-header-nav-box" id="UserManageModuleNav" onClick={() => changeModule(<UserManageModule dimensions={props.dimensions} />)}>
						<span className="material-symbols-outlined">manage_accounts</span>
						<p>Gestion Administrative</p>
					</div>
				}
			</nav>
			<span onClick={() => changeTheme()} id="changeThemeButton" className="change-theme-button material-symbols-outlined">{actualThemeIcon}</span>
		</div>
	);
};
 
export default SideHeader;