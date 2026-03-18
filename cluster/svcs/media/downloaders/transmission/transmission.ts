import { scheduleOnHdd } from "@/_hdd-node"
import { Images } from "@/_images"
import { hddNodePublicIp, ipTransmission } from "@/_ips"
import { getAppMeta } from "@/_meta/app-meta"
import namespaces from "@/_namespaces/namespaces"
import { userMedia } from "@/_users"
import { scTopolvm } from "@/externals"
import { backupMode, W } from "@/root"
import { Deployment, Pvc, Service } from "k8ts"
import Media from "../../media"

export default W.File("transmission.yaml", {
    namespace: namespaces["Namespace/media"],
    metadata: getAppMeta("transmission"),
    *resources$() {
        const deploy = new Deployment("transmission", {
            $replicas: 1,
            $template: {
                $manifest: scheduleOnHdd,
                *containers$(POD) {
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
                                $backend: new Pvc("transmission-var", {
                                    $metadata: backupMode("pvc-hdd-schedule"),
                                    $accessModes: "RWO",
                                    $storageClass: scTopolvm,
                                    $resources: {
                                        storage: "=5Gi"
                                    }
                                })
                            }).Mount()
                        }
                    })
                }
            }
        })

        yield deploy

        const webUiSvc = new Service("transmission", {
            $backend: deploy,
            $ports: {
                http: 80
            },
            $frontend: {
                type: "LoadBalancer",
                loadBalancerIP: ipTransmission
            }
        })

        yield webUiSvc
    }
})
