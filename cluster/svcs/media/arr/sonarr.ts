import { Gateways } from "@/_externals/gateways"
import { Images } from "@/_images"
import { getAppMeta } from "@/_meta/app-meta"
import namespaces from "@/_namespaces/namespaces"
import { userMedia } from "@/_users"
import { setBackupMode, topolvm, W } from "@/root"
import Media from "../media"
import { scheduleOnHdd } from "@/_hdd-node"
import { ipSonarr } from "@/_ips"
import { Deployment, Service, Pvc } from "k8ts"

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
                                    $storageClass: topolvm,
                                    $storage: "=10Gi"
                                }).with(setBackupMode("pvc-main-schedule"))
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
