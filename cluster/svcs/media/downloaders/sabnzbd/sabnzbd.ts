import { Gateways } from "@/_externals/gateways"
import { Images } from "@/_images"
import { getAppMeta } from "@/_meta/app-meta"
import namespaces from "@/_namespaces/namespaces"
import { userMedia } from "@/_users"
import { setBackupMode, topolvm, W } from "@/root"
import media from "../../media"
import { scheduleOnHdd } from "@/_hdd-node"
import { ipSabnzbd } from "@/_ips"
import { Deployment, Service, Pvc } from "k8ts"

export default W.File("sabnzbd.yaml", {
    namespace: namespaces["Namespace/media"],
    meta: getAppMeta("sabnzbd"),
    *FILE() {
        const deploy = new Deployment("sabnzbd", {
            replicas: 1,
            $template: {
                ...scheduleOnHdd,
                *$POD(POD) {
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
                                $backend: new Pvc("sabnzbd-var", {
                                    $accessModes: "RWO",
                                    $storageClass: topolvm,
                                    $storage: "=5Gi"
                                }).with(setBackupMode("pvc-main-schedule"))
                            }).Mount()
                        }
                    })
                }
            }
        })

        yield deploy

        const svc = new Service("sabnzbd", {
            $backend: deploy,
            $ports: {
                http: 80
            },
            $frontend: {
                type: "LoadBalancer",
                loadBalancerIP: ipSabnzbd
            }
        })

        yield svc
    }
})
