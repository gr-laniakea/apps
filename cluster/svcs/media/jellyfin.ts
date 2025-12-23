import { Gateways } from "@/_externals/gateways"
import { Images } from "@/_images"
import { getAppMeta } from "@/_meta/app-meta"
import namespaces from "@/_namespaces/namespaces"
import { userMedia } from "@/_users"
import { scTopolvm } from "@/externals"
import { setBackupMode, W } from "@/root"
import { Deployment, HttpRoute, Pvc, Service } from "k8ts"
import Media from "./media"

export default W.File("jellyfin.yaml", {
    namespace: namespaces["Namespace/media"],
    meta: getAppMeta("jellyfin"),
    *FILE() {
        const deploy = new Deployment("jellyfin", {
            replicas: 1,
            $template: {
                securityContext: {
                    supplementalGroups: [105, 44]
                },
                *$POD(POD) {
                    yield POD.Container("jellyfin", {
                        $image: Images.jellyfin,
                        $ports: {
                            web: "8096"
                        },
                        securityContext: {},
                        $resources: {
                            cpu: "100m -> 6000m",
                            memory: "1Gi -> 12Gi",
                            "gpu.intel.com/i915": "=1"
                        },
                        $env: {
                            ...userMedia.toDockerEnv()
                        },

                        $mounts: {
                            "/config": POD.Volume("var", {
                                $backend: new Pvc("jellyfin-var", {
                                    $accessModes: "RWO",
                                    $storageClass: scTopolvm,
                                    $storage: "=25Gi"
                                }).with(setBackupMode("pvc-main-schedule"))
                            }).Mount(),
                            "/media": POD.Volume("media", {
                                $backend: Media["PersistentVolumeClaim/nfs-media"]
                            }).Mount({
                                readOnly: true
                            })
                        }
                    })
                }
            }
        })

        yield deploy

        const svc = new Service("jellyfin", {
            $backend: deploy,
            $ports: {
                web: 80
            },
            $frontend: {
                type: "ClusterIP"
            }
        })

        yield svc

        yield new HttpRoute("jellyfin", {
            $backend: svc.portRef("web"),
            $gateway: Gateways.laniakea,
            $hostname: "see.laniakea.boo"
        })
    }
})
