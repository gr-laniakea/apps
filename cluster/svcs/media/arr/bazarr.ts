import { Gateways } from "@/_externals/gateways"
import { Images } from "@/_images"
import { getAppMeta } from "@/_meta/app-meta"
import namespaces from "@/_namespaces/namespaces"
import { userMedia } from "@/_users"
import { setBackupMode, topolvm, W } from "@/root"
import media from "../media"
import { scheduleOnHdd } from "@/_hdd-node"
import { ipBazarr } from "@/_ips"
import { Deployment, Service, Pvc } from "k8ts"

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
                                    $storageClass: topolvm,
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
