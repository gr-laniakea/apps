import { Gateways } from "@/_externals/gateways"
import { Images } from "@/_images"
import { getAppMeta } from "@/_meta/app-meta"
import namespaces from "@/_namespaces/namespaces"
import { scheduleOnSsd } from "@/_ssd-node"
import { userMedia } from "@/_users"
import { scTopolvm } from "@/externals"
import { getBackupMode, W } from "@/root"
import { Deployment, HttpRoute, Pvc, Service } from "k8ts"
import Media from "./media"

const name = "calibre-web-automated"

export default W.File(`${name}.yaml`, {
    namespace: namespaces["Namespace/media"],
    metadata: getAppMeta(name),
    *resources$() {
        const deploy = new Deployment(name, {
            $replicas: 1,
            $template: {
                $$manifest: scheduleOnSsd,
                *containers$(POD) {
                    yield POD.Container(name, {
                        $image: Images.calibreWebAutomated,
                        $ports: {
                            web: "8083"
                        },
                        $resources: {
                            cpu: "100m -> 2000m",
                            memory: "512Mi -> 4Gi"
                        },
                        $env: {
                            ...userMedia.sameGroup().toDockerEnv()
                        },
                        $mounts: {
                            "/config": POD.Volume("config", {
                                $backend: new Pvc(`${name}-config`, {
                                    $accessModes: "RWO",
                                    $storageClass: scTopolvm,
                                    $resources: {
                                        storage: "=7Gi"
                                    },
                                    $metadata: getBackupMode("pvc-main-schedule")
                                })
                            }).mount(),
                            "/calibre-library": POD.Volume("library", {
                                $backend: new Pvc(`${name}-library`, {
                                    $accessModes: "RWO",
                                    $storageClass: scTopolvm,
                                    $resources: {
                                        storage: "=150Gi"
                                    },
                                    $metadata: getBackupMode("pvc-main-schedule")
                                })
                            }).mount(),
                            "/cwa-book-ingest": POD.Volume("ingest", {
                                $backend: Media["PersistentVolumeClaim/ebooks"]
                            }).mount()
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
                type: "ClusterIP"
            }
        })

        yield svc

        yield new HttpRoute(name, {
            $backend: svc.portRef("web"),
            $gateway: Gateways.laniakea,
            $hostname: "read.laniakea.boo"
        })
    }
})
