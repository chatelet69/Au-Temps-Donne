const PartnersRepo          = require("../repository/PartnersRepo");
const baseUrl               = require("../../config.json").baseUrl;
const UtilService           = require("./UtilService");
const utilService           = new UtilService();
const moment                = require('moment');
const mapKey                = process.env.MAPBOX_KEY;

class PartnersService {
    repository;

    constructor() {
        this.repository = new PartnersRepo();
    };

    async getAllPartnersService(){
        try {
            let result = await this.repository.getAllPartnersRepo();
            return result;
        } catch (error) {
            console.log(error);
            return {error: "Erreur"};
        }
    }

    async getPartnerByIdService(idPartner){
        try {
            let result = await this.repository.getPartnerByIdRepo(idPartner);
            return result;
        } catch (error) {
            console.log(error);
            return {error: "Erreur"};
        }
    }

    async deletePartnerService(idPartner){
        try {
            const resultPartner = await this.repository.getPartnerByIdRepo(idPartner)
            if (resultPartner.length === 0) {
                return {error: "Cette récolte n'existe pas"};
            }
            for (const key in idPartner) if (idPartner[key] === undefined) return {error: "Valeur manquante ou non identifiée"};
            this.repository.deletePartnerRepo(idPartner);
        } catch (error) {
            console.log(error);
            return {error: "Erreur"};
        }
    }

    async editPartnerService(data, idPartner) {
        console.log("passe dans editPartnerService")
        try {
            console.log("idPartner : ", idPartner)
            const baseMapUrl = "https://api.mapbox.com/geocoding/v5/mapbox.places";
            const finalUrl = `${baseMapUrl}/France,${data.city},${data.zip_code},${data.address.replaceAll(" ", "%20")},.json?limit=1&access_token=${mapKey}`;
            const res = await fetch(finalUrl);
            const mapData = await res.json();
            
            if (mapData && mapData.features && mapData.features.length > 0) {
                const lng = mapData.features[0].center[0];
                const lat = mapData.features[0].center[1];
                data.lng = lng;
                data.lat = lat;
            }
            console.log("data2 : ", data)
            const result = await this.repository.editPartnerRepo(data, idPartner)
            return result;
        } catch (error) {
            console.log(error);
            return false;
        }
    }
}

module.exports = PartnersService;