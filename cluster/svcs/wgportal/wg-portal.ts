import { Images } from "@/_images"
import { ipWgPortal } from "@/_ips"
import { getAppMeta } from "@/_meta/app-meta"
import namespaces from "@/_namespaces/namespaces"
import { userWgPortal } from "@/_users"
import { scTopolvm } from "@/externals"
import { setBackupMode, W } from "@/root"
import { Deployment, Pvc, Service } from "k8ts"

const name = "wg-portal"
const wgInterface = process.env.WG_INTERFACE_NAME || "wg0"

export default W.File(`${name}.yaml`, {
    namespace: namespaces[`Namespace/${name}`],
    meta: getAppMeta(name),
    *FILE() {
        const deploy = new Deployment(name, {
            replicas: 1,
            $template: {
                hostNetwork: true,
                *$POD(POD) {
                    yield POD.Container(name, {
                        $image: Images.wgPortal,
                        securityContext: {
                            privileged: true,
                            capabilities: {
                                add: ["NET_ADMIN", "SYS_MODULE"]
                            }
                        },
                        $ports: {
                            web: {
                                port: 80,
                                protocol: "TCP",
                                hostIp: ipWgPortal
                            }
                        },
                        $env: {
                            ...userWgPortal.toDockerEnv(),
                            WG_DEVICES: wgInterface,
                            WG_CONFIG_PATH: "/etc/wireguard",
                            WG_STATS_ENABLED: "true"
                        },
                        $resources: {
                            cpu: "50m -> 200m",
                            memory: "64Mi -> 256Mi"
                        },
                        $mounts: {
                            "/app/data": POD.Volume("data", {
                                $backend: new Pvc(`${name}-data`, {
                                    $accessModes: "RWO",
                                    $storageClass: scTopolvm,
                                    $storage: "=1Gi"
                                }).with(setBackupMode("pvc-main-schedule"))
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

        const svc = new Service(name, {
            $backend: deploy,
            $ports: {
                web: 8888
            },
            $frontend: {
                type: "ClusterIP"
            }
        })

        yield svc
    }
})
