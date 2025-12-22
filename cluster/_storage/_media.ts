import { Gi, T } from "@k8ts/instruments"
import { W } from "@/root"
import { nodeAffinity } from "@/_hdd-node"
import { getAppMeta } from "@/_meta/app-meta"
import { Pv } from "k8ts"

export default W.File("libraries.yaml", {
    meta: {},
    *FILE() {
        yield new Pv("media", {
            $accessModes: ["RWO"],
            $capacity: T(10),
            $backend: {
                type: "Local",
                path: "/data/media"
            },
            reclaimPolicy: "Retain",
            nodeAffinity
        })

        yield new Pv("nfs-media", {
            $accessModes: ["ROX"],
            $capacity: T(10),
            $backend: {
                type: "NFS",
                path: "/data/media",
                server: "10.0.10.18"
            },
            mountOptions: ["ro", "nfsvers=4.2"]
        })
    }
})
// /media/downs/going
// /media/downs/done
// /media/arr/tv
// /media/arr/film
// /media/jf/tv
// /media/jf/film
