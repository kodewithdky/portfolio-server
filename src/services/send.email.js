import nodemailer from "nodemailer";

export const sendEmail = (options) => {
   //create transporter
   const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
         user: process.env.SMTP_EMAIL,
         pass: process.env.SMTP_PASSWORD,
      },
   });
   //create message
   const message = {
      from: process.env.SMTP_EMAIL,
      to: options.email,
      subject: options.subject,
      text: options.message,
   };
   //send message
   transporter.sendMail(message);
};
