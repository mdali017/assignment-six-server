import nodemailer from "nodemailer";

const sendEmail = async(option: any) => {
// CREATE A TRANSPORTER
const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    secure: false, // true for port 465, false for other ports
    auth: {
      user: "dc0d9dbc7b103b",
      pass: "e83bb49d9f13a2",
    },
  });

//   DEFINE EMAIL OPTIONS
const mailOptions = {
    from: '"Maddison Foo Koch 👻" <maddison53@ethereal.email>',
    to: option.email,
    subject: option.subject,
    text: option.message,
  };

//   SEND EMAIL
  await transporter.sendMail(mailOptions);
}

export default sendEmail;
