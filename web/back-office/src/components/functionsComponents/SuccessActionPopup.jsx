const SuccessActionPopup = (props) => {
    function closeSuccessPopup() {
        props.setSuccessActionPopup();
        if (props.setCloseStatus) props.setCloseStatus();
    }

    return (
        <div id="SuccessActionPopup" className="module-popup text-center">
            <h4>Action réalisée avec succès</h4>
            <h5>{props.message}</h5>
            <button onClick={() => closeSuccessPopup()}>Fermer</button>
        </div>
    );
};

export default SuccessActionPopup;