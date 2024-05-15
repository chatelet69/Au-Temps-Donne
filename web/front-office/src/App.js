import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Welcome from "./pages/welcome";
import Events from "./pages/events";
import FrontHeader from "./components/Header";
import Error404 from "./pages/errors/error404";
import LoginPage from "./pages/login";
import LoggedPartnerPage from "./pages/homePartners";
import ProfilUsers from "./pages/profilUsers";
import BeneficiarySignIn from "./pages/beneficiarySignIn";
import VolunteerSignIn from "./pages/volunteerSignIn";
import DispoSignInVolunteer from "./components/volunteerSignInSteps/dispoSignInVolunteer";
import AdditionalInfosVolunteer from "./components/volunteerSignInSteps/additionalInfoVolunteer";
import Activities from "./pages/activities";
import Donate from "./pages/donate";

function App() {
  return (
      <Router>
        <FrontHeader />
        <Routes>
          <Route exact path="/" element={<Welcome />} />
          <Route path="/events" element={<Events />} />
          <Route path="/donate" element={<Donate />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/activities" element={<Activities />} />
          <Route path="/profilUsers" element={<ProfilUsers />} />
          <Route path="/homePartners" element={<LoggedPartnerPage />} />
          <Route path="/beneficiarySignIn" element={<BeneficiarySignIn />} />
          <Route path="/volunteerSignIn" element={<VolunteerSignIn />} />
          <Route path="/volunteerDispoSignIn" element={<DispoSignInVolunteer />} />
          <Route path="/volunteerAdditionalInfosSignIn" element={<AdditionalInfosVolunteer />} />
          <Route path="*" element={<Error404 />}/>
        </Routes>
      </Router>
  );
}

export default App;
