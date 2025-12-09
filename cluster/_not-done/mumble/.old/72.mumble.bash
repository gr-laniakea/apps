set -ex
echo ADDING USERS
groupadd -g 10000 mumble || true
useradd -u 10000 -g 10000 -s /bin/bash -m mumble || true

echo CREATING DIR
mkdir -p /opt/mumble/data
chown -R mumble:mumble /opt/mumble

echo OPENING PORTS
ufw allow 64738

echo RUNNING DOCKER COMPOSE
cd /opt/perdido/config/mumble
docker compose up -d
