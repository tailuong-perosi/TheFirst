const fs = require('fs');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
var path = require('path');
let nodemailer = require(`nodemailer`);
require('dotenv').config();
let transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // upgrade later with STARTTLS
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

const sendMail = (address, subject, content) => {
    let mailOptions = {
        from: process.env.EMAIL_USER,
        to: address,
        subject: subject,
        html: content,
    };
    return transporter.sendMail(mailOptions);
};

const sendMailThanksOrder = async (address, content, order) => {
    var buffer = await readFile(path.join(__dirname, '../templates_mail/order.html'), 'utf8');
    var contentMail = buffer.toString();
    contentMail = contentMail.replace('Thanks for your order', 'Cám ơn bạn đã mua hàng');
    contentMail = contentMail.replace(`You'll receive an email when your items are shipped`, 'Bạn sẽ nhận được 1 email khi đơn hàng bắt đầu giao');
    contentMail = contentMail.replace('SUMMARY', 'Thông tin đơn hàng');
    contentMail = contentMail.replace('SHIPPING ADDRESS', 'Địa chỉ giao hàng');
    contentMail = contentMail.replace('VIEW ORDER STATUS', 'Xem trạng thái đơn hàng');
    contentMail = contentMail.replace('Troubles?', 'Bạn cần hỗ trợ?');
    contentMail = contentMail.replace('My account', 'Tài khoản của tôi');
    contentMail = contentMail.replace('ORDER CODE:', 'Mã đơn hàng: ');
    contentMail = contentMail.replace('#09090909', '#' + order.code);
    contentMail = contentMail.replace('Items ordered:', 'Danh sách sản phẩm: ');

    var total_cost = new String(order.total_cost).toLocaleString('it-IT', { style: 'currency', currency: 'VND' });
    contentMail = contentMail.replace('VALUE_TOTAL_COST', total_cost);

    var final_cost = new String(order.final_cost).toLocaleString('it-IT', { style: 'currency', currency: 'VND' });
    contentMail = contentMail.replace('VALUE_FINAL_COST', final_cost);

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: address,
        subject: content,
        html: contentMail,
    });
};

module.exports = { sendMail, sendMailThanksOrder };
