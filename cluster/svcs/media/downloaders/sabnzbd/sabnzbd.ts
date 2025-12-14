import { Gateways } from "@/_externals/gateways"
import { Images } from "@/_images"
import { getAppMeta } from "@/_meta/app-meta"
import namespaces from "@/_namespaces/namespaces"
import { userMedia } from "@/_users"
import { setBackupMode, topolvm, W } from "@/root"
import media from "../../media"
import { scheduleOnHdd } from "@/_hdd-node"
import { ipSabnzbd } from "@/_ips"

export default W.Scope(namespaces["Namespace/media"])
    .File("sabnzbd.yaml")
    .metadata(getAppMeta("sabnzbd"))
    .Resources(function* FILE(FILE) {
        const deploy = FILE.Deployment("sabnzbd", {
            replicas: 1
        })
            .Template({ ...scheduleOnHdd })
            .POD(function* POD(POD) {
                yield POD.Container("sabnzbd", {
                    $image: Images.sabnzbd,
                    $ports: {
                        http: 8080
                    },
                    $env: {
                        ...userMedia.toDockerEnv()
                    },
                    $resources: {
                        cpu: "500m -> 2000m",
                        memory: "2Gi -> 4Gi"
                    },
                    $mounts: {
                        "/media": POD.Volume("downs", {
                            $backend: media["PersistentVolumeClaim/media"]
                        }).Mount(),
                        "/config": POD.Volume("var", {
                            $backend: FILE.Claim("sabnzbd-var", {
                                $accessModes: "RWO",
                                $storageClass: topolvm,
                                $storage: "=5Gi"
                            }).with(setBackupMode("pvc-main-schedule"))
                        }).Mount()
                    }
                })
            })

        const svc = FILE.Service("sabnzbd", {
            $backend: deploy,
            $ports: {
                http: 80
            },
            $frontend: {
                type: "LoadBalancer",
                loadBalancerIP: ipSabnzbd
            }
        })
    })
