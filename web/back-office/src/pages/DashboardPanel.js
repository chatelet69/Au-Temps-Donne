import React, { useState } from 'react';
import TopHeader from "../components/TopHeader";
import SideHeader from "../components/SideHeader";
import MainModule from "../components/mainModule/MainModule";
import { jwtDecode } from 'jwt-decode';
import AuthUser from '../components/AuthUser';

const DashboardPanel = (props) => {
	const atdCookie = props.cookie;
	const decodedToken = jwtDecode(atdCookie);
	if (!localStorage.getItem("themeMode")) localStorage.setItem("themeMode", "lightMode");
	document.body.classList.add(localStorage.getItem("themeMode"));
	let oldModule = localStorage.getItem("currentModule");
	if (!oldModule) localStorage.setItem("currentModule", "MainModule");
	const [windowWidth, windowHeight] = [window.innerWidth, window.innerHeight]
	const [actualModule, setModule] = useState(<MainModule dimensions={{ windowWidth, windowHeight }} userId={decodedToken.userId} />);	// Destructuring

	function changeModule(newModule) {
		localStorage.setItem("currentModule", newModule.type.name);
		setModule(newModule);
	}

	AuthUser.defineProps(decodedToken);

	return (
		<div className="Dashboard-page">
			<link rel="preconnect" href="https://fonts.googleapis.com" />
			<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
			<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap" rel="stylesheet" />
			<TopHeader token={decodedToken} atdCookie={atdCookie} changeModule={changeModule} dimensions={{ windowWidth, windowHeight }} />

			<section className='dashboard-main-section'>
				<SideHeader dimensions={{ windowWidth, windowHeight }} changeModule={changeModule} token={decodedToken} />
				<main id='main-container'>
					{actualModule}
				</main>
			</section>
		</div>
	);
}

export default DashboardPanel;
