import { Images } from "@/_images"
import { getAppMeta } from "@/_meta/app-meta"
import namespaces from "@/_namespaces/namespaces"
import { userSpeedtestTracker } from "@/_users"
import { scTopolvm } from "@/externals"
import { setBackupMode, W } from "@/root"
import { Cron } from "@k8ts/instruments"
import { Deployment, Pvc, Secret, Service } from "k8ts"

const name = "speedtest-tracker"
const ipSpeedtestTracker = "10.0.12.72"

export default W.File(`${name}.yaml`, {
    namespace: namespaces[`Namespace/${name}`],
    meta: getAppMeta(name),
    *FILE() {
        const extSecret = new Secret("speedtest-tracker", {
            $data: {
                API_KEY: ""
            }
        })
        // ADD secret after namespace is created
        extSecret.disabled = true
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
                            APP_KEY: {
                                $backend: extSecret,
                                key: "API_KEY"
                            },
                            DB_CONNECTION: "sqlite",
                            SPEEDTEST_SCHEDULE: Cron.parse("6 */2 * * *").string
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

        const svc = new Service(name, {
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
