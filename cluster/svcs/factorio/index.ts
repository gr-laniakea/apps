import { Images } from "@/_images"
import { ssdNodePublicIp } from "@/_ips"
import { getAppMeta } from "@/_meta/app-meta"
import namespaces from "@/_namespaces/namespaces"
import { userFactorio } from "@/_users"
import { scTopolvm } from "@/externals"
import { getBackupMode, W } from "@/root"
import { Deployment, Pvc } from "k8ts"

const name = "factorio"

export default W.File(`${name}.yaml`, {
    namespace: namespaces[`Namespace/${name}`],
    metadata: getAppMeta(name),
    *resources$() {
        const deploy = new Deployment(name, {
            $replicas: 1,
            $template: {
                *containers$(POD) {
                    const vol = POD.Volume("var", {
                        $backend: new Pvc(`${name}-var`, {
                            $accessModes: "RWO",
                            $storageClass: scTopolvm,
                            $resources: {
                                storage: "=25Gi"
                            },
                            $metadata: getBackupMode("pvc-main-schedule")
                        })
                    })
                    yield POD.Container(name, {
                        $image: Images.factorio,
                        $ports: {
                            udp: {
                                port: 34197,
                                protocol: "UDP",
                                hostIp: ssdNodePublicIp,
                                hostPort: 34197
                            }
                        },
                        $env: {
                            ...userFactorio.sameGroup().toDockerEnv()
                        },
                        $resources: {
                            cpu: "100m -> 3000m",
                            memory: "2Gi -> 8Gi"
                        },
                        $mounts: {
                            "/factorio": vol.mount()
                        }
                    })
                }
            }
        })

        yield deploy
    }
})
