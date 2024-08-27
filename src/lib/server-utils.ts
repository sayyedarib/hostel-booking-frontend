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

export const sendEmail = async ({
  to,
  subject,
  text,
  html,
}: {
  to: string;
  subject: string;
  text: string;
  html: string;
}) => {
  try {
    const mailOptions = {
      from: process.env.NEXT_PUBLIC_EMAIL_USR,
      to,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
    return info;
  } catch (error) {
    console.error("Error sending email: ", error);
    throw error;
  }
};
