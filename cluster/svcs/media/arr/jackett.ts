import { Images } from "@/_images"
import { ipJackett } from "@/_ips"
import { getAppMeta } from "@/_meta/app-meta"
import namespaces from "@/_namespaces/namespaces"
import { userMedia } from "@/_users"
import { scTopolvm } from "@/externals"
import { getBackupMode, W } from "@/root"
import { Deployment, Pvc, Service } from "k8ts"

export default W.File("jackett.yaml", {
    namespace: namespaces["Namespace/media"],
    metadata: getAppMeta("jackett"),
    *resources$() {
        const deploy = new Deployment("jackett", {
            $replicas: 1,
            $template: {
                // This should not run on the HDD node since it doesn't touch media directly
                *containers$(POD) {
                    yield POD.Container("jackett", {
                        $image: Images.jackett,
                        $ports: {
                            web: 9117
                        },
                        $env: {
                            ...userMedia.sameGroup().toDockerEnv()
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
                                    $resources: {
                                        storage: "=1Gi"
                                    },
                                    $metadata: getBackupMode("pvc-main-schedule")
                                })
                            }).mount()
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
