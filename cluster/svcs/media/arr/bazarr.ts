import { scheduleOnHdd } from "@/_hdd-node"
import { Images } from "@/_images"
import { ipBazarr } from "@/_ips"
import { getAppMeta } from "@/_meta/app-meta"
import namespaces from "@/_namespaces/namespaces"
import { userMedia } from "@/_users"
import { scTopolvm } from "@/externals"
import { setBackupMode, W } from "@/root"
import { Deployment, Pvc, Service } from "k8ts"
import media from "../media"

export default W.File("bazarr.yaml", {
    namespace: namespaces["Namespace/media"],
    meta: getAppMeta("bazarr"),
    *FILE() {
        const deploy = new Deployment("bazarr", {
            replicas: 1,
            $template: {
                ...scheduleOnHdd,
                *$POD(POD) {
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
                                    $accessModes: "RWO",
                                    $storageClass: scTopolvm,
                                    $storage: "=3Gi"
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
