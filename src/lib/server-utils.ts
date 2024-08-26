const nodemailer = require("nodemailer");

export const transporter = nodemailer.createTransport({
  host: "smtpout.secureserver.net",
  port: 465,
  tls: {
    ciphers: "SSLv3",
    rejectUnauthorized: false,
  },

  auth: {
    user: process.env.NEXT_PUBLIC_EMAIL_USR,
    pass: process.env.NEXT_PUBLIC_EMAIL_PWD,
  },
});

