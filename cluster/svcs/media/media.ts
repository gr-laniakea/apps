import namespaces from "@/_namespaces/namespaces"
import { Public } from "@/_storage"
import { W } from "@/root"
import { Pvc } from "k8ts"

export default W.File("media-pvc.yaml", {
    namespace: namespaces["Namespace/media"],
    metadata: {},
    *resources$() {
        yield new Pvc("media", {
            $accessModes: "RWO",
            $volume: Public["PersistentVolume/media"],
            $resources: {
                storage: "=1Gi"
            }
        })
        yield new Pvc("nfs-media", {
            $accessModes: "ROX",
            $volume: Public["PersistentVolume/nfs-media"],
            $resources: {
                storage: "=1Gi"
            }
        })
        yield new Pvc("ebooks", {
            $accessModes: "RWO",
            $volume: Public["PersistentVolume/ebooks"],
            $resources: {
                storage: "=1Gi"
            }
        })
        yield new Pvc("nfs-ebooks", {
            $accessModes: "RWX",
            $volume: Public["PersistentVolume/nfs-ebooks"],
            $resources: {
                storage: "=1Gi"
            }
        })
    }
})
