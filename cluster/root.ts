import { Resource_Top } from "@k8ts/instruments"
import { World } from "k8ts"
import { applyHooks } from "./fix-output"
export const W = new World("laniakea")
applyHooks(W)

export type BackupMode = "pvc-main-schedule" | "pvc-data-schedule"
export function setBackupMode(mode: BackupMode) {
    return <X extends Resource_Top>(x: X) => {
        x.meta.add({
            "%backup-mode": mode
        })
    }
}
