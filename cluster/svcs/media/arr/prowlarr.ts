import { Images } from "@/_images"
import { ipProwlarr } from "@/_ips"
import { getAppMeta } from "@/_meta/app-meta"
import namespaces from "@/_namespaces/namespaces"
import { scheduleOnHdd } from "@/_hdd-node"
import { userMedia } from "@/_users"
import { setBackupMode, topolvm, W } from "@/root"

export default W.Scope(namespaces["Namespace/media"])
    .File("prowlarr.yaml")
    .metadata(getAppMeta("prowlarr"))
    .Resources(function* FILE(FILE) {
        const deploy = FILE.Deployment("prowlarr", {
            replicas: 1
        })
            .Template({
                // This should not run on the HDD node since it doesn't touch media directly
            })
            .POD(function* POD(POD) {
                yield POD.Container("prowlarr", {
                    $image: Images.prowlarr,
                    $ports: {
                        web: 9696
                    },
                    $env: {
                        ...userMedia.toDockerEnv()
                    },
                    $resources: {
                        cpu: "100m -> 200m",
                        memory: "100Mi -> 500Mi"
                    },
                    $mounts: {
                        "/config": POD.Volume("var", {
                            $backend: FILE.Claim("prowlarr-var", {
                                $accessModes: "RWO",
                                $storageClass: topolvm,
                                $storage: "=1Gi"
                            }).with(setBackupMode("pvc-main-schedule"))
                        }).Mount()
                    }
                })
            })

        FILE.Service("prowlarr", {
            $backend: deploy,
            $ports: {
                web: 80
            },
            $frontend: {
                type: "LoadBalancer",
                loadBalancerIP: ipProwlarr
            }
        })
    })
