const nodemailer = require('nodemailer')
require('dotenv').config()

const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM } = process.env;

const transporter = SMTP_HOST
    ? nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT) || 587,
        secure: Number(SMTP_PORT) === 465,
        auth: { user: SMTP_USER, pass: SMTP_PASS },
    })
    : null;

const sendEmail = async (data) => {
    if (!transporter || process.env.NODE_ENV === 'test') return false;
    const email = { ...data, from: EMAIL_FROM || SMTP_USER };
    await transporter.sendMail(email);
    return true;
};

module.exports = sendEmail;
