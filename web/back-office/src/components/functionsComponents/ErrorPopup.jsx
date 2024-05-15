const ErrorActionPopup = (props) => {
    function closeErrorPopup() {
        props.closePopup();
        if (props.setCloseStatus) props.setCloseStatus();
    }

    return (
        <div id="ErrorActionPopup" className="module-popup action-result-popup text-center">
            <h4 className="action-popup-result-text error-text">Erreur durant l'exécution de l'action</h4>
            <h5>{props.message}</h5>
            <button onClick={() => closeErrorPopup()}>Fermer</button>
        </div>
    );
};

export default ErrorActionPopup;