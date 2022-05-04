ssh root@103.81.87.65
viesoftware

# Local test

-   Start: npm run begin
-   Stop: npm run end
-   View logs: npm run log

# Deploy

    -   Setup (1 lần đầu tiên): Bỏ qua nếu đã thực hiện ở dự án khác
        -   1: ssh-keygen -t rsa
        -   4: ssh-copy-id root@103.81.87.65
        -   5: nhập password: viesoftware
    -   Steps:
        -   1: Push code lên git:
        -   2: chạy lệnh:
            -   npm run deploy-sandbox với phiên bản sandbox
            -   npm run deploy-production với phiên bản production
