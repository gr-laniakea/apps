sudo apt-get -yy install samba

rm -rf /etc/samba/smb.conf
cp -f smb.conf "/etc/samba/smb.conf"
systemctl restart smbd
