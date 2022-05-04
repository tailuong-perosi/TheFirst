const { sendMail } = require('./libs/nodemailer');
(async () => {
    await sendMail('huynhtrongmandev@gmail.com', 'Hi, How are youu', 'Day la noi dung');
})();
