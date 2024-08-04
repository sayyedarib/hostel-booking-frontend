const nodemailer = require('nodemailer');

export const transporter = nodemailer.createTransport({
    host: "smtpout.secureserver.net",
    port: 465,
    tls: {
        ciphers: "SSLv3",
        rejectUnauthorized: false,
    },
  
    auth: {
        user: "support@aligarhhostel.com",
        pass: "!8E^QSTNmFm&hR!O"
    }
  });