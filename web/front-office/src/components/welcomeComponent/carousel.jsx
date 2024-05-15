import React from "react";
import Slider from "react-slick";
import "../../css/carousel.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

function SimpleSlider() {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };
  return (
    <div className="slider-container">
      <Slider {...settings}>
        <div>
          <div className="carouselItem volunteerPartCarousel">
            <div className="carouselMarginLeft">
              <h1>S'engager</h1>
              <p className="carouselDesc">
              Chez Au Tamps Donné, les bénévoles incarnent un maillon crucial dans la lutte contre la précarité. Sans  nos Bénévoles notre action ne serait pas possible, sans eux, elle ne perdurait pas.
              </p>
              <div className="carouselBtns">
                <div className="btnVolunteer btnCarousel">
                  <span className="material-symbols-outlined">new_releases</span>
                  <p>Devenir vonlontaire</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div>
        <div className="carouselItem partnerPartCarousel">
            <div className="carouselMarginLeft">
              <h1>Devenir partenaire</h1>
              <p className="carouselDesc">
                Ce sont nos partenaires qui permettent à l'association de subsiter et d'aider la totalité des personnes dans le besoin. Allant d'une petite boutique locale aux plus grands supermarché.
              </p>
              <div className="carouselBtns">
                <div className="btnPartenaires btnCarousel">
                  <span className="material-symbols-outlined">storefront</span>
                  <p>Devenir partenaire</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div>
        <div className="carouselItem beneficiaryPartCarousel">
            <div className="carouselMarginLeft">
              <h1>Devenir bénéficiaire</h1>
              <p className="carouselDesc">
                Inscrivez vous pour bénéficier de distributions alimentaires, maraudes, visites ou même de soutiens scolaire. Consultez les autres pages de notre site pour avoir des informations supplémentaires.
              </p>
              <div className="carouselBtns">
                <div className="btnBeneficiary btnCarousel">
                  <span className="material-symbols-outlined">handshake</span>
                  <p>Devenir bénéficiare</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Slider>
    </div>
  );
}

export default SimpleSlider;
