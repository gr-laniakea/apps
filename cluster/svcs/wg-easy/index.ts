import { Images } from "@/_images"
import { ipWgClient, ssdNodePublicIp } from "@/_ips"
import { getAppMeta } from "@/_meta/app-meta"
import namespaces from "@/_namespaces/namespaces"
import { scTopolvm } from "@/externals"
import { setBackupMode, W } from "@/root"
import { Deployment, Pvc, Secret, Service } from "k8ts"

const name = "wg-client"

export default W.File(`${name}.yaml`, {
    namespace: namespaces["Namespace/wg-client"],
    meta: getAppMeta(name),
    *FILE() {
        const extSecret = new Secret(name, {
            $data: {
                INIT_USERNAME: "",
                INIT_PASSWORD: ""
            }
        })
        extSecret.disabled = true
        const udpPort = 51830
        const webPort = 51831
        const deploy = new Deployment(name, {
            replicas: 1,
            $template: {
                *$POD(POD) {
                    yield POD.Container(name, {
                        $image: Images.wgEasy,
                        $ports: {
                            wireguard: {
                                port: 51820,
                                protocol: "UDP",
                                hostIp: ssdNodePublicIp,
                                hostPort: udpPort
                            },
                            web: webPort
                        },
                        securityContext: {
                            capabilities: {
                                add: ["NET_ADMIN", "SYS_MODULE"]
                            }
                        },
                        $env: {
                            PORT: webPort,
                            INIT_ENABLED: "true",
                            INIT_USERNAME: {
                                $backend: extSecret,
                                key: "INIT_USERNAME"
                            },
                            INIT_PASSWORD: {
                                $backend: extSecret,
                                key: "INIT_PASSWORD"
                            },
                            INIT_HOST: "0.0.0.0",
                            INIT_PORT: udpPort,
                            INIT_DNS: "10.0.12.10,8.8.8.8,8.8.4.4",
                            INIT_ALLOWED_IPS: "10.0.32.1/32,10.0.0.0/19",
                            DISABLE_IPV6: "true",
                            INSECURE: "true"
                        },
                        $resources: {
                            cpu: "100m -> 500m",
                            memory: "128Mi -> 512Mi"
                        },
                        $mounts: {
                            "/etc/wireguard": POD.Volume("config", {
                                $backend: new Pvc(`${name}-config`, {
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

        yield deploy

        const svc = new Service(`${name}-dashboard`, {
            $backend: deploy,
            $ports: {
                web: 80
            },
            $frontend: {
                type: "LoadBalancer",
                loadBalancerIP: ipWgClient
            }
        })

        yield svc
    }
})
