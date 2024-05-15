const { Component } = require("react");
const baseUrl       = require("../config.json").baseUrl;
const frontUrl      = require("../config.json").frontOfficeUrl;

class AuthUser extends Component {
    static id = 0;
    static username = undefined;
    static cookie = null;
    static pfp = null;
    static rank = 0;
    static isLogged = false;
    
    static defineProps(cookie) {
        try {
            this.id = cookie.userId;
            this.username = cookie.username;
            this.cookie = cookie;
            this.pfp = cookie.pfp;
            this.rank = cookie.rank;
            this.isLogged = true;
        } catch (error) {
            return;
        }
    }

    static async checkUserJwt() {
        try {
            const res = await fetch(`${baseUrl}/api/me`, { credentials: "include" });
            const data = await res.json();
            if (data && data.username !== undefined) {
                if (data.rank >= 4) {
                    this.rank = Number.parseInt(data.rank);
                    return true;
                } else {
                    document.location.href = frontUrl;
                }
            }
            return false;
        } catch (error) {
            return false;
        }
    }
}

export default AuthUser;