set -ex

systemctl stop homepage || true
echo CLONING homepage
configRoot="$PWD/config/homepage"
secretsRoot="$PWD/secrets"
rm -f /etc/systemd/system/homepage.service || true
ln -sf "$(realpath ./config/homepage/homepage.service)" /etc/systemd/system/
if [ -d /opt/homepage ]; then
  cd /opt/homepage
  git reset --hard HEAD
  git clean -f
  git pull
else
    git clone https://github.com/gethomepage/homepage.git /opt/homepage
fi

echo COPYING CONFIG
cp -f $configRoot/{settings,services}.yaml /opt/homepage/config/



cd /opt/homepage

echo POPULATING SECRETS
source $secretsRoot/homepage.bash

cd config
cat $configRoot/settings.yaml | envsubst | tee ./settings.yaml
cat $configRoot/services.yaml | envsubst | tee ./services.yaml
cat $configRoot/widgets.yaml | envsubst | tee ./widgets.yaml

echo SETTINGS UP PNPM
corepack enable pnpm
corepack use pnpm@latest-10

echo INSTALLING DEPENDENCIES
pnpm install

# ask if we should build
pnpm build

echo CHOWNING
chown -R homepage:homepage /opt/homepage
systemctl daemon-reload
systemctl start homepage
systemctl enable homepage

