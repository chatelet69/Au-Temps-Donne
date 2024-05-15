import '../App.css';
import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../css/headerFooter.css";
import "../css/index.css";
import "../css/carousel.css";
import Carousel from "../components/welcomeComponent/carousel"
import Activities from "../components/welcomeComponent/acitivitysectors"

function Welcome() {
  return (
    <div id="div-container-children" className="SectionMain">
      {/*<Header></Header>*/}
      <main>
          <Carousel />
          <Activities />
          {/* Mettre les articles */}
          <Footer />
      </main>
    </div>
  );
}

export default Welcome;
