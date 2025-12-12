import { Gateways } from "@/_externals/gateways"
import { Images } from "@/_images"
import { getAppMeta } from "@/_meta/app-meta"
import namespaces from "@/_namespaces/namespaces"
import { userMedia } from "@/_users"
import { setBackupMode, topolvm, W } from "@/root"
import Media from "./media"
const name = "jellyseer"
export default W.Scope(namespaces["Namespace/media"])
    .File(`${name}.yaml`)
    .metadata(getAppMeta(name))
    .Resources(function* FILE(FILE) {
        const deploy = FILE.Deployment(name, {
            replicas: 1
        })
            .Template({})
            .POD(function* POD(POD) {
                yield POD.Container(name, {
                    $image: Images.jellyseer,
                    $ports: {
                        web: "5055"
                    },
                    $resources: {
                        cpu: "100m -> 400m",
                        memory: "100Mi -> 1Gi"
                    },
                    $env: {
                        ...userMedia.toDockerEnv()
                    },
                    $mounts: {
                        "/app/config": POD.Volume("var", {
                            $backend: FILE.Claim(`${name}-var`, {
                                $accessModes: "RWO",
                                $storageClass: topolvm,
                                $storage: "=7Gi"
                            }).with(setBackupMode("pvc-main-schedule"))
                        }).Mount()
                    }
                })
            })

        const svc = FILE.Service(name, {
            $backend: deploy,
            $ports: {
                web: 80
            },
            $frontend: {
                type: "ClusterIP"
            }
        })

        FILE.HttpRoute(name, {
            $backend: svc.portRef("web"),
            $gateway: Gateways.laniakea,
            $hostname: "over.laniakea.boo"
        })
    })
