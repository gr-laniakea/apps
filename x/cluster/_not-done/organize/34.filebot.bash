#!/usr/bin/env bash

set -ex

apt-get --no-install-recommends -y install filebot

echo PRINT FILEBOT VERSION
filebot -version

echo DECRYPT AND APPLY LICENSE
read -p "Activate filebot now? y/n: " -n 1 -r
echo
if [[ "$REPLY" =~ [Yy] ]]; then
  gpg --output filebot-lic.psm --decrypt ./data/filebot-lic.psm.gpg
  filebot --license filebot-lic.psm
  runuser -u rtorrent -- filebot --license filebot-lic.psm
fi

echo FILEBOT SYSINFO
filebot -script fn:sysinfo



