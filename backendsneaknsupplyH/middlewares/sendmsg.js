const nodemailer = require('nodemailer');
const myemail='sneaksupply27@gmail.com';
const mypass='myfpsugrqnnnpslr';
// configure nodemailer transport
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  auth: {
    user:myemail,
    pass:mypass,
  },
});

const sendcontact = ( msg,subject) => {
    return new Promise((resolve, reject) => {
      const mailOptions = {
        from: myemail,
        to:myemail,
        subject,
        text: msg,
      };
  
      transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
          reject(error);
        } else {
          console.log('Email sent: ' + info.response);
          resolve(true);
        }
      });
    });
  };
module.exports={sendcontact}