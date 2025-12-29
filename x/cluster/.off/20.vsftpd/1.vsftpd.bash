#!/bin/bash

set -ex

echo INSTALLING PACKAGES
apt-get install -y vsftpd lftp

echo REMOVING OLD SETTINGS
rm -rf /etc/vsftpd /etc/vsftpd.conf /etc/fail2ban/jail.d/vsftpd.jail.conf /etc/fail2ban/filter.d/vsftpd.conf

echo INSTALLING SETTINGS: FTP, FAIL2BAN
mkdir -p /etc/vsftpd
cp -f vsftpd.conf /etc/vsftpd.conf
cp -f user_list /etc/vsftpd

# Need to test vsftpd because otherwise fail2ban won't start
# cuz it can't find its logs file

echo RESTARTING SERVICES
systemctl daemon-reload
systemctl restart vsftpd.service
systemctl enable vsftpd.service
systemctl restart fail2ban.service
