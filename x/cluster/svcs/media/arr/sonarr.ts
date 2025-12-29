import { scheduleOnHdd } from "@/_hdd-node"
import { Images } from "@/_images"
import { ipSonarr } from "@/_ips"
import { getAppMeta } from "@/_meta/app-meta"
import namespaces from "@/_namespaces/namespaces"
import { userMedia } from "@/_users"
import { scTopolvm } from "@/externals"
import { setBackupMode, W } from "@/root"
import { Deployment, Pvc, Service } from "k8ts"
import Media from "../media"

export default W.File("sonarr.yaml", {
    namespace: namespaces["Namespace/media"],
    meta: getAppMeta("sonarr"),
    *FILE() {
        const deploy = new Deployment("sonarr", {
            replicas: 1,
            $template: {
                ...scheduleOnHdd,
                *$POD(POD) {
                    yield POD.Container("sonarr", {
                        $image: Images.sonarr,
                        $ports: {
                            web: 8989
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
                                $backend: new Pvc("sonarr-var", {
                                    $accessModes: "RWO",
                                    $storageClass: scTopolvm,
                                    $storage: "=10Gi"
                                }).with(setBackupMode("pvc-hdd-schedule"))
                            }).Mount(),
                            "/media": POD.Volume("media", {
                                $backend: Media["PersistentVolumeClaim/media"]
                            }).Mount()
                        }
                    })
                }
            }
        })

        yield deploy

        const svc = new Service("sonarr", {
            $backend: deploy,
            $ports: {
                web: 80
            },
            $frontend: {
                type: "LoadBalancer",
                loadBalancerIP: ipSonarr
            }
        })

        yield svc
    }
})
