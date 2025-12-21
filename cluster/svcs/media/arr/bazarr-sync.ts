import { Gateways } from "@/_externals/gateways"
import { Images } from "@/_images"
import { getAppMeta } from "@/_meta/app-meta"
import namespaces from "@/_namespaces/namespaces"
import { userMedia } from "@/_users"
import { setBackupMode, topolvm, W } from "@/root"
import media from "../media"
import { scheduleOnHdd } from "@/_hdd-node"
import { ipBazarr } from "@/_ips"

export default W.Scope(namespaces["Namespace/media"])
    .File("bazarr.yaml")
    .metadata(getAppMeta("bazarr"))
    .Resources(function* FILE(FILE) {
        const deploy = FILE.Deployment("bazarr", {
            replicas: 1
        })
            .Template({
                ...scheduleOnHdd
            })
            .POD(function* POD(POD) {
                yield POD.Container("bazarr", {
                    $image: Images.bazarr,
                    $ports: {
                        web: 6767
                    },
                    $resources: {
                        cpu: "100m -> 2000m",
                        memory: "1Gi -> 8Gi"
                    },
                    $env: {
                        ...userMedia.toDockerEnv()
                    },
                    $mounts: {
                        "/config": POD.Volume("var", {
                            $backend: FILE.Claim("bazarr-var", {
                                $accessModes: "RWO",
                                $storageClass: topolvm,
                                $storage: "=3Gi"
                            }).with(setBackupMode("pvc-main-schedule"))
                        }).Mount(),
                        "/media": POD.Volume("media", {
                            $backend: media["PersistentVolumeClaim/media"]
                        }).Mount()
                    }
                })
            })

        const svc = FILE.Service("bazarr", {
            $backend: deploy,
            $ports: {
                web: 80
            },
            $frontend: {
                type: "LoadBalancer",
                loadBalancerIP: ipBazarr
            }
        })
    })
