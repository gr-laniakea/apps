import { Gateways } from "@/_externals/gateways"
import { Images } from "@/_images"
import { ipWgClientPortal, ssdNodePublicIp } from "@/_ips"
import { getAppMeta } from "@/_meta/app-meta"
import namespaces from "@/_namespaces/namespaces"
import { scTopolvm } from "@/externals"
import { setBackupMode, W } from "@/root"
import { Deployment, HttpRoute, Pvc, Secret, Service } from "k8ts"

const name = "wg-client"

export default W.File(`${name}.yaml`, {
    namespace: namespaces["Namespace/wg-client"],
    meta: getAppMeta(name),
    *FILE() {
        const extSecret = new Secret(name, {
            $data: {
                ADMIN_USER: "",
                ADMIN_PASSWORD: ""
            }
        })
        extSecret.disabled = true
        const udpPort = 51830
        const webPort = 80
        const deploy = new Deployment(name, {
            replicas: 1,

            $template: {
                hostNetwork: true,
                *$POD(POD) {
                    yield POD.Container(name, {
                        $image: Images.wgPortal,
                        $ports: {
                            wireguard: {
                                port: udpPort,
                                protocol: "UDP",
                                hostIp: ssdNodePublicIp,
                                hostPort: udpPort
                            },
                            web: {
                                port: 80,
                                protocol: "TCP",
                                hostIp: ipWgClientPortal,
                                hostPort: 80
                            }
                        },
                        securityContext: {
                            capabilities: {
                                add: ["NET_ADMIN"]
                            }
                        },
                        $env: {
                            WG_PORTAL_BACKEND_IGNORED_LOCAL_INTERFACES: "wg0",
                            WG_PORTAL_CORE_ADMIN_USER: {
                                $backend: extSecret,
                                key: "ADMIN_USER"
                            },
                            WG_PORTAL_CORE_ADMIN_PASSWORD: {
                                $backend: extSecret,
                                key: "ADMIN_PASSWORD"
                            },
                            WG_PORTAL_WEB_LISTENING_ADDRESS: `:${webPort}`,
                            WG_PORTAL_WEB_EXTERNAL_URL: `https://wg.laniakea.boo`,
                            WG_PORTAL_ADVANCED_START_LISTEN_PORT: udpPort,
                            WG_PORTAL_ADVANCED_USE_IP_V6: "false",
                            WG_CLIENT_DASHBOARD_SERVICE_HOST: "wg.laniakea.boo",
                            WG_PORTAL_ADVANCED_CONFIG_STORAGE_PATH: "/etc/wireguard"
                        },
                        $resources: {
                            cpu: "100m -> 500m",
                            memory: "128Mi -> 512Mi"
                        },
                        $mounts: {
                            "/etc/wireguard": POD.Volume("wireguard", {
                                $backend: new Pvc(`${name}-wireguard-2`, {
                                    $accessModes: "RWO",
                                    $storageClass: scTopolvm,
                                    $storage: "=1Gi"
                                }).with(setBackupMode("pvc-main-schedule"))
                            }).Mount(),
                            "/app/data": POD.Volume("data", {
                                $backend: new Pvc(`${name}-data-2`, {
                                    $accessModes: "RWO",
                                    $storageClass: scTopolvm,
                                    $storage: "=1Gi"
                                }).with(setBackupMode("pvc-main-schedule"))
                            }).Mount()
                        }
                    })
                }
            }
        })
        const service = new Service(name, {
            $backend: deploy,
            $ports: {
                web: 80
            },
            $frontend: {
                type: "ClusterIP"
            }
        })
        const route = new HttpRoute(name, {
            $backend: service.portRef("web"),
            $gateway: Gateways.laniakea,
            $hostname: "wg.laniakea.boo"
        })
    }
})
