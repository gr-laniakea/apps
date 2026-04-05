import { Images } from "@/_images"
import { ssdNodePublicIp } from "@/_ips"
import { getAppMeta } from "@/_meta/app-meta"
import namespaces from "@/_namespaces/namespaces"
import { userMinecraft } from "@/_users"
import { scTopolvm } from "@/externals"
import { getBackupMode, W } from "@/root"
import { Deployment, Pvc } from "k8ts"

const name = "minecraft"

export default W.File(`${name}.yaml`, {
    namespace: namespaces[`Namespace/${name}`],
    metadata: getAppMeta(name),
    *resources$() {
        const deploy = new Deployment(name, {
            $replicas: 1,
            $template: {
                *containers$(POD) {
                    yield POD.Container(name, {
                        $image: Images.minecraft,
                        $ports: {
                            "io-tcp": {
                                port: 25565,
                                protocol: "TCP",
                                hostIp: ssdNodePublicIp,
                                hostPort: 25565
                            },
                            "io-udp": {
                                port: 25565,
                                protocol: "UDP",
                                hostIp: ssdNodePublicIp,
                                hostPort: 25565
                            }
                        },
                        $resources: {
                            cpu: "200m -> 4000m",
                            memory: "1Gi -> 12Gi"
                        },
                        $env: {
                            ...userMinecraft.sameGroup().toDockerEnv(""),
                            EULA: "TRUE",
                            TYPE: "FABRIC",
                            VERSION: "1.20.1",
                            INIT_MEMORY: "1G",
                            MAX_MEMORY: "12G",
                            PACKWIZ_URL: "https://minecraft-pack.laniakea.boo/pack.toml",
                            DATAPACKS: "https://www.stardustlabs.net/s/Terralith_120_v240.zip"
                        },
                        $mounts: {
                            "/data": POD.Volume("var", {
                                $backend: new Pvc("minecraft-var", {
                                    $accessModes: "RWO",
                                    $storageClass: scTopolvm,
                                    $resources: {
                                        storage: "=35Gi"
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
    }
})
