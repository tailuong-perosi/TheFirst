module.exports = {
    apps: [
        {
            script: 'index.js',
            name: 'AO-Production',
            watch: true,
            env: {
                LOCAL_PORT: '5000',
                GLOBAL_PORT: '5001',
                SOCKET_PORT: '5002',
                DOMAIN: 'upsale.com.vn',
                END_POINT: 'api',
                TIMEZONE: 'Asia/Ho_Chi_Minh',
                EMAIL_HOST: '',
                EMAIL_PORT: '',
                EMAIL_USER: 'support@networkdemo.site',
                EMAIL_PASSWORD: 'u$65lxw0d8',
                MONGO_DATABASE_URI: 'mongodb://dangluu%40:%40Luu123456@103.81.87.65:27017/',
                DATABASE: 'RootAO',
                access_key_wasabi: 'FPGND4WEL36P7YBI22RU',
                secret_key_wasabi: 'iRLPt3iEwt0tCQf1rOLueI0fPAzjHsFwcd3K70e6',
                NODE_ENV: 'production',
            },
        },
    ],
    deploy: {
        production: {
            user: 'root',
            host: ['103.81.87.65'],
            ref: 'origin/master',
            repo: 'git@github.com:viesoftware/System_Admin_Order.git',
            path: '/root/AO-Production',
            'post-deploy': 'cd /root/AO-Production/source/be && npm install && pm2 reload production.config.js --env production',
        },
    },
};
