module.exports.verifyMail = (otpCode, verifyLink) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
        <head>
            <meta charset="UTF-8" />
            <meta http-equiv="X-UA-Compatible" content="IE=edge" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Document</title>
    
            <style>
                .container {
                    width: 800px;
                    background-color: #2874F0;
                    padding: 15px;
                    margin: auto;
                }
                .logo {
                    width: 100px;
                    height: 100px;
                    background-image: url('https://s3.ap-northeast-1.wasabisys.com/ecom-fulfill/2021/09/02/95131dfc-bf13-4c49-82f3-6c7c43a7354d_logo_quantribanhang 1.png');
                    background-size: cover;
                    margin: 10px auto;
                }
                .img_top {
                    width: 20%;
                    margin-bottom: 20px;
                }
                .top {
                    padding: 20px;
                    background-color: #fff;
                    text-align: center;
                }
                .top_button {
                    background-color: #2874F0;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    padding: 10px 40px;
                }
                .bottom {
                    text-align: center;
                }
                .img_bottom {
                    width: 40px;
                    height: 40px;
                }
                .bottom_follow,
                .bottom_icon,
                .verify_link {
                    color: white;
                    text-decoration: none;
                }
                .top_button {
                    margin: 20px 0;
                    cursor: pointer;
                }
                .top_button:hover {
                    cursor: pointer;
                    background-color: red;
                }
                .bottom_icon {
                    display: flex;
                    justify-content: center;
                }
                .icon_1 {
                    border-radius: 50%;
                    background-color: rgb(65, 100, 255);
                    width: 30px;
                    height: 30px;
                    color: #fff;
                    margin-right: 10px;
                }
                .icon_2 {
                    border-radius: 50%;
                    background-color: rgb(108, 129, 250);
                    width: 30px;
                    height: 30px;
                    color: #fff;
                    margin-right: 10px;
                }
                .icon_3 {
                    border-radius: 50%;
                    background-color: rgb(182, 50, 50);
                    width: 30px;
                    height: 30px;
                    color: #fff;
                    margin-right: 10px;
                }
                .icon_4 {
                    border-radius: 50%;
                    background-color: rgb(79, 205, 255);
                    width: 30px;
                    height: 30px;
                    color: #fff;
                    margin-right: 10px;
                }
                i {
                    margin-top: 20%;
                }
            </style>
            <script src="https://kit.fontawesome.com/dbe4ab9c2e.js" crossorigin="anonymous"></script>
        </head>
        <body>
            <div class="container">
                <div class="top">
                    <div class="logo"></div>
                    <p>
                        C??m ??n qu?? kh??ch ???? tin t?????ng s??? d???ng d???ch v??? c???a ch??ng t??i!
                    </p>
                    <p>
                        M?? k??ch ho???t t??i kho???n c???a qu?? kh??ch l?? <b>${otpCode}</b>. Qu?? kh??ch vui l??ng nh???n v??o n??t x??c th???c t??i kho???n ph??a d?????i ????? b???t ?????u.
                    </p>
                    <p>
                        Xin ch??n th??nh c??m ??n!
                    </p>

                    <a href="${verifyLink}" class="verify_link"><button class="top_button">X??c th???c t??i kho???n</button></a>
                </div>
            </div>
        </body>
    </html>
    `;
};
