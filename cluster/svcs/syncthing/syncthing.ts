import { Images } from "@/_images"
import { ipSyncthingWebUi } from "@/_ips"
import { getAppMeta } from "@/_meta/app-meta"
import namespaces from "@/_namespaces/namespaces"
import { userSyncthing } from "@/_users"
import { scTopolvm } from "@/externals"
import { setBackupMode, W } from "@/root"
import { Deployment, Pvc, Service } from "k8ts"

/*
Remember: we don't needd discovery service because everything is on the VPN with static IPs
so NAT or dynamic IP don't matter. 
*/

export default W.File("syncthing.yaml", {
    namespace: namespaces["Namespace/syncthing"],
    meta: getAppMeta("syncthing"),
    *FILE() {
        const deploy = new Deployment("syncthing", {
            replicas: 1,
            $template: {
                *$POD(POD) {
                    yield POD.Container("syncthing", {
                        $image: Images.syncthing,
                        $ports: {
                            webui: 8384,
                            "io-tcp": {
                                port: 22000,
                                protocol: "TCP",
                                hostIp: ipSyncthingWebUi,
                                hostPort: 22000
                            },
                            "io-udp": {
                                port: 21027,
                                protocol: "UDP",
                                hostIp: ipSyncthingWebUi,
                                hostPort: 21027
                            }
                        },
                        $env: {
                            ...userSyncthing.toDockerEnv()
                        },
                        $resources: {
                            cpu: "300m -> 1000m",
                            memory: "500Mi -> 8Gi"
                        },
                        $mounts: {
                            "/config": POD.Volume("config", {
                                $backend: new Pvc("syncthing-config", {
                                    $accessModes: "RWO",
                                    $storageClass: scTopolvm,
                                    $storage: "=5Gi"
                                }).with(setBackupMode("pvc-main-schedule"))
                            }).Mount(),
                            "/data": POD.Volume("data", {
                                $backend: new Pvc("data", {
                                    $accessModes: "RWO",
                                    $storageClass: scTopolvm,
                                    $storage: "=200Gi"
                                }).with(setBackupMode("pvc-data-schedule"))
                            }).Mount()
                        }
                    })
                }
            }
        })

        yield deploy

        const svc = new Service("syncthing-webui", {
            $backend: deploy,
            $ports: {
                webui: 80
            },
            $frontend: {
                type: "LoadBalancer",
                loadBalancerIP: ipSyncthingWebUi
            }
        })

        yield svc
    }
})
