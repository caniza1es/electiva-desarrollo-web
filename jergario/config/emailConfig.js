const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
        user: "canizalesbeltran@gmail.com", 
        pass: "ttpv awiu ruoa gtja"
    }
});

module.exports = transporter;
