#!/bin/bash

set -ex

# We need to generate a certificate in a specific way...
# using perdido.bond doesn't seem to work
echo GENERATIN IPERF CERTIFICATE
if test -f /etc/iperf/rsa/private-iperf.pem; then
    echo PASSWORD FILE EXISTS
    read -p "Certificate exists. Recreate? y/n: " -n 1 -r
    echo
    if [[ "$REPLY" =~ [Yy] ]]; then
        rm -f /etc/iperf/rsa/*
    else
      exit 0
    fi
fi
mkdir -p /etc/iperf/rsa
cd /etc/iperf/rsa
openssl genrsa -out private.pem 2048
openssl rsa -in private.pem -outform PEM -pubout -out public.pem
openssl rsa -in private.pem -out private-iperf.pem -outform PEM
chmod 660 ./*.pem
chown -R iperf:iperf /etc/iperf
echo CREATED KEYPAIR AT /etc/iperf/rsa/
