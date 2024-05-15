const nodemailer    = require("nodemailer");
const atdEmail      = require("../../config.json").atdEmail;
const smtpServer    = require("../../config.json").smtpServer;
const atdPass       = process.env.ATD_EMAIL_PASS;

class EmailService {
    static transporter = nodemailer.createTransport({
        host: smtpServer,
        port: 465,
        secure: true, // Use `true` for port 465, `false` for all other ports
        auth: {
          user: atdEmail,
          pass: atdPass,
        },
    });

    static async sendCodeVerifMail(email, code) {
        try {
            const resSendMail = await this.transporter.sendMail({
                from: `"Au Temps Donné 🎅" <${atdEmail}>`,
                to: email,
                subject: "Mot de passe oublié Au Temps donné",
                text: `Bonjour, votre code de vérification : ${code}`,
                html: `<h1>Code de vérification</h1><p>Bonjour, votre code est : ${code}.</p>`
            });
    
            if (resSendMail.messageId) return true;
            else return false;
        } catch (error) {
            console.log("Error at sendCodeVerifMail : ", error);
            return false;
        }
    }

    static async sendResolvedTicked(email, username, ticketId) {
        try {
            const resSendMail = await this.transporter.sendMail({
                from: `"Au Temps Donné 🎅" <${atdEmail}>`,
                to: email,
                subject: "Ticket clot",
                text: `Bonjour ${username}, votre ticket #${ticketId} a été clot.`,
                html: `<h2>Ticket ${ticketId} fermé</h2><p>Bonjour ${username}, votre ticket #${ticketId} a été clot.</p>`
            });
    
            if (resSendMail.messageId) return true;
            else return false;
        } catch (error) {
            console.log("Error at sendCodeVerifMail : ", error);
            return false;
        }
    }
}

module.exports = EmailService;