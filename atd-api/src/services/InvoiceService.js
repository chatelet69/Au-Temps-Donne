const InvoiceRepo = require('../repository/InvoiceRepo')
const UserRepository = require('../repository/UserRepository')
const config            = require("../../config.json");
const stripe            = require("stripe")(config.stripePrivateKey);

class InvoiceService{
    invoiceRepo;
    userRepo;
    constructor(){
        this.invoiceRepo = new InvoiceRepo()
        this.userRepo = new UserRepository()
    }
    
    async donateService(body){
        try {
            let name = body.name
            let lastname = body.lastname
            let email = body.email
            let address = body.address
            let type = body.type
            let amount = body.amount
            let cardId = body.cardId
            if(!name || !lastname || !email || !address || !amount || !type || !cardId) return { error: "Informations manquantes" };
            if(type != 0 && type != 1) return { error: "Mauvais type"}
            if(amount<1) return {error: "Mauvais montant"} // on prend minimum 1 centime
            if(email.indexOf('@') == -1 || email.indexOf('.') == -1 ) return { error : "Mauvais Email"};

            try {
                const payment = await stripe.paymentIntents.create({
                    amount: amount*100, // de base en centime, on transforme en euros
                    currency: "EUR",
                    description: "Au Temps donne",
                    payment_method: cardId,
                    confirm: true,
                    return_url: "https://autempsdonne.lol/"
                })
                console.log("Paiement réussi : ")
            } catch (error) {
                console.log("errorStripe : " + error)
                res.status(400).json({error: "Erreur durant la paiement"})
            }

            let resSaveInvoice = await this.invoiceRepo.saveInvoiceRepo(name, lastname, email, address, amount, type);
            if(resSaveInvoice.affectedRows == 0) return { error : "Erreur durant l'envoi en base de donnée de la donation"};
            if(type == 1){
                var salt = Math.floor(Math.random()*99999)
                var secretKey = salt+email+salt;

                let resSaveInvoiceCard = await this.invoiceRepo.saveInvoiceCardRepo(cardId, resSaveInvoice[0].id, secretKey, salt);
                if(resSaveInvoiceCard.affectedRows == 0) return { error : "Erreur durant la sauvegarde de vos informations bancaires."};
            }
            return true
        } catch (error) {
            console.log("error at @donateService : " + error)
            return {error: "Une erreur est survenue durant l'envoi de la donation"}
        }
    }

    async getAllInvoicesService(){
        try {
            let invoicesList = await this.invoiceRepo.getAllInvoicesRepo();
            if(!invoicesList) return { error : "Une erreur est survenue durant la récupération des donations en base de donnée"};
            return invoicesList
        } catch (error) {
            console.log("error at @getAllInvoicesService : " + error)
            return {error: "Une erreur est survenue durant la reception des donations"}
        }
    }

    async getInvoiceByIdService(body){
        try {
            let id = body.id
            if(!id) return {error: "Mauvais id"}
            let invoice = await this.invoiceRepo.getInvoiceByIdRepo(id);
            if(!invoice) return { error : "Une erreur est survenue durant la récupération de la donation en base de donnée"};
            return invoice
        } catch (error) {
            console.log("error at @getInvoiceByIdService : " + error)
            return {error: "Une erreur est survenue durant la reception de la donation"}
        }
    }

    async getMyInvoicesService(userInfos){
        try {

            let email = await this.userRepo.getUserById(userInfos.userId);
            console.log(email)
            email=email.email
            let invoice = await this.invoiceRepo.getMyInvoicesRepo(email);
            if(!invoice) return { error : "Une erreur est survenue durant la récupération de la donation en base de donnée"};
            return invoice
        } catch (error) {
            console.log("error at @getInvoiceByUserIdService : " + error)
            return {error: "Une erreur est survenue durant la reception de la donation"}
        }
    }

    async getInvoiceByEmailService(body){
        try {
            let email = body.email
            if(!email) return {error: "Mauvais email"}
            let invoice = await this.invoiceRepo.getInvoiceByEmailRepo(email);
            if(!invoice) return { error : "Une erreur est survenue durant la récupération de la donation en base de donnée"};
            return invoice
        } catch (error) {
            console.log("error at @getInvoiceByEmailService : " + error)
            return {error: "Une erreur est survenue durant la reception de la donation"}
        }
    }

    async getCardByEmailService(body){
        try {
            let email = body.email
            if(!email) return {error: "Mauvais email"}
            let card = await this.invoiceRepo.getCardByEmailRepo(email);
            if(!card) return { error : "Une erreur est survenue durant la récupération de la carte en base de donnée"};
            return card
        } catch (error) {
            console.log("error at @getCardByEmailService : " + error)
            return {error: "Une erreur est survenue durant la reception de la carte"}
        }
    }
    
    async getMensualInvoicesService(){
        try {
            let invoice = await this.invoiceRepo.getMensualInvoicesRepo();
            if(!invoice) return { error : "Une erreur est survenue durant la récupération des donations en base de donnée"};
            return invoice
        } catch (error) {
            console.log("error at @getCardByEmailService : " + error)
            return {error: "Une erreur est survenue durant la reception des donations"}
        }
    }

    async getMensualInvoicesByEmailService(body){
        try {
            let email = body.email
            if(!email) return {error: "Mauvais email"}
            let invoice = await this.invoiceRepo.getMensualInvoicesByEmailRepo(email);
            if(!invoice) return { error : "Une erreur est survenue durant la récupération des donations en base de donnée"};
            return invoice
        } catch (error) {
            console.log("error at @getCardByEmailService : " + error)
            return {error: "Une erreur est survenue durant la reception des donations"}
        }
    }
}

module.exports = InvoiceService;