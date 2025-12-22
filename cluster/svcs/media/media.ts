import namespaces from "@/_namespaces/namespaces"
import { Public } from "@/_storage"
import { W } from "@/root"
import { Pvc } from "k8ts"

export default W.File("media-pvc.yaml", {
    namespace: namespaces["Namespace/media"],
    meta: {},
    *FILE() {
        yield new Pvc("media", {
            $accessModes: "RWO",
            $bind: Public["PersistentVolume/media"],
            $storage: "=1Gi"
        })
        yield new Pvc("nfs-media", {
            $accessModes: "ROX",
            $bind: Public["PersistentVolume/nfs-media"],
            $storage: "=1Gi"
        })
    }
})
