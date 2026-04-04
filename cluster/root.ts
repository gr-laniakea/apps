import { Rsc_Top } from "@k8ts/instruments"
import { World } from "k8ts"
import { applyHooks } from "./fix-output"
export const W = new World("laniakea")
applyHooks(W)

export type BackupMode = "pvc-main-schedule" | "pvc-hdd-schedule"
export function getBackupMode(mode: BackupMode) {
    return {
        "%backup-mode": mode
    } as const
}
export function setBackupMode(mode: BackupMode) {
    return <X extends Rsc_Top>(x: X) => {
        x.meta.add(getBackupMode(mode))
    }
}
