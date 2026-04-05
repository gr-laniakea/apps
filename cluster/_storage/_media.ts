import { nodeAffinity } from "@/_hdd-node"
import { W } from "@/root"
import { T } from "@k8ts/instruments"
import { Pv } from "k8ts"

export default W.File("libraries.yaml", {
    metadata: {},
    *resources$() {
        yield new Pv("media", {
            $accessModes: ["RWO"],
            $capacity: {
                storage: T(10)
            },
            $backend: {
                kind: "Local",
                path: "/data/media"
            },
            $reclaimPolicy: "Retain",
            $$manifest: {
                nodeAffinity
            }
        })

        yield new Pv("nfs-media", {
            $accessModes: ["ROX"],
            $capacity: {
                storage: T(10)
            },
            $backend: {
                kind: "NFS",
                path: "/data/media",
                server: "10.0.10.18"
            },
            $$manifest: {
                mountOptions: ["ro", "nfsvers=4.2"],
                nodeAffinity
            }
        })
    }
})
// /media/downs/going
// /media/downs/done
// /media/arr/tv
// /media/arr/film
// /media/jf/tv
// /media/jf/film
