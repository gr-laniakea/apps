import namespaces from "@/_namespaces/namespaces"
import { Public } from "@/_storage"
import { W } from "@/root"

export default W.Scope(namespaces["Namespace/media"])
    .File("media-pvc.yaml")
    .Resources(function* FILE(FILE) {
        yield FILE.Claim("media", {
            $accessModes: "RWO",
            $bind: Public["PersistentVolume/media"],
            $storage: "=1Gi"
        })
        yield FILE.Claim("nfs-media", {
            $accessModes: "ROX",
            $bind: Public["PersistentVolume/nfs-media"],
            $storage: "=1Gi"
        })
    })
