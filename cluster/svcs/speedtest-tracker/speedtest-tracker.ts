import { Images } from "@/_images"
import { getAppMeta } from "@/_meta/app-meta"
import namespaces from "@/_namespaces/namespaces"
import { userSpeedtestTracker } from "@/_users"
import { scTopolvm } from "@/externals"
import { setBackupMode, W } from "@/root"
import { Deployment, Pvc, Service } from "k8ts"

const name = "speedtest-tracker"
const ipSpeedtestTracker = "10.0.12.72"

export default W.File(`${name}.yaml`, {
    namespace: namespaces[`Namespace/${name}`],
    meta: getAppMeta(name),
    *FILE() {
        const deploy = new Deployment(name, {
            replicas: 1,
            $template: {
                *$POD(POD) {
                    yield POD.Container(name, {
                        $image: Images.speedtestTracker,
                        $ports: {
                            web: 80
                        },
                        $env: {
                            ...userSpeedtestTracker.toDockerEnv(),
                            APP_KEY: "base64:ikmuscnwBKR3Fhnqs7sy4eHBC8IGTPCQZAN7CmOVVbI=",
                            DB_CONNECTION: "sqlite",
                            SPEEDTEST_SCHEDULE: "6 */2 * * *"
                        },
                        $resources: {
                            cpu: "100m -> 500m",
                            memory: "128Mi -> 512Mi"
                        },
                        $mounts: {
                            "/config": POD.Volume("config", {
                                $backend: new Pvc(`${name}-config`, {
                                    $accessModes: "RWO",
                                    $storageClass: scTopolvm,
                                    $storage: "=5Gi"
                                }).with(setBackupMode("pvc-main-schedule"))
                            }).Mount()
                        }
                    })
                }
            }
        })

        yield deploy

        const svc = new Service(`${name}-web`, {
            $backend: deploy,
            $ports: {
                web: 80
            },
            $frontend: {
                type: "LoadBalancer",
                loadBalancerIP: ipSpeedtestTracker
            }
        })

        yield svc
    }
})
