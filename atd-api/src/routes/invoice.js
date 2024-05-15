const express                   = require('express');
const router                    = express.Router();
const authMiddleware            = require("../middlewares/authMiddleware");
const authAdminMiddleware       = require("../middlewares/authAdminMiddleware");
const isAssoMiddleware       = require("../middlewares/isAssoMiddleware");
const InvoiceController = require("../controller/InvoiceController")
const invoiceController = new InvoiceController()

router.get("/api/invoices/getAllInvoices", [authMiddleware, isAssoMiddleware], invoiceController.getAllInvoices)

router.get("/api/invoices/getMyInvoices", [authMiddleware], invoiceController.getMyInvoices)

router.get("/api/invoices/getInvoiceById/:id", [authMiddleware, isAssoMiddleware], invoiceController.getInvoiceById)

router.get("/api/invoices/getInvoiceByEmail/:email", [authMiddleware, isAssoMiddleware], invoiceController.getInvoiceByEmail)

router.get("/api/invoices/getCardByEmail/:email", [authMiddleware, isAssoMiddleware], invoiceController.getCardByEmail)

router.get("/api/invoices/getMensualInvoices/", [authMiddleware, isAssoMiddleware], invoiceController.getMensualInvoices)

router.get("/api/invoices/getMensualInvoicesByEmail/:email", [authMiddleware, isAssoMiddleware], invoiceController.getMensualInvoicesByEmail)

router.post("/api/invoices/donate", invoiceController.donate)

module.exports = router