import { scheduleOnHdd } from "@/_hdd-node"
import { Images } from "@/_images"
import { ipRadarr } from "@/_ips"
import { getAppMeta } from "@/_meta/app-meta"
import namespaces from "@/_namespaces/namespaces"
import { userMedia } from "@/_users"
import { scTopolvm } from "@/externals"
import { setBackupMode, W } from "@/root"
import { Deployment, Pvc, Service } from "k8ts"
import media from "../media"

export default W.File("radarr.yaml", {
    namespace: namespaces["Namespace/media"],
    meta: getAppMeta("radarr"),
    *FILE() {
        const deploy = new Deployment("radarr", {
            replicas: 1,
            $template: {
                ...scheduleOnHdd,
                *$POD(POD) {
                    yield POD.Container("radarr", {
                        $image: Images.radarr,
                        $ports: {
                            web: 7878
                        },
                        $env: {
                            ...userMedia.toDockerEnv()
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
                                    $storage: "=10Gi"
                                }).with(setBackupMode("pvc-main-schedule"))
                            }).Mount(),
                            "/media": POD.Volume("media", {
                                $backend: media["PersistentVolumeClaim/media"]
                            }).Mount()
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
