set -ex
groupadd -g 421 foundryvtt || true
useradd -u 421 -g 421 -M -s /bin/bash foundryvtt || true
useradd safr -g 421 -M -s /usr/sbin/nologin || true
gpasswd -M gr,an,foundryvtt,safr foundryvtt || true

chmod -R 770 /data/foundryvtt
mkdir -p /data/foundryvtt
chown -R foundryvtt:foundryvtt /data/foundryvtt
cd ./config/foundryvtt
docker compose down || true
docker compose up -d
while [ $SECONDS -lt 60 ]; do  # Check for up to 3 minutes (180 seconds)
    HEALTH_STATUS=$(docker inspect --format='{{.State.Health.Status}}' "foundryvtt")

    if [ "$HEALTH_STATUS" == "healthy" ]; then
        echo "Container is healthy!"
        cp "$(realpath ./backup.cronjob)" /etc/cron.d/backup-foundryvtt
        chown root:root /etc/cron.d/backup-foundryvtt
        exit 0
    fi

    echo "Waiting for container to become healthy..."
    sleep 15  # Poll every 5 seconds
done

echo "Timed out after 3 minutes. Container is not healthy."
exit 1


