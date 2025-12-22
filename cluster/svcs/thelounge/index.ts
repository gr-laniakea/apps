import { Gateways } from "@/_externals/gateways"
import { Images } from "@/_images"
import { getAppMeta } from "@/_meta/app-meta"
import namespaces from "@/_namespaces/namespaces"
import { userTheLounge } from "@/_users"
import { setBackupMode, topolvm, W } from "@/root"
import { Deployment, Service, HttpRoute, Pvc } from "k8ts"

export default W.File("thelounge.yaml", {
    namespace: namespaces["Namespace/thelounge"],
    meta: getAppMeta("thelounge"),
    *FILE() {
        const deploy = new Deployment("thelounge", {
            replicas: 1,
            $template: {
                *$POD(POD) {
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
                            ...userTheLounge.toDockerEnv()
                        },
                        $mounts: {
                            "/var/opt/thelounge": POD.Volume("var", {
                                $backend: new Pvc("thelounge-var", {
                                    $accessModes: "RWO",
                                    $storageClass: topolvm,
                                    $storage: "=7Gi"
                                }).with(setBackupMode("pvc-main-schedule"))
                            }).Mount()
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
