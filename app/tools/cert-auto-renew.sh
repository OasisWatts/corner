!/bin/sh
nginx -s stop
/usr/bin/certbot renew> renew-test.log
fuser -k 80/tcp
nginx -s reload