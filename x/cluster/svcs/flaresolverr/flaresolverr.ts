import { Images } from "@/_images"
import { ipFlaresolverr } from "@/_ips"
import { getAppMeta } from "@/_meta/app-meta"
import namespaces from "@/_namespaces/namespaces"
import { scTopolvm } from "@/externals"
import { setBackupMode, W } from "@/root"
import { Deployment, Pvc, Service } from "k8ts"

const name = "flaresolverr"

export default W.File(`${name}.yaml`, {
    namespace: namespaces[`Namespace/${name}`],
    meta: getAppMeta(name),
    *FILE() {
        const deploy = new Deployment(name, {
            replicas: 1,
            $template: {
                *$POD(POD) {
                    yield POD.Container(name, {
                        $image: Images.flaresolverr,
                        $ports: {
                            web: 8191
                        },
                        $env: {
                            LOG_LEVEL: "info",
                            LOG_FILE: "none",
                            LOG_HTML: "false",
                            CAPTCHA_SOLVER: "none"
                        },
                        $resources: {
                            cpu: "100m -> 2000m",
                            memory: "512Mi -> 2Gi"
                        },
                        $mounts: {
                            "/config": POD.Volume("config", {
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

        const svc = new Service(name, {
            $backend: deploy,
            $ports: {
                web: 80
            },
            $frontend: {
                type: "LoadBalancer",
                loadBalancerIP: ipFlaresolverr
            }
        })

        yield svc
    }
})
