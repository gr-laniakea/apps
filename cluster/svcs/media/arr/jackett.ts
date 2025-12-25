import { Images } from "@/_images"
import { ipJackett } from "@/_ips"
import { getAppMeta } from "@/_meta/app-meta"
import namespaces from "@/_namespaces/namespaces"
import { userMedia } from "@/_users"
import { scTopolvm } from "@/externals"
import { setBackupMode, W } from "@/root"
import { Deployment, Pvc, Service } from "k8ts"

export default W.File("jackett.yaml", {
    namespace: namespaces["Namespace/media"],
    meta: getAppMeta("jackett"),
    *FILE() {
        const deploy = new Deployment("jackett", {
            replicas: 1,
            $template: {
                // This should not run on the HDD node since it doesn't touch media directly
                *$POD(POD) {
                    yield POD.Container("jackett", {
                        $image: Images.jackett,
                        $ports: {
                            web: 9117
                        },
                        $env: {
                            ...userMedia.toDockerEnv()
                        },
                        $resources: {
                            cpu: "300m -> 500m",
                            memory: "500Mi -> 1000Mi"
                        },
                        $mounts: {
                            "/config": POD.Volume("var", {
                                $backend: new Pvc("jackett-var", {
                                    $accessModes: "RWO",
                                    $storageClass: scTopolvm,
                                    $storage: "=1Gi"
                                }).with(setBackupMode("pvc-main-schedule"))
                            }).Mount()
                        }
                    })
                }
            }
        })

        yield deploy

        const svc = new Service("jackett", {
            $backend: deploy,
            $ports: {
                web: 80
            },
            $frontend: {
                type: "LoadBalancer",
                loadBalancerIP: ipJackett
            }
        })

        yield svc
    }
})
