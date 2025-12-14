#!/usr/bin/env fish

set sabs_group \
    afed602f-c23d-4fbc-b14f-dabc2bf83c0f \
    628f7144-0612-4235-ba5e-c371dbd4512a \
    e6b0bf1f-d83d-47c5-93b2-ed06e4887229

set old_sonarr_group \
    aa1c5930-8ba0-4b3f-bb50-35db48872cc9 \
    71623fa3-fbf7-42d8-9dc9-37d2c936eadf

set letters a b c d e f g h i j k l m n o p q r s t u v w x y z

set word pause
set svcs jellyfin

for svc in $svcs
    dictum -s "[app.kubernetes.io/instance=$svc]" $word
end
function mount_group
    set group_name $argv[1]
    set -e argv[1]
    set uuids $argv

    set base_dir "/mnt/$group_name"
    mkdir -p $base_dir

    set idx 1
    for uuid in $uuids
        set letter $letters[$idx]
        set mount_path "$base_dir/$letter"
        mkdir -p $mount_path

        set lv_path "/dev/vg/$uuid"
        echo "Activating $lv_path..."
        lvchange -ay $lv_path

        echo "Mounting $lv_path -> $mount_path"
        mount $lv_path $mount_path

        set idx (math $idx + 1)
    end
end

function unmount_group
    set group_name $argv[1]
    set -e argv[1]
    set uuids $argv

    set base_dir "/mnt/$group_name"

    set idx 1
    for uuid in $uuids
        set letter $letters[$idx]
        set mount_path "$base_dir/$letter"
        set lv_path "/dev/vg/$uuid"

        echo "Unmounting $mount_path..."
        umount $mount_path

        echo "Deactivating $lv_path..."
        lvchange -an $lv_path

        set idx (math $idx + 1)
    end
end

# Mount all sabs devices to /mnt/sabs/{a,b,c,...}
mount_group sabs $sabs_group

# Mount all old_sonarr devices to /mnt/old_sonarr/{a,b,...}
mount_group old_sonarr $old_sonarr_group

ln -s (realpath a) /mnt/from/sabnzbd
ln -s (realpath b) /mnt/from/transmission

for svc in sabnzbd transmission sonarr radarr
    set block (topolvm deploy/media/$svc:var get block)
    echo "mount $block /mnt/$svc"
end
mount /dev/vg/1ec161a3-0144-45cd-a961-7b4ec16ce528 /mnt/sabnzbd
mount /dev/vg/112bd93d-f4f4-475b-82b6-106de05c0524 /mnt/transmission
mount /dev/vg/828b1b01-bd3d-4234-b3bd-38a0e96ee118 /mnt/sonarr
mount /dev/vg/68261f6e-30dd-47a8-8836-c951a8fde868 /mnt/radarr

mount /dev/vg0/d1608b06-8e50-4fb3-88ef-29767b5000d7 /mnt/jf
mount /dev/vg0/2e555c67-8a41-4b5e-8a20-2c253d5c2657 /mnt/a
mount /dev/vg0/ede289de-269b-4ba0-b961-89bbccd83ced /mnt/b
return
set BASE_NEW /mnt
set BASE_OLD /mnt/from

function copy_one

    set copy_from $argv[1]
    set copy_to $argv[2]
    echo "Copying $copy_from -> $copy_to"

    sudo rsync \
        --archive \
        --hard-links \
        --acls \
        --xattrs \
        --delete \
        --info=progress2 \
        "$copy_from/" "$copy_to/"
end

copy_one /mnt/a /mnt/jf
dictum -s '[app.kubernetes.io/instance=jellyfin]' unpause
