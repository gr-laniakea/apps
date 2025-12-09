import { ManifestResource, World } from "k8ts"
import { api } from "k8ts/kinds"
export const W = World.make({
    name: "laniakea"
})
export const topolvm = W.External(api.storage_.v1_.StorageClass, "topolvm")

export type BackupMode = "pvc-main-schedule" | "pvc-data-schedule"
export function setBackupMode(mode: BackupMode) {
    return <X extends ManifestResource>(x: X) => {
        x.meta.add({
            "%backup-mode": mode
        })
    }
}
