import { Images } from "@/_images"
import { hddNodePublicIp, ssdNodePublicIp } from "@/_ips"
import { getAppMeta } from "@/_meta/app-meta"
import namespaces from "@/_namespaces/namespaces"
import { userFactorio } from "@/_users"
import { setBackupMode, topolvm, W } from "@/root"
const name = "factorio"
export default W.Scope(namespaces[`Namespace/${name}`])
    .File(`${name}.yaml`)
    .metadata(getAppMeta(name))
    .Resources(function* FILE(FILE) {
        const deploy = FILE.Deployment(name, {
            replicas: 1
        })
            .Template({})
            .POD(function* POD(POD) {
                const vol = POD.Volume("var", {
                    $backend: FILE.Claim(`${name}-var`, {
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
                        cpu: "100m -> 2000m",
                        memory: "500Mi -> 4Gi"
                    },
                    $mounts: {
                        "/factorio": vol.Mount()
                    }
                })
            })
    })
