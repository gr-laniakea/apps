import { Gateways } from "@/_externals/gateways"
import { scheduleOnHdd } from "@/_hdd-node"
import { Images } from "@/_images"
import { getAppMeta } from "@/_meta/app-meta"
import namespaces from "@/_namespaces/namespaces"
import { userMedia } from "@/_users"
import { scTopolvm } from "@/externals"
import { getBackupMode, W } from "@/root"
import { Deployment, HttpRoute, Pvc, Secret, Service } from "k8ts"
import Media from "../media"

const name = "shelfmark"

export default W.File(`${name}.yaml`, {
    namespace: namespaces["Namespace/media"],
    metadata: getAppMeta(name),
    *resources$() {
        const extSecret = new Secret(name, {
            $noEmit: true,
            $data: {
                PROWLARR_API_KEY: "",
                SABNZBD_API_KEY: "",
                AA_DONATOR_KEY: ""
            }
        })
        const deploy = new Deployment(name, {
            $replicas: 1,
            $template: {
                $$manifest: scheduleOnHdd,
                *containers$(POD) {
                    yield POD.Container(name, {
                        $image: Images.shelfmark,
                        $ports: {
                            web: "8084"
                        },
                        $resources: {
                            cpu: "100m -> 2000m",
                            memory: "512Mi -> 4Gi"
                        },
                        $env: {
                            ...userMedia.sameGroup().toDockerEnv(),
                            CALIBRE_WEB_URL: "https://read.laniakea.boo",
                            INGEST_DIR: "/ingest",
                            PROWLARR_ENABLED: "true",
                            PROWLARR_URL: "http://prowlarr.lk.host",
                            PROWLARR_API_KEY: {
                                $backend: extSecret,
                                key: "PROWLARR_API_KEY"
                            },
                            PROWLARR_USENET_CLIENT: "sabnzbd",
                            SABNZBD_URL: "http://sabnzbd.lk.host",
                            SABNZBD_API_KEY: {
                                $backend: extSecret,
                                key: "SABNZBD_API_KEY"
                            },
                            DIRECT_DOWNLOAD_ENABLED: "true",
                            AA_BASE_URL: "auto",
                            AA_DONATOR_KEY: {
                                $backend: extSecret,
                                key: "AA_DONATOR_KEY"
                            }
                        },
                        $mounts: {
                            "/config": POD.Volume("config", {
                                $backend: new Pvc(`${name}-config`, {
                                    $accessModes: "RWO",
                                    $storageClass: scTopolvm,
                                    $resources: {
                                        storage: "=5Gi"
                                    },
                                    $metadata: getBackupMode("pvc-hdd-schedule")
                                })
                            }).mount(),
                            "/ingest": POD.Volume("ebooks", {
                                $backend: Media["PersistentVolumeClaim/nfs-ebooks"]
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
            $hostname: "shelfmark.laniakea.boo"
        })
    }
})
