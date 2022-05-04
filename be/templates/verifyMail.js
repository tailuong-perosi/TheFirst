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
                        Cám ơn quý khách đã tin tưởng sử dụng dịch vụ của chúng tôi!
                    </p>
                    <p>
                        Mã kích hoạt tài khoản của quý khách là <b>${otpCode}</b>. Quý khách vui lòng nhấn vào nút xác thực tài khoản phía dưới để bắt đầu.
                    </p>
                    <p>
                        Xin chân thành cám ơn!
                    </p>

                    <a href="${verifyLink}" class="verify_link"><button class="top_button">Xác thực tài khoản</button></a>
                </div>
            </div>
        </body>
    </html>
    `;
};
