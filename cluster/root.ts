import { Metadata } from "@k8ts/metadata"
import { K8tsWorld } from "k8ts"
import { applyHooks } from "./fix-output"
export const W = new K8tsWorld("laniakea")
applyHooks(W)

export type BackupMode = "pvc-main-schedule" | "pvc-hdd-schedule"
export function backupMode(mode: BackupMode) {
    return new Metadata({
        "%backup-mode": mode
    })
}
