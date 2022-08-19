const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  //Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    logger: true,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    //activate in gmail "less secure app" option
  });

  //Define Email options
  const mailOptions = {
    from: 'Natalia Ciampelletti <natashat@shaw.ca>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // Actually send an email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
