const StorageRepository   = require("../repository/StorageRepository");
const VolunteerRepo       = require("../repository/volunteerRepo");
const UtilService         = require("../services/UtilService");
//const { all }             = require("../routes/storage");
const form                = require("../utils/form.json");
const off                 = require("openfoodfacts-nodejs");
const moment              = require("moment");

class StorageService {
  repository;
  foodApi;
  volunteerRepo;
  utilService;
  constructor() {
    this.utilService = new UtilService();
    this.volunteerRepo = new VolunteerRepo();
    this.foodApi = new off();
    this.repository = new StorageRepository();
  }

  async getAllWarehousesService() {
    try {
      let result = await this.repository.getAllWarehousesDb();
      if (result) {
        for (let i = 0; i < result.length; i++) {
          result[i] = this.utilService.decodeData(result[i]);
        }
        return result;
      } else return { error: form.errorDuringGet };
    } catch (error) {
      console.log(error);
      return { error: form.errorDuringGet };
    }
  }
  async getAllWorkPlacesService() {
    try {
      let result = await this.repository.getAllWorkPlacesDb();
      if (result) {
        for (let i = 0; i < result.length; i++) {
          result[i] = this.utilService.decodeData(result[i]);
        }
        return result;
      } else return { error: form.errorDuringGet };
    } catch (error) {
      console.log(error);
      return { error: form.errorDuringGet };
    }
  }

  async getTotalStockService(userInfos) {
    try {
      let formations = await this.volunteerRepo.getFormationsById(
        userInfos.userId
      );
      if ((!formations || formations.stock == 0) && userInfos.rank < 5)
        return false;
      let result = await this.repository.getTotalStockRepo();
      if (result) {
        for (let i = 0; i < result.length; i++) {
          result[i] = this.utilService.decodeData(result[i]);
        }
        return result;
      } else return false;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async getStockByTypeService(userInfos, body) {
    try {
      let formations = await this.volunteerRepo.getFormationsById(
        userInfos.userId
      );
      if (!body.type) return false;
      if (form.typeStock.indexOf(body.type) == -1) return false;
      if ((!formations || formations.stock == 0) && userInfos.rank < 5)
        return false;
      let result = await this.repository.getStockByTypeRepo(body.type);
      if (result) {
        for (let i = 0; i < result.length; i++) {
          result[i] = this.utilService.decodeData(result[i]);
        }
        return result;
      } else return false;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async getStockByIdService(userInfos, body) {
    try {
      let formations = await this.volunteerRepo.getFormationsById(
        userInfos.userId
      );
      if (!body.id || body.id == undefined || body.id == "" || body.id == null)
        return false;
      if ((!formations || formations.stock == 0) && userInfos.rank < 5)
        return false;
      let result = await this.repository.getStockByIdRepo(body.id);
      if (result && result[0]) {
        result = result[0];
        result = this.utilService.decodeData(result);
        return result;
      } else return false;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async getNearDlcProductsService(userInfos) {
    try {
      let formations = await this.volunteerRepo.getFormationsById(
        userInfos.userId
      );
      if ((!formations || formations.stock == 0) && userInfos.rank < 5)
        return false;
      let date = moment().add(3, "d").format("YYYY-MM-DD");
      let result = await this.repository.getNearDlcProductsRepo(date);
      if (result) {
        for (let i = 0; i < result.length; i++) {
          result[i] = this.utilService.decodeData(result[i]);
        }
        return result;
      } else return false;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async getDlcProductsService(userInfos) {
    try {
      let formations = await this.volunteerRepo.getFormationsById(
        userInfos.userId
      );
      if ((!formations || formations.stock == 0) && userInfos.rank < 5)
        return false;
      let result = await this.repository.getDlcProductsRepo();
      if (result) {
        for (let i = 0; i < result.length; i++) {
          result[i] = this.utilService.decodeData(result[i]);
        }
        return result;
      } else return false;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async verifIfWarehouse(idEntrepot) {
    let warehouses = await this.getAllWarehousesService();
    if (warehouses) {
      for (let i = 0; i < warehouses.length; i++) {
        if (warehouses[i].id == idEntrepot) {
          return true;
        }
      }
      return false;
    } else {
      return false;
    }
  }

  async receptCollectProductsService(userInfos, body) {
    try {
      body = this.utilService.encodeData(body);
      const idEntrepot = body.idEntrepot_fk;
      if (this.verifIfWarehouse(idEntrepot) == false) return false;
      const location = body.location;
      const barcode = body.barcode;
      const collect_id = body.collect_id;
      let formations = await this.volunteerRepo.getFormationsById(
        userInfos.userId
      );
      if ((!formations || formations.collect == 0) && userInfos.rank < 5)
        return false;
      if (!idEntrepot || !location || !barcode || !collect_id) return false;
      let verifLocation = location.split("");
      if (
        location.length > 4 ||
        !isNaN(verifLocation[0]) ||
        !isNaN(verifLocation[1]) ||
        isNaN(verifLocation[2]) ||
        isNaN(verifLocation[3])
      )
        return false;
      let bodyId = [];
      bodyId["location"] = location;
      bodyId["idEntrepot_fk"] = idEntrepot;
      let checkLocation = await this.repository.getStockByLocation(bodyId);
      if (checkLocation.length > 0) return false;
      let result = await this.repository.receptCollectProductsRepo(
        idEntrepot,
        location,
        barcode,
        collect_id
      );
      if (result.affectedRows >= 1) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async updateStockByProductService(userInfos, body) {
    try {
      body = this.utilService.encodeData(body);
      const idEntrepot = body.idEntrepot_fk;
      if (this.verifIfWarehouse(idEntrepot) == false) return false;
      const location = body.location;
      const id = body.id;
      const amount = parseInt(body.amount);
      let bodyId = [];
      if (!amount) return false;
      let formations = await this.volunteerRepo.getFormationsById(
        userInfos.userId
      );
      if ((!formations || formations.collect == 0) && userInfos.rank < 5)
        return false;
      if (!idEntrepot && !location && !id) return false;
      if (location) {
        if (!idEntrepot) return false;
        let verifLocation = location.split("");
        if (
          location.length > 4 ||
          !isNaN(verifLocation[0]) ||
          !isNaN(verifLocation[1]) ||
          isNaN(verifLocation[2]) ||
          isNaN(verifLocation[3])
        )
          return false;
        bodyId["location"] = location;
        bodyId["idEntrepot_fk"] = idEntrepot;
        let checkLocation = await this.repository.getStockByLocation(bodyId);
        if (checkLocation.length == 0) return false;
        if (checkLocation[0].amount + amount < 0) return false;
        if (checkLocation[0].amount + amount == 0) {
          let result = await this.deleteStockByIdService(userInfos, bodyId);
          if (result == true) return true;
          else return false;
        }
      }
      if (!bodyId["location"]) bodyId["id"] = id;

      let result = await this.repository.updateStockByProductRepo(
        amount,
        bodyId
      );
      if (result.affectedRows >= 1) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async moveStockByProductService(userInfos, body) {
    try {
      body = this.utilService.encodeData(body);
      const idEntrepot = body.idEntrepot_fk;
      if (this.verifIfWarehouse(idEntrepot) == false) return false;
      const location = body.location;
      const id = body.id;
      let formations = await this.volunteerRepo.getFormationsById(
        userInfos.userId
      );
      if ((!formations || formations.collect == 0) && userInfos.rank < 5)
        return false;
      if (!idEntrepot || !id) return false;
      let verifLocation = location.split("");
      if (location != "") {
        if (
          location.length > 4 ||
          !isNaN(verifLocation[0]) ||
          !isNaN(verifLocation[1]) ||
          isNaN(verifLocation[2]) ||
          isNaN(verifLocation[3])
        )
          return false;
      }
      let result = await this.repository.moveStockByProductRepo(
        location,
        idEntrepot,
        id
      );
      if (result.affectedRows >= 1) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async addManuallyProductService(userInfos, body) {
    try {
      body = this.utilService.encodeData(body);
      const barcode = body.barcode;
      const title = body.title;
      const amount = parseInt(body.amount);
      const type = body.type;
      const category = body.category;
      const allergy = body.allergy;
      const expiry_date = body.expiry_date;
      const collect_id = body.collect_id;
      let status = 0;
      let formations = await this.volunteerRepo.getFormationsById(
        userInfos.userId
      );
      if (
        (!formations || (formations.collect == 0 && formations.stock == 0)) &&
        userInfos.rank < 5
      )
        return false;
      if (
        !barcode ||
        !title ||
        !amount ||
        !type ||
        !category ||
        !allergy ||
        !expiry_date
      )
        return false;
      if (form.typeStock.indexOf(type) == -1) return false;
      if (form.categoryList.indexOf(category) == -1) return false;

      let result = await this.repository.getCollectProductService(
        barcode,
        title,
        amount,
        type,
        category,
        allergy,
        status,
        expiry_date,
        null,
        collect_id
      );
      if (result == true) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async addStockInLocationService(userInfos, body) {
    try {
      body = this.utilService.encodeData(body);
      const barcode = body.barcode;
      const title = body.title;
      const amount = parseInt(body.amount);
      const type = body.type;
      const category = body.category;
      const allergy = body.allergy ? body.allergy : false;
      const expiry_date = body.expiry_date;
      const idEntrepot_fk = body.idEntrepot_fk;
      const location = body.location;
      const status = 1;

      let formations = await this.volunteerRepo.getFormationsById(
        userInfos.userId
      );
      
      if (
        (!formations || (formations.collect == 0 && formations.stock == 0)) &&
        userInfos.rank < 5
      )
      return false;
      if (
        !barcode ||
        !title ||
        !amount ||
        !type ||
        !category ||
        !expiry_date ||
        !idEntrepot_fk ||
        !location
      )
      return false;
      if(amount<=0) return false;
      if(moment().isAfter(expiry_date)) return false;
      if (this.verifIfWarehouse(idEntrepot_fk) == false) return false;
      let verifLocation = location.split("");
      if (
        location.length > 4 ||
        !isNaN(verifLocation[0]) ||
        !isNaN(verifLocation[1]) ||
        isNaN(verifLocation[2]) ||
        isNaN(verifLocation[3])
      )
      return false;
      let bodyId = [];
      bodyId["location"] = location;
      bodyId["idEntrepot_fk"] = idEntrepot_fk;
      let checkLocation = await this.repository.getStockByLocation(bodyId);
      if (checkLocation.length > 0) return false;
      console.log("ok")

      if (form.typeStock.indexOf(type) == -1) return false;
      if (form.categoryList.indexOf(category) == -1) return false;

      let result = await this.repository.addStockInLocationRepo(
        barcode,
        title,
        amount,
        type,
        category,
        allergy,
        status,
        expiry_date,
        idEntrepot_fk,
        location
      );
      if (result == true) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async deleteStockByIdService(userInfos, body) {
    try {
      body = this.utilService.encodeData(body);
      let idEntrepot = body.idEntrepot_fk;
      if (this.verifIfWarehouse(idEntrepot) == false) return false;
      let location = body.location;
      let id = body.id;
      let bodyId = [];
      if (!idEntrepot && !location && !id) return false;
      if (location) {
        if (!idEntrepot) return false;
        let verifLocation = location.split("");
        if (
          location.length > 4 ||
          !isNaN(verifLocation[0]) ||
          !isNaN(verifLocation[1]) ||
          isNaN(verifLocation[2]) ||
          isNaN(verifLocation[3])
        )
          return false;
        bodyId["location"] = location;
        bodyId["idEntrepot_fk"] = idEntrepot;
        let checkLocation = await this.repository.getStockByLocation(bodyId);
        if (checkLocation.length == 0) return false;
      }
      if (!bodyId["location"]) bodyId["id"] = id;
      let formations = await this.volunteerRepo.getFormationsById(
        userInfos.userId
      );
      if ((!formations || formations.stock == 0) && userInfos.rank < 5)
        return false;
      let result = await this.repository.deleteStockByIdRepo(bodyId);
      if (result.affectedRows > 0) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async getMissingStockService(userInfos, query) {
    try {
      let missingAmount;
      if (query.missingAmount) missingAmount = query.missingAmount;
      else
        missingAmount = form.missingStockAmount ? form.missingStockAmount : 50;
      let formations = await this.volunteerRepo.getFormationsById(
        userInfos.userId
      );
      if ((!formations || formations.stock == 0) && userInfos.rank < 5)
        return false;
      let result = await this.getStockGroupByTypeService(userInfos);
      if (result) {
        let finalResult = [];
        for (let j = 0; j < result.length; j++) {
          if (result[j].amount <= missingAmount) {
            finalResult.push(result[j]);
          }
        }
        for (let i = 0; i < finalResult.length; i++) {
          finalResult[i] = this.utilService.decodeData(finalResult[i]);
        }
        return finalResult;
      } else {
        return false;
      }
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async getStockGroupByTypeService(userInfos) {
    try {
      let formations = await this.volunteerRepo.getFormationsById(
        userInfos.userId
      );
      if ((!formations || formations.stock == 0) && userInfos.rank < 5)
        return false;
      let result = await this.repository.getStockGroupByTypeRepo();
      if (result) {
        let finalResult = [];
        for (let i = 0; i < form.categoryList.length; i++) {
          let verif = false;
          for (let j = 0; j < result.length; j++) {
            if (form.categoryList[i] == result[j].category) {
              verif = true;
              finalResult.push(result[j]);
            }
          }
          if (!verif) {
            finalResult.push({ category: form.categoryList[i], amount: 0 });
          }
        }
        for (let i = 0; i < finalResult.length; i++) {
          finalResult[i] = this.utilService.decodeData(finalResult[i]);
        }
        return finalResult;
      } else {
        return false;
      }
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async getLastStockService(userInfos, query) {
    try {
      let limitLastStock;
      if (query.limitLastStock) limitLastStock = parseInt(query.limitLastStock);
      else limitLastStock = form.limitLastStock ? form.limitLastStock : 5;
      let formations = await this.volunteerRepo.getFormationsById(
        userInfos.userId
      );
      if ((!formations || formations.stock == 0) && userInfos.rank < 5)
        return false;
      let result = await this.repository.getLastStockRepo(limitLastStock);
      for (let i = 0; i < result.length; i++) {
        result[i] = this.utilService.decodeData(result[i]);
      }
      if (result) {
        return result;
      } else {
        return false;
      }
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async getCollectProductService(userInfos, body) {
    try {
      body = this.utilService.encodeData(body);
      const barcode = body.barcode;
      const collect_id = body.collect_id;
      const amount = parseInt(body.amount);
      if (amount < 0) return false;
      const type = body.type;
      if (form.typeStock.indexOf(type) == -1) return false;
      let expiry_date = body.expiry_date;
      // expiry_date = this.utilService.formatDateToMoment(expiry_date, true, false) utile pour savoir quand ils seront périmés.
      let formations = await this.volunteerRepo.getFormationsById(
        userInfos.userId
      );
      if ((!formations || formations.collect == 0) && userInfos.rank < 5)
        return false;
      if (!barcode || !amount || !type || !expiry_date || !collect_id) return false;

      let productInfos = await this.foodApi.getProduct(decodeURI(barcode));
      productInfos = productInfos.product;
      if (
        productInfos.status == 0 ||
        productInfos.status_verbose == "no code or invalid code"
      )
        return false;
      let picture = productInfos.image_url ? productInfos.image_url : null;
      let name = false;
      name = productInfos.abbreviated_product_name_fr
        ? productInfos.abbreviated_product_name_fr
        : productInfos.abbreviated_product_name;

      if (name == false || name == undefined) {
        if (
          productInfos.ecoscore_data.agribalyse &&
          (productInfos.ecoscore_data.agribalyse.name_fr ||
            productInfos.ecoscore_data.agribalyse.name_en)
        ) {
          name = productInfos.ecoscore_data.agribalyse.name_fr
            ? productInfos.ecoscore_data.agribalyse.name_fr
            : productInfos.ecoscore_data.agribalyse.name_en;
        } else {
          name = productInfos.product_name_fr
            ? productInfos.product_name_fr
            : productInfos.product_name;
        }
      }
      let categoryProduct;
      if (body.category) {
        categoryProduct = body.category;
      } else {
        if (
          productInfos.sources_fields &&
          productInfos.sources_fields["org-gs1"]
        ) {
          categoryProduct = productInfos.sources_fields["org-gs1"]
            .gpcCategoryName
            ? productInfos.sources_fields["org-gs1"].gpcCategoryName
            : productInfos.categories;
        } else {
          categoryProduct = productInfos.categories
            ? productInfos.categories
            : "Autre";
        }
      }
      let allergy = productInfos.allergens_imported
        ? productInfos.allergens_imported
        : productInfos.isAllergenRelevantDataProvided
        ? productInfos.isAllergenRelevantDataProvided
        : productInfos.allergens_from_ingredients
        ? productInfos.allergens_from_ingredients
        : false;

      let status = 0;
      let result = this.repository.getCollectProductService(
        barcode,
        name,
        amount,
        type,
        categoryProduct,
        allergy,
        status,
        expiry_date,
        picture,
        collect_id
      );
      if (result) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async getAmountStockService() {
    try {
      let result = await this.repository.getAmountStockRepo();
      if (result) {
        return result;
      } else return { error: "récupération impossible" };
    } catch (error) {
      console.log(error);
      return { error: form.errorDuringGet };
    }
  }

  async getEvolutionStockService() {
    try {
      let result = await this.repository.getEvolutionStockRepo();
      if (result) {
        return result;
      } else return { error: "récupération impossible" };
    } catch (error) {
      console.log(error);
      return { error: form.errorDuringGet };
    }
  }

  async addEvolutionStockService() {
    try {
      const amount = await this.repository.getAmountStockRepo()

      if (amount){
        await this.repository.addAmountStockRepo(amount[0].total_stock);
        return { message: "ajout effectué" }
      }else{
        return { error: "erreur lors de la récupérations des quantités" }
      }
    } catch (error) {
      console.log(error);
      return { error: form.errorDuringGet };
    }
  }

  async getExpectedFlowService() {
    try {
      const amount = await this.repository.getExpectedFlowDb();
      if (amount !== null && amount.sumStocks !== undefined) return amount.sumStocks;
      else return { error: form.errorDuringGet };
    } catch (error) {
      console.log(error);
      return { error: form.errorDuringGet };
    }
  }
}

module.exports = StorageService;
