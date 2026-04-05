set -ex
echo INSTALLING IPERF

apt-get -y --no-install-recommends install iperf3

rm -rf /etc/iperf/passwords
ln -sf "$(realpath ./config/iperf3/passwords)" /etc/iperf/passwords
ln -sf "$(realpath ./config/iperf3/iperf.service)" /etc/systemd/system/
chown -R iperf:iperf /etc/iperf


systemctl restart iperf
