import { Gateways } from "@/_externals/gateways"
import { Images } from "@/_images"
import { getAppMeta } from "@/_meta/app-meta"
import namespaces from "@/_namespaces/namespaces"
import { userTheLounge } from "@/_users"
import { scTopolvm } from "@/externals"
import { getBackupMode, W } from "@/root"
import { Deployment, HttpRoute, Pvc, Service } from "k8ts"

export default W.File("thelounge.yaml", {
    namespace: namespaces["Namespace/thelounge"],
    metadata: getAppMeta("thelounge"),
    *resources$() {
        const deploy = new Deployment("thelounge", {
            $replicas: 1,
            $template: {
                *containers$(POD) {
                    yield POD.Container("thelounge", {
                        $image: Images.thelounge,
                        $ports: {
                            web: 9000
                        },
                        $resources: {
                            cpu: "300m -> 500m",
                            memory: "1Gi -> 2Gi"
                        },
                        $env: {
                            ...userTheLounge.sameGroup().toDockerEnv()
                        },
                        $mounts: {
                            "/var/opt/thelounge": POD.Volume("var", {
                                $backend: new Pvc("thelounge-var", {
                                    $accessModes: "RWO",
                                    $storageClass: scTopolvm,
                                    $resources: {
                                        storage: "=7Gi"
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

        const svc = new Service("thelounge", {
            $backend: deploy,
            $ports: {
                web: 80
            },
            $frontend: {
                type: "ClusterIP"
            }
        })

        yield svc

        yield new HttpRoute("thelounge", {
            $backend: svc.portRef("web"),
            $gateway: Gateways.laniakea,
            $hostname: "chat.laniakea.boo"
        })
    }
})
