import { Gateways } from "@/_externals/gateways"
import { Images } from "@/_images"
import { getAppMeta } from "@/_meta/app-meta"
import namespaces from "@/_namespaces/namespaces"
import { userMedia } from "@/_users"
import { setBackupMode, topolvm, W } from "@/root"
import Media from "../media"
import { scheduleOnHdd } from "@/_hdd-node"
import { ipSonarr } from "@/_ips"
export default W.Scope(namespaces["Namespace/media"])
    .File("sonarr.yaml")
    .metadata(getAppMeta("sonarr"))
    .Resources(function* FILE(FILE) {
        const deploy = FILE.Deployment("sonarr", {
            replicas: 1
        })
            .Template({ ...scheduleOnHdd })
            .POD(function* POD(POD) {
                yield POD.Container("sonarr", {
                    $image: Images.sonarr,
                    $ports: {
                        web: 8989
                    },
                    $env: {
                        ...userMedia.toDockerEnv()
                    },
                    $resources: {
                        cpu: "100m -> 500m",
                        memory: "500Mi -> 1Gi"
                    },
                    $mounts: {
                        "/config": POD.Volume("var", {
                            $backend: FILE.Claim("sonarr-var", {
                                $accessModes: "RWO",
                                $storageClass: topolvm,
                                $storage: "=10Gi"
                            }).with(setBackupMode("pvc-main-schedule"))
                        }).Mount(),
                        "/media": POD.Volume("media", {
                            $backend: Media["PersistentVolumeClaim/media"]
                        }).Mount()
                    }
                })
            })

        const svc = FILE.Service("sonarr", {
            $backend: deploy,
            $ports: {
                web: 80
            },
            $frontend: {
                type: "LoadBalancer",
                loadBalancerIP: ipSonarr
            }
        })
    })
