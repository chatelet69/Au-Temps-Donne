import AuthUser from "../AuthUser";

function changeActiveModule(newModuleComponent, changeModule) {
    changeModule(newModuleComponent);
    const activeElements = document.querySelectorAll(".active-module-tab, .active-module-myaccount");
    if (activeElements) activeElements.forEach((element) => {
        element.classList.remove("active-module-tab");
        element.classList.remove("active-module-myaccount");
    });

    AuthUser.checkUserJwt(AuthUser.cookie);

    const navElement = document.getElementById(newModuleComponent.type.name+"Nav");
    if (navElement) {
        if (navElement.id !== "MyAccountNav") navElement.classList.add("active-module-tab");
        else navElement.classList.add("active-module-myaccount");
    }
};

export default changeActiveModule;