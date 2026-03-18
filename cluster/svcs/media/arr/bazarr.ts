import { scheduleOnHdd } from "@/_hdd-node"
import { Images } from "@/_images"
import { ipBazarr } from "@/_ips"
import { getAppMeta } from "@/_meta/app-meta"
import namespaces from "@/_namespaces/namespaces"
import { userMedia } from "@/_users"
import { scTopolvm } from "@/externals"
import { backupMode, W } from "@/root"
import { Deployment, Pvc, Service } from "k8ts"
import media from "../media"

export default W.File("bazarr.yaml", {
    namespace: namespaces["Namespace/media"],
    metadata: getAppMeta("bazarr"),
    *resources$() {
        const deploy = new Deployment("bazarr", {
            $replicas: 1,
            $template: {
                $manifest: scheduleOnHdd,
                *containers$(POD) {
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
                                $backend: new Pvc("bazarr-var", {
                                    $metadata: backupMode("pvc-hdd-schedule"),
                                    $accessModes: "RWO",
                                    $storageClass: scTopolvm,
                                    $resources: {
                                        storage: "=3Gi"
                                    }
                                })
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

        const svc = new Service("bazarr", {
            $backend: deploy,
            $ports: {
                web: 80
            },
            $frontend: {
                type: "LoadBalancer",
                loadBalancerIP: ipBazarr
            }
        })

        yield svc
    }
})
