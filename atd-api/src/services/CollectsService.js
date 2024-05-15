const CollectsRepo         = require("../repository/CollectsRepo");
const moment               = require('moment');
const mapKey               = process.env.MAPBOX_KEY;

class CollectsService {
    repository;

    constructor() {
        this.repository = new CollectsRepo();
    };

    async checkAvailabilityDriverService(idDriver, endDate, startDate){
        const result = await this.repository.checkAvailabilityDriverRepo(idDriver, endDate, startDate);
        console.log(result.length)
        return {
            isAvailable: (result.length == 0),
            result: result
        };
    }

    async getAllCollectsService(){
        try {
            let result = await this.repository.getAllCollectsRepo();
            return result;
        } catch (error) {
            console.log(error);
            return {error: "Erreur"};
        }
    }

    async getCollectByIdService(idCollect){
        try {
            let result = await this.repository.getCollectByIdRepo(idCollect);
            return result;
        } catch (error) {
            console.log(error);
            return {error: "Erreur"};
        }
    }

    async addPartnertService(data){
        console.log("passe dans addPartnertService")
        console.log("data : ", data)
        try {
            const coords = [];
            const baseMapUrl = "https://api.mapbox.com/geocoding/v5/mapbox.places";
            const finalUrl = `${baseMapUrl}/France,${data.city},${data.zip_code},${data.address.replaceAll(" ", "%20")},.json?limit=1&access_token=${mapKey}`;
            const res = await fetch(finalUrl);
            const mapData = await res.json();
            
            if (mapData && mapData.features && mapData.features.length > 0) {
                const lng = mapData.features[0].center[0];
                const lat = mapData.features[0].center[1];
                coords.push({ lng, lat });
            }
            console.log(coords)
            const createdCollectTrajectId = await this.repository.addPartnertRepo(data, coords);
            if (createdCollectTrajectId.insertId) return { message: "Trajet ajouté avec succès"};
        } catch (error) {
            console.log(error);
            return {error: "Erreur"};
        }
    }

    async addPartnerToCollectService(idCollect, partners){

        console.log("partners : ", partners)
        try {
            const partneradded = this.repository.addPartnerToCollectRepo(idCollect, partners);
            if (!partneradded.insertId) return { error: "erreur durant l'ajout du partenaire à la récolte"};
            return {message : "passe dans addPartnerToCollectService"}
        } catch (error) {
            console.log(error);
            return {error: "Erreur"};
        }
    }

    async addCollectService(collectData, partners){
        try {
            if (moment(collectData.start_date).isBefore(moment())) {
                return { error: "Création de la récolte impossible aaaa" };
            } else if (moment(collectData.start_date).isAfter(collectData.end_date)) {
                return { error: "Création de la récolte impossible"};
            }
            const result = await this.checkAvailabilityDriverService(collectData.driver, collectData.end_date, collectData.start_date);
            if (result.isAvailable) {
                const createdCollectId = await this.repository.postCollectRepo(collectData);
                if (createdCollectId.insertId){
                    partners.forEach((partner) => {
                        const partnerAdded = this.addPartnerToCollectService(createdCollectId.insertId, partner.selectedPartnerId);
                        if(partnerAdded.error){
                            return { error: "erreur"}
                        }
                    });
                };
                    return { collectId: createdCollectId.insertId};
            }else {
                return { error: "Création de la récolte impossible" };
            }
        } catch (error) {
            console.log(error);
            return {error: "Erreur"};
        }
    }

    

    async editCollectService(Collectdata, partnerData, idCollect) {
        try {
            const resultCollect = (await this.repository.getCollectByIdRepo(idCollect))

            if (resultCollect) {
                if (Collectdata.start_date || Collectdata.end_date) {
                    if (Collectdata.start_date === undefined) Collectdata.start_date = moment(resultCollect.start_date).format("YYYY-MM-DD HH:mm:ss");
                    if (Collectdata.end_date === undefined) Collectdata.end_date = moment(resultCollect.end_date).format("YYYY-MM-DD HH:mm:ss");

                    if (moment(Collectdata.end_date).isBefore(Collectdata.start_date)) return {error: "La date de fin est avant la date de début"};
                    if (moment(Collectdata.end_date).isBefore(moment())) return {error: "La date de fin est dans le passé"};
                    if (moment(Collectdata.start_date).isBefore(moment())) return {error: "La date de début est dans le passé"};

                    if (Collectdata.driver_id_fk === undefined) Collectdata.driver_id_fk = resultCollect.driver_id_fk

                    //const resultAvailability = await this.checkAvailabilityDriverService(Collectdata.driver_id_fk, Collectdata.end_date, Collectdata.start_date)
                    //if (!(resultAvailability.isAvailable)) {
                    //    return {error: "modification impossible"};
                    //}
                }
                const result = await this.repository.editCollectByIdRepo(Collectdata, idCollect)
                
                if (partnerData.valueAdd.length !== 0) {
                    for (let i = 0; i < partnerData.valueAdd.length; i++) {
                        const partnerId = partnerData.valueAdd[i];
                        await this.addPartnerToCollectService(idCollect, partnerId);
                    }
                }


                if (partnerData.valueDelete.length !== 0) {
                    for (let i = 0; i < partnerData.valueDelete.length; i++) {
                        const partnerId = partnerData.valueDelete[i];
                        await this.repository.deletePartnerFromCollectRepo(idCollect, partnerId);
                    }
                }
                return {message : "success"};
            }else {
                return {error: "Cette récolte n'existe pas"};
            }
            
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    async getNextCollectsService() {
        try {
            let result = await this.repository.getNextCollectsRepo();
            return result;
        } catch (error) {
            console.log(error);
            return {error: "Erreur"};
        }
    }

    async deleteCollectService(idCollect){
        console.log("deleteCollectService")
        try {
            const resultCollect = await this.repository.getCollectByIdRepo(idCollect)
            if (resultCollect.length === 0) {
                return {error: "Cette récolte n'existe pas"};
            }
            for (const key in idCollect) if (idCollect[key] === undefined) return {error: "Valeur manquante ou non identifiée"};
            this.repository.deleteCollectRepo(idCollect);
        } catch (error) {
            console.log(error);
            return {error: "Erreur"};
        }
    }


    async getAllPartnerService(){
        try {
            let result = await this.repository.getAllPartnerRepo();
            return result;
        } catch (error) {
            console.log(error);
            return {error: "Erreur"};
        }
    }

    async getAllPartnerByTrajectService(idCollect){
        try {
            let result = await this.repository.getAllPartnerByTrajectRepo(idCollect);
            return result;
        } catch (error) {
            console.log(error);
            return {error: "Erreur"};
        }
    }

    async getShortestRouteService(idCollect){
        try {
            let partners = await this.repository.getAllPartnerByTrajectRepo(idCollect);    

            partners = partners.filter((partner, index, self) => 
                index === self.findIndex((p) => (
                    p.description === partner.description && p.lat === partner.lat && p.lng === partner.lng
                ))
            );

            let nbPartners = partners.length;

            function createPositionsTable(partners) {
                const positions = [];
                partners.forEach(address => {
                    positions.push({ address: address.description ,latitude: address.lat, longitude: address.lng });
                });
                return positions;
            }
        
            const positionsTable = createPositionsTable(partners);


            function getDistanceBetweenPoints(latitude1, longitude1, latitude2, longitude2, unit){
                let theta = longitude1 - longitude2;
                let distance = 60 * 1.1515 * (180 / Math.PI) * Math.acos(
                    Math.sin(latitude1 * (Math.PI / 180)) * Math.sin(latitude2 * (Math.PI / 180)) +
                    Math.cos(latitude1 * (Math.PI / 180)) * Math.cos(latitude2 * (Math.PI / 180)) * Math.cos(theta * (Math.PI / 180))
                );
                return (unit === "kilometers") ? Math.round(distance * 1.609344, 2) : distance;
            } 

            class Node {
                constructor(value, children = []) {
                    this.value = value;
                    this.children = children;
                }
            }
            
            function generatePermutations(array) {
                function permute(arr, m = []) {
                    if (arr.length === 0) {
                        permutations.push(m);
                    } else {
                        for (let i = 0; i < arr.length; i++) {
                            let curr = arr.slice();
                            let next = curr.splice(i, 1);
                            permute(curr.slice(), m.concat(next));
                        }
                    }
                }
            
                let permutations = [];
                permute(array);
                return permutations;
            }
            
            function buildTree(permutations) {
                let root = new Node("root");
                permutations.forEach(permutation => {
                    let currentNode = root;
                    permutation.forEach(value => {
                        let nextNode = currentNode.children.find(child => child.value === value);
                        if (!nextNode) {
                            nextNode = new Node(value);
                            currentNode.children.push(nextNode);
                        }
                        currentNode = nextNode;
                    });
                });
                return root;
            }
            
            function extractPathsFromTree(node, currentPath = [], paths = []) {
                if (node.children.length === 0) {
                    paths.push(currentPath);
                } else {
                    node.children.forEach(child => {
                        extractPathsFromTree(child, currentPath.concat(child.value), paths);
                    });
                }
                return paths;
            }
            
            function createArrayFromZeroToN(n) {
                let array = [];
                for (let i = 0; i <= n-1; i++) {
                    array.push(i);
                }
                return array;
            }
            
            let n = nbPartners;
            let array = createArrayFromZeroToN(n);
            console.log(array)
            let permutations = generatePermutations(array);
            let tree = buildTree(permutations);
            let paths = extractPathsFromTree(tree);
            
            let minDistance = Infinity;
            let minDistancePath = [];
            
            paths.forEach(path => {
                let distance = 0;
                for(let i = 0; i < path.length - 1; i++) {
                    let result = getDistanceBetweenPoints(
                        positionsTable[path[i]].latitude,
                        positionsTable[path[i]].longitude,
                       positionsTable[path[i + 1]].latitude,
                        positionsTable[path[i + 1]].longitude,
                        ""
                    );
                   distance += result;
                }
                if (distance < minDistance) {
                    minDistance = distance;
                    minDistancePath = path; 
                }
            });
            
            console.log(minDistancePath)

            let sortAddresses = []

            for (let i=0; i<minDistancePath.length; i++){
                sortAddresses.push([positionsTable[minDistancePath[i]].address, positionsTable[minDistancePath[i]].latitude, positionsTable[minDistancePath[i]].longitude])
            }

            return { minDistance, sortAddresses };
        } catch (error) {
            console.log(error);
            return {error: "Erreur"};
        }
    }

    async getAllStockByCollectService(idCollect){
        try {
            let result = await this.repository.getAllStockByCollectRepo(idCollect);
            return result;
        } catch (error) {
            console.log(error);
            return {error: "Erreur"};
        }
    }
    
    async getCollectsByDriverService(idDriver){
        try {
            if(!idDriver) return {error: "Mauvais id"}
            let collects = await this.repository.getCollectsByDriverRepo(idDriver);
            return collects;
        } catch (error) {
            console.log(error);
            return {error: "Erreur durant la récupération des collectes"};
        }
    }

}

module.exports = CollectsService;