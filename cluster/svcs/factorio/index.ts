import { Images } from "@/_images"
import { hddNodePublicIp, ssdNodePublicIp } from "@/_ips"
import { getAppMeta } from "@/_meta/app-meta"
import namespaces from "@/_namespaces/namespaces"
import { userFactorio } from "@/_users"
import { setBackupMode, topolvm, W } from "@/root"
import { Deployment, Pvc } from "k8ts"

const name = "factorio"

export default W.File(`${name}.yaml`, {
    namespace: namespaces[`Namespace/${name}`],
    meta: getAppMeta(name),
    *FILE() {
        const deploy = new Deployment(name, {
            replicas: 1,
            $template: {
                *$POD(POD) {
                    const vol = POD.Volume("var", {
                        $backend: new Pvc(`${name}-var`, {
                            $accessModes: "RWO",
                            $storageClass: topolvm,
                            $storage: "=25Gi"
                        }).with(setBackupMode("pvc-main-schedule"))
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
                            ...userFactorio.toDockerEnv()
                        },
                        $resources: {
                            cpu: "100m -> 3000m",
                            memory: "2Gi -> 8Gi"
                        },
                        $mounts: {
                            "/factorio": vol.Mount()
                        }
                    })
                }
            }
        })

        yield deploy
    }
})
