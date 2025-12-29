wget https://github.com/Jackett/Jackett/releases/download/v0.20.4125/Jackett.Binaries.LinuxAMDx64.tar.gz
tar -xvzf Jackett.Binaries.LinuxAMDx64.tar.gz
rm Jackett.Binaries.LinuxAMDx64.tar.gz
rm -rf /opt/jackett
mv Jackett /opt/jackett
ln -sf "$(realpath ./config/arr/jackett.service)" /etc/systemd/system/
systemctl stop jackett.service || true
systemctl daemon-reload
systemctl start jackett.service
