import { Gateways } from "@/_externals/gateways"
import { Images } from "@/_images"
import { getAppMeta } from "@/_meta/app-meta"
import namespaces from "@/_namespaces/namespaces"
import { userMedia } from "@/_users"
import { scTopolvm } from "@/externals"
import { setBackupMode, W } from "@/root"
import { Deployment, HttpRoute, Pvc, Service } from "k8ts"

const name = "jellyseer"

export default W.File(`${name}.yaml`, {
    namespace: namespaces["Namespace/media"],
    meta: getAppMeta(name),
    *FILE() {
        const deploy = new Deployment(name, {
            replicas: 1,
            $template: {
                *$POD(POD) {
                    yield POD.Container(name, {
                        $image: Images.jellyseer,
                        $ports: {
                            web: "5055"
                        },
                        $resources: {
                            cpu: "400m -> 1000m",
                            memory: "1Gi -> 2Gi"
                        },
                        $env: {
                            ...userMedia.toDockerEnv()
                        },
                        $mounts: {
                            "/app/config": POD.Volume("var", {
                                $backend: new Pvc(`${name}-var`, {
                                    $accessModes: "RWO",
                                    $storageClass: scTopolvm,
                                    $storage: "=7Gi"
                                }).with(setBackupMode("pvc-main-schedule"))
                            }).Mount()
                        }
                    })
                }
            }
        })

        yield deploy

        const svc = new Service(name, {
            $backend: deploy,
            $ports: {
                web: 80
            },
            $frontend: {
                type: "ClusterIP"
            }
        })

        yield svc

        yield new HttpRoute(name, {
            $backend: svc.portRef("web"),
            $gateway: Gateways.laniakea,
            $hostname: "over.laniakea.boo"
        })

        yield new HttpRoute(`${name}-2`, {
            $backend: svc.portRef("web"),
            $gateway: Gateways.laniakea,
            $hostname: "seer.laniakea.boo"
        })
    }
})
