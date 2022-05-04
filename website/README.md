deploy:
ssh root@vdropship.vn
rm -r /var/www/quantribanhang/build
viesoftware
scp -r ./build root@vdropship.vn:/var/www/quantribanhang/build
