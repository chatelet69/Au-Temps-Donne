const ForbiddenPopup = (props) => {
    function closePopup() { props.setForbiddenPopup(false); }

    return (
        <div id="ForbiddenPopup" className="module-popup">
            <h4>Impossible d'accéder à cet utilisateur<br/>Droits insuffisants</h4>
            <button onClick={closePopup}>Fermer</button>
        </div>
    );
};

export default ForbiddenPopup;