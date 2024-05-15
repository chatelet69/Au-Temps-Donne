import loadingGif from "../../assets/loading.gif";

const LoadingPopup = () => {
    return (
        <div id="LoadingPopup" className="module-popup action-result-popup text-center">
            <h4 className="action-popup-result-text error-text">En attente du serveur</h4>
            <img id="PopupLoadingGif" src={loadingGif} alt="Chargement" />
        </div>
    );
};

export default LoadingPopup;