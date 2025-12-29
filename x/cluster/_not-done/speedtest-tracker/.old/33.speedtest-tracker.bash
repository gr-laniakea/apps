set -ex
echo SPEEDTEST TRACKER

cd ./config/speedtest-tracker
docker-compose down || true

docker-compose up -d