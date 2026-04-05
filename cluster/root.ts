import { K8sResource } from "@k8ts/instruments"
import { K8tsWorld } from "k8ts"
import { applyHooks } from "./fix-output"
export const W = K8tsWorld("laniakea")
applyHooks(W)

export type BackupMode = "pvc-main-schedule" | "pvc-hdd-schedule"
export function getBackupMode(mode: BackupMode) {
    return {
        "%backup-mode": mode
    } as const
}
export function setBackupMode(mode: BackupMode) {
    return <X extends K8sResource>(x: X) => {
        x.metadata.add(getBackupMode(mode))
    }
}
