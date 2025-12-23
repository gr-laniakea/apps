import { Images } from "@/_images"
import { ipProwlarr } from "@/_ips"
import { getAppMeta } from "@/_meta/app-meta"
import namespaces from "@/_namespaces/namespaces"
import { userMedia } from "@/_users"
import { scTopolvm } from "@/externals"
import { setBackupMode, W } from "@/root"
import { Deployment, Pvc, Service } from "k8ts"

export default W.File("prowlarr.yaml", {
    namespace: namespaces["Namespace/media"],
    meta: getAppMeta("prowlarr"),
    *FILE() {
        const deploy = new Deployment("prowlarr", {
            replicas: 1,
            $template: {
                // This should not run on the HDD node since it doesn't touch media directly
                *$POD(POD) {
                    yield POD.Container("prowlarr", {
                        $image: Images.prowlarr,
                        $ports: {
                            web: 9696
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
                                $backend: new Pvc("prowlarr-var", {
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

        const svc = new Service("prowlarr", {
            $backend: deploy,
            $ports: {
                web: 80
            },
            $frontend: {
                type: "LoadBalancer",
                loadBalancerIP: ipProwlarr
            }
        })

        yield svc
    }
})
