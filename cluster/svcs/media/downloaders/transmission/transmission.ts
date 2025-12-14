import { Gateways } from "@/_externals/gateways"
import { Images } from "@/_images"
import { hddNodePublicIp, ipTransmission } from "@/_ips"
import { getAppMeta } from "@/_meta/app-meta"
import namespaces from "@/_namespaces/namespaces"
import { userMedia } from "@/_users"
import { setBackupMode, topolvm, W } from "@/root"
import Media from "../../media"
import { scheduleOnHdd } from "@/_hdd-node"
export default W.Scope(namespaces["Namespace/media"])
    .File("transmission.yaml")
    .metadata(getAppMeta("transmission"))
    .Resources(function* FILE(FILE) {
        const deploy = FILE.Deployment("transmission", {
            replicas: 1
        })
            .Template({ ...scheduleOnHdd })
            .POD(function* POD(POD) {
                yield POD.Container("transmission", {
                    $image: Images.transmission,
                    $ports: {
                        http: 9091,
                        "io-tcp": {
                            port: 51413,
                            protocol: "TCP",
                            hostIp: hddNodePublicIp,
                            hostPort: 51413
                        },
                        "io-udp": {
                            port: 51413,
                            protocol: "UDP",
                            hostIp: hddNodePublicIp,
                            hostPort: 51413
                        }
                    },
                    $env: {
                        ...userMedia.toDockerEnv()
                    },
                    $resources: {
                        cpu: "500m -> 1000m",
                        memory: "2Gi -> 3Gi"
                    },
                    $mounts: {
                        "/media": POD.Volume("media", {
                            $backend: Media["PersistentVolumeClaim/media"]
                        }).Mount(),
                        "/config": POD.Volume("var", {
                            $backend: FILE.Claim("transmission-var", {
                                $accessModes: "RWO",
                                $storageClass: topolvm,
                                $storage: "=5Gi"
                            }).with(setBackupMode("pvc-main-schedule"))
                        }).Mount()
                    }
                })
            })
        const webUiSvc = FILE.Service("transmission", {
            $backend: deploy,
            $ports: {
                http: 80
            },
            $frontend: {
                type: "LoadBalancer",
                loadBalancerIP: ipTransmission
            }
        })
    })
