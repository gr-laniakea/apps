import { scheduleOnHdd } from "@/_hdd-node"
import { Images } from "@/_images"
import { ipRadarr } from "@/_ips"
import { getAppMeta } from "@/_meta/app-meta"
import namespaces from "@/_namespaces/namespaces"
import { scTopolvm } from "@/externals"
import { getBackupMode, W } from "@/root"
import { Deployment, Pvc, Service } from "k8ts"
import media from "../media"
import { userMedia } from "@/_users"

export default W.File("radarr.yaml", {
    namespace: namespaces["Namespace/media"],
    metadata: getAppMeta("radarr"),
    *resources$() {
        const deploy = new Deployment("radarr", {
            $replicas: 1,
            $template: {
                ...scheduleOnHdd,
                *containers$(POD) {
                    yield POD.Container("radarr", {
                        $image: Images.radarr,
                        $ports: {
                            web: 7878
                        },
                        $env: {
                            ...userMedia.sameGroup().toDockerEnv()
                        },
                        $resources: {
                            cpu: "300m -> 1000m",
                            memory: "2Gi -> 3Gi"
                        },
                        $mounts: {
                            "/config": POD.Volume("var", {
                                $backend: new Pvc("radarr-var", {
                                    $accessModes: "RWO",
                                    $storageClass: scTopolvm,
                                    $resources: {
                                        storage: "=10Gi"
                                    },
                                    $metadata: getBackupMode("pvc-hdd-schedule")
                                })
                            }).mount(),
                            "/media": POD.Volume("media", {
                                $backend: media["PersistentVolumeClaim/media"]
                            }).mount()
                        }
                    })
                }
            }
        })

        yield deploy

        const svc = new Service("radarr", {
            $backend: deploy,
            $ports: {
                web: 80
            },
            $frontend: {
                type: "LoadBalancer",
                loadBalancerIP: ipRadarr
            }
        })

        yield svc
    }
})
