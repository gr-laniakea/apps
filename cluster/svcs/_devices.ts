import { Gi, Mi, T } from "@k8ts/instruments"
import { W } from "@/root"
import { nodeAffinity } from "@/_ssd-node"
import { getAppMeta } from "@/_meta/app-meta"

export default W.Scope("cluster")
    .File("dev.yaml")
    .Resources(function* FILE(FILE) {
        yield FILE.PersistentVolume("gpu-dri", {
            $accessModes: ["RWO"],
            $capacity: Gi(1),
            $mode: "Filesystem",
            $backend: {
                type: "HostPath",
                path: "/dev/dri"
            },
            reclaimPolicy: "Retain",
            nodeAffinity
        })
    })
// /media/downs/going
// /media/downs/done
// /media/arr/tv
// /media/arr/film
// /media/jf/tv
// /media/jf/film
