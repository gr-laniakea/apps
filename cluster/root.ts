import { Deployment, K8ts, Pvc, Service, type CDK } from "k8ts"
import { Resource_Top } from "@k8ts/instruments"
import { storage } from "k8ts/kinds"
import { applyHooks } from "./fix-output"
export const W = K8ts()
applyHooks(W)
export const topolvm = W.External(storage.v1.StorageClass._, "topolvm")

export type BackupMode = "pvc-main-schedule" | "pvc-data-schedule"
export function setBackupMode(mode: BackupMode) {
    return <X extends Resource_Top>(x: X) => {
        x.meta.add({
            "%backup-mode": mode
        })
    }
}
