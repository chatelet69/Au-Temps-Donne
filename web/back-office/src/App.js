import { useCookies } from 'react-cookie';
import "./css/variables.css";
import "./css/common.css";
import Login from "./pages/Login";
import Logout from "./pages/Logout";
import DashboardPanel from './pages/DashboardPanel';
import NotFoundPage from "./errorPages/NotFoundPage";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AuthUser from './components/AuthUser';

function App() {
	const [cookies] = useCookies(["atdCookie"]);
	let logged = (cookies["atdCookie"] && cookies.atdCookie) ? true : false;
	if (AuthUser.isLogged && AuthUser.rank < 4) logged = false;
	if (logged) {
		document.body.classList.remove("login-body");
		document.body.classList.add("back-office-body");
	} else document.body.classList.add("login-body");
	
	return (
		<Router>
			<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" />
			<Routes>
				<Route path="/" element={logged ? <DashboardPanel cookie={cookies.atdCookie}/> : <Login />} />
				<Route path="/login" element={<Login/>} />
				<Route path="/logout" element={<Logout/>} />
				<Route path="*" element={<NotFoundPage/>} />
			</Routes>
		</Router>
	);
}

export default App;
