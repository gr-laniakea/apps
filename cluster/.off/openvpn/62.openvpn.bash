set -ex

apt-get install -y --no-install-recommends openvpn
rm -rf /etc/openvpn/server.conf
ln -s "$(realpath ./config/openvpn/server.conf)" /etc/openvpn/server.conf
  ufw allow 1194/udp
iptables -t nat -A POSTROUTING -s 10.8.0.0/24 -o eth0 -j MASQUERADE
sudo cp -r /usr/share/easy-rsa /etc/openvpn
cp "$(realpath ./config/openvpn/client.ovpn)" /data/gregros.dev/xyz/perdido.ovpn

cd /etc/openvpn
if [ ! -f ./dh.pem ]; then
  ./easy-rsa/easyrsa gen-dh || (./easy-rsa/easyrsa init-pki; ./easy-rsa/easyrsa gen-dh)
  mv pki/dh.pem ./
fi

sudo systemctl start openvpn@server
sudo systemctl enable openvpn@server

