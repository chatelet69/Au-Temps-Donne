const InvoiceService    = require("../services/InvoiceService")
const config            = require("../../config.json");
const stripe            = require('stripe')(config.stripePrivateKey);
class InvoiceController{
    invoiceService;
    constructor(){
        this.invoiceService = new InvoiceService()
    }

    donate = async (req,res) =>{
        try {
            let result = await this.invoiceService.donateService(req.body)
            if(result && !result.error) res.status(200).json({ message: "Donation envoyée avec succès !"});
            else res.status(400).json({ error : result.error})
        } catch (error) {
            console.log("error at @donate : " + error);
            res.status(500).json({ error: "Une erreur est survenue durant la donation"});
        }
    }
    
    getAllInvoices = async (req, res) => {
        try {
            let invoicesList = await this.invoiceService.getAllInvoicesService()
            if(invoicesList && !invoicesList.error) res.status(200).json({ invoices: invoicesList});
            else res.status(400).json({ error : invoicesList.error})
        } catch (error) {
            console.log("error at @getAllInvoices : " + error);
            res.status(500).json({ error: "Une erreur est survenue durant la récupération des donations"});
        }
    }

    getInvoiceById = async (req, res) => {
        try {
            let invoice = await this.invoiceService.getInvoiceByIdService(req.params)
            if(invoice && !invoice.error) res.status(200).json({ invoice: invoice});
            else res.status(400).json({ error : invoice.error})
        } catch (error) {
            console.log("error at @getInvoiceById : " + error);
            res.status(500).json({ error: "Une erreur est survenue durant la récupération de la donation"});
        }
    }

    getMyInvoices = async (req, res) => {
        try {
            let invoice = await this.invoiceService.getMyInvoicesService(req.user)
            if(invoice && !invoice.error) res.status(200).json({ invoices: invoice});
            else res.status(400).json({ error : invoice.error})
        } catch (error) {
            console.log("error at @getInvoiceByUserId : " + error);
            res.status(500).json({ error: "Une erreur est survenue durant la récupération de la donation"});
        }
    }

    getInvoiceByEmail = async (req, res) => {
        try {
            let invoices = await this.invoiceService.getInvoiceByEmailService(req.params)
            if(invoices && !invoices.error) res.status(200).json({ invoices: invoices});
            else res.status(400).json({ error : invoices.error})
        } catch (error) {
            console.log("error at @getInvoiceByEmail : " + error);
            res.status(500).json({ error: "Une erreur est survenue durant la récupération des donations"});
        }
    }

    getCardByEmail = async (req, res) => {
        try {
            let card = await this.invoiceService.getCardByEmailService(req.params)
            if(card && !card.error) res.status(200).json({ card: card});
            else res.status(400).json({ error : card.error})
        } catch (error) {
            console.log("error at @getCardByEmail : " + error);
            res.status(500).json({ error: "Une erreur est survenue durant la récupération de la carte"});
        }
    }

    getMensualInvoices = async (req, res) => {
        try {
            let mensualInvoices = await this.invoiceService.getMensualInvoicesService()
            if(mensualInvoices && !mensualInvoices.error) res.status(200).json({ mensualInvoices: mensualInvoices});
            else res.status(400).json({ error : mensualInvoices.error})
        } catch (error) {
            console.log("error at @getMensualInvoices : " + error);
            res.status(500).json({ error: "Une erreur est survenue durant la récupération des donations mensuelles"});
        }
    }

    getMensualInvoicesByEmail = async (req, res) => {
        try {
            let mensualInvoices = await this.invoiceService.getMensualInvoicesByEmailService(req.params)
            if(mensualInvoices && !mensualInvoices.error) res.status(200).json({ mensualInvoices: mensualInvoices});
            else res.status(400).json({ error : mensualInvoices.error})
        } catch (error) {
            console.log("error at @getMensualInvoicesByEmail : " + error);
            res.status(500).json({ error: "Une erreur est survenue durant la récupération des donations mensuelles"});
        }
    }
}

module.exports = InvoiceController