import { Component } from "react";
const baseUrl = require("../../config.json").baseUrl;

class UtilFunctions extends Component {
    static async getUserFileDownload(fileName, userId) {
        if (fileName.length > 0 && userId !== 0) {
            let res = await fetch(`${baseUrl}/users/${userId}/file?filename=${fileName}`, {
                method: "GET",
                mode: "cors",
                credentials: "include"
            })
            let resData = await res.json();
            if (resData && !resData.error) {
                let link = document.createElement("a");
                link.href = resData.fileLink;
                link.target = "_blank";
                link.setAttribute("download", fileName.replace("users-files/user-" + userId + "/", ""));
                link.click();
                link.remove();
            } else {
                alert(resData.error);
            }
        }
    }
}

export default UtilFunctions;