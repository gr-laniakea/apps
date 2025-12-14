import { Gateways } from "@/_externals/gateways"
import { Images } from "@/_images"
import { getAppMeta } from "@/_meta/app-meta"
import namespaces from "@/_namespaces/namespaces"
import { userMedia } from "@/_users"
import { setBackupMode, topolvm, W } from "@/root"
import Media from "./media"
export default W.Scope(namespaces["Namespace/media"])
    .File("jellyfin.yaml")
    .metadata(getAppMeta("jellyfin"))
    .Resources(function* FILE(FILE) {
        const deploy = FILE.Deployment("jellyfin", {
            replicas: 1
        })
            .Template({
                securityContext: {
                    supplementalGroups: [105, 44]
                }
            })
            .POD(function* POD(POD) {
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
                            $backend: FILE.Claim("jellyfin-var", {
                                $accessModes: "RWO",
                                $storageClass: topolvm,
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
            })

        const svc = FILE.Service("jellyfin", {
            $backend: deploy,
            $ports: {
                web: 80
            },
            $frontend: {
                type: "ClusterIP"
            }
        })

        FILE.HttpRoute("jellyfin", {
            $backend: svc.portRef("web"),
            $gateway: Gateways.laniakea,
            $hostname: "see.laniakea.boo"
        })
    })
