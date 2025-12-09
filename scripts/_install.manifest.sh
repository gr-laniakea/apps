#!/bin/sh
set -eux

VERSION="1.2.3"
tmp_dir="/tmp/install_oras"
rm -rf $tmp_dir
mkdir -p $tmp_dir
cd $tmp_dir
wget "https://github.com/oras-project/oras/releases/download/v${VERSION}/oras_${VERSION}_linux_amd64.tar.gz"
mkdir -p oras-install/
tar -zxf oras_${VERSION}_*.tar.gz -C oras-install/
mv oras-install/oras /bin/ || true
if command -v apk >/dev/null 2>&1; then
    apk add --no-cache git
elif command -v apt-get >/dev/null 2>&1; then
    apt-get update
    apt-get install -y git
else
    echo "Neither apk nor apt-get found. Cannot install git."
    exit 1
fi
