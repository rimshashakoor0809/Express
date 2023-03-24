const nodemailer = require('nodemailer');

const sendMail = async options => {
  // 1. create a transporter
  const transportor = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    }
  })
  // 2. Define the options

  const mailOptions = {
    from: 'Rimsha Shakoor <example@hello.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html: '',
  }
  // 3. Send mail
  await transportor.sendMail(mailOptions);

}
module.exports = sendMail;