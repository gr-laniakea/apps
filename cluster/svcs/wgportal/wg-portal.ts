import { Images } from "@/_images"
import { ipWgPortal } from "@/_ips"
import { getAppMeta } from "@/_meta/app-meta"
import namespaces from "@/_namespaces/namespaces"
import { scTopolvm } from "@/externals"
import { backupMode, W } from "@/root"
import { localRefFile } from "@k8ts/instruments"
import { ConfigMap, Deployment, Pvc, Secret } from "k8ts"

const name = "wg-portal"
const wgInterface = process.env.WG_INTERFACE_NAME || "wg0"

export default W.File(`${name}.yaml`, {
    namespace: namespaces[`Namespace/${name}`],
    metadata: getAppMeta(name),
    *resources$() {
        const secret = new Secret("wg-portal", {
            $noEmit: true,
            $data: {
                username: "gr",
                password: ""
            }
        })

        const config = new ConfigMap("wg-portal-config", {
            $data: {
                "config.yaml": localRefFile("./config.yaml").as("text")
            }
        })
        const deploy = new Deployment(name, {
            $replicas: 1,
            $template: {
                $manifest: {
                    hostNetwork: true
                },
                *containers$(POD) {
                    yield POD.Container(name, {
                        $image: Images.wgPortal,
                        $manifest: {
                            securityContext: {
                                privileged: true,
                                capabilities: {
                                    add: ["NET_ADMIN", "SYS_MODULE"]
                                }
                            }
                        },
                        $ports: {
                            web: {
                                port: 80,
                                protocol: "TCP",
                                hostIp: ipWgPortal
                            },
                            stats: {
                                port: 8080,
                                protocol: "TCP",
                                hostIp: ipWgPortal
                            }
                        },
                        $env: {
                            WG_DEVICES: wgInterface,
                            WG_CONFIG_PATH: "/etc/wireguard",
                            WG_STATS_ENABLED: "true",
                            WG_PORTAL_CORE_ADMIN_USER: {
                                $backend: secret,
                                key: "username"
                            },
                            WG_PORTAL_CORE_ADMIN_PASSWORD: {
                                $backend: secret,
                                key: "password"
                            },
                            WG_PORTAL_STATISTICS_LISTENING_ADDRESS: `${ipWgPortal}:8080`,
                            WG_PORTAL_WEB_LISTENING_ADDRESS: `${ipWgPortal}:80`
                        },
                        $resources: {
                            cpu: "50m -> 200m",
                            memory: "64Mi -> 256Mi"
                        },
                        $mounts: {
                            "/app/config/config.yaml": POD.Volume("config", {
                                $backend: config
                            }).Mount({
                                subPath: "config.yaml"
                            }),
                            "/app/data": POD.Volume("data", {
                                $backend: new Pvc(`${name}-data`, {
                                    $metadata: backupMode("pvc-main-schedule"),
                                    $accessModes: "RWO",
                                    $storageClass: scTopolvm,
                                    $resources: { storage: "=1Gi" }
                                })
                            }).Mount(),
                            "/etc/wireguard": POD.Volume("wg-config", {
                                $backend: {
                                    kind: "HostPath",
                                    path: "/etc/wireguard",
                                    type: "Directory"
                                }
                            }).Mount(),
                            "/dev/net/tun": POD.Volume("dev-net-tun", {
                                $backend: {
                                    kind: "HostPath",
                                    path: "/dev/net/tun",
                                    type: "CharDevice"
                                }
                            }).Mount()
                        }
                    })
                }
            }
        })

        yield deploy
    }
})
