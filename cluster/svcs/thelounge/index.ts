import { Gateways } from "@/_externals/gateways"
import { Images } from "@/_images"
import { getAppMeta } from "@/_meta/app-meta"
import namespaces from "@/_namespaces/namespaces"
import { userTheLounge } from "@/_users"
import { setBackupMode, topolvm, W } from "@/root"

export default W.Scope(namespaces["Namespace/thelounge"])
    .File("thelounge.yaml")
    .metadata(getAppMeta("thelounge"))
    .Resources(function* FILE(FILE) {
        const deploy = FILE.Deployment("thelounge", {
            replicas: 1
        })
            .Template({})
            .POD(function* POD(POD) {
                yield POD.Container("thelounge", {
                    $image: Images.thelounge,
                    $ports: {
                        web: 9000
                    },
                    $resources: {
                        cpu: "100m -> 500m",
                        memory: "500Mi -> 1Gi"
                    },
                    $env: {
                        ...userTheLounge.toDockerEnv()
                    },
                    $mounts: {
                        "/var/opt/thelounge": POD.Volume("var", {
                            $backend: FILE.Claim("thelounge-var", {
                                $accessModes: "RWO",
                                $storageClass: topolvm,
                                $storage: "=7Gi"
                            }).with(setBackupMode("pvc-main-schedule"))
                        }).Mount()
                    }
                })
            })

        const svc = FILE.Service("thelounge", {
            $backend: deploy,
            $ports: {
                web: 80
            },
            $frontend: {
                type: "ClusterIP"
            }
        })

        FILE.HttpRoute("thelounge", {
            $backend: svc.portRef("web"),
            $gateway: Gateways.laniakea,
            $hostname: "chat.laniakea.boo"
        })
    })
