import { Images } from "@/_images"
import { getAppMeta } from "@/_meta/app-meta"
import namespaces from "@/_namespaces/namespaces"
import { userHomepage } from "@/_users"
import { scTopolvm } from "@/externals"
import { W } from "@/root"
import { LocalFile } from "@k8ts/instruments"
import {
    ClusterRole,
    ClusterRoleBinding,
    ConfigMap,
    Deployment,
    Pvc,
    Secret,
    Service,
    ServiceAccount
} from "k8ts"
import { gateway, metrics, v1 } from "k8ts/kinds"
import { homepageApiKeys } from "./secret-structure"

const name = "homepage"

export default W.File(`${name}.yaml`, {
    namespace: namespaces[`Namespace/${name}`],
    metadata: getAppMeta(name),
    *resources$() {
        const serviceAccount = new ServiceAccount(name, {
            $automountToken: true
        })

        yield serviceAccount

        const secret = new Secret("homepage-account", {
            $type: "kubernetes.io/service-account-token",
            $metadata: {
                "^kubernetes.io/service-account.name": serviceAccount.ident.name
            }
        })

        yield secret

        const clusterRole = new ClusterRole(name, {
            *rules$(ROLE) {
                // Core API group: namespaces, pods, nodes
                yield ROLE.Rule(v1.Namespace._, v1.Pod._, v1.Node._).verbs("get", "list")

                // gateway.networking.k8s.io: httproutes, gateways
                yield ROLE.Rule(gateway.v1.HttpRoute._, gateway.v1.Gateway._).verbs("get", "list")

                // metrics.k8s.io: nodes, pods
                yield ROLE.Rule(metrics.v1beta1.NodeMetrics._, metrics.v1beta1.PodMetrics._).verbs(
                    "get",
                    "list"
                )
            }
        })

        const clusterRoleBinding = new ClusterRoleBinding(name, {
            $role: clusterRole,
            $subjects: [serviceAccount]
        })

        const settingsFilesConfigMap = new ConfigMap(name, {
            $data: {
                "settings.yaml": LocalFile("./config/settings.yaml").as("text"),
                "services.yaml": LocalFile("./config/services.yaml").as("text"),
                "kubernetes.yaml": LocalFile("./config/kubernetes.yaml").as("text"),
                "widgets.yaml": LocalFile("./config/widgets.yaml").as("text"),
                "bookmarks.yaml": LocalFile("./config/bookmarks.yaml").as("text")
            }
        })

        const deploy = new Deployment(name, {
            $replicas: 1,
            $template: {
                $$manifest: {
                    serviceAccountName: name,
                    dnsPolicy: "ClusterFirst",
                    enableServiceLinks: true,
                    automountServiceAccountToken: true
                },

                *containers$(POD) {
                    const configVol = POD.Volume("homepage-config", {
                        $backend: settingsFilesConfigMap
                    })
                    const logsVol = POD.Volume("logs", {
                        $backend: new Pvc("homepage-logs", {
                            $accessModes: "RWO",
                            $storageClass: scTopolvm,
                            $resources: {
                                storage: "=1Gi"
                            }
                        })
                    })

                    yield POD.Container(name, {
                        $image: Images.homepage,
                        $ports: {
                            http: 3000
                        },
                        $env: {
                            HOMEPAGE_ALLOWED_HOSTS: "*",
                            LOG_LEVEL: "debug",
                            ...userHomepage.sameGroup().toDockerEnv()
                        },
                        $resources: {
                            cpu: "50m -> 500m",
                            memory: "64Mi -> 1Gi"
                        },
                        $envFrom: [
                            {
                                source: homepageApiKeys
                            }
                        ],
                        // readinessProbe: {
                        //     httpGet: {
                        //         path: "/",
                        //         port: "http" as any
                        //     },
                        //     initialDelaySeconds: 5,
                        //     periodSeconds: 10
                        // },
                        // livenessProbe: {
                        //     httpGet: {
                        //         path: "/",
                        //         port: "http" as any
                        //     },
                        //     initialDelaySeconds: 15,
                        //     periodSeconds: 20
                        // },
                        $mounts: {
                            "/app/config/bookmarks.yaml": configVol.mount({
                                subPath: "bookmarks.yaml"
                            }),
                            "/app/config/services.yaml": configVol.mount({
                                subPath: "services.yaml"
                            }),
                            "/app/config/settings.yaml": configVol.mount({
                                subPath: "settings.yaml"
                            }),
                            "/app/config/kubernetes.yaml": configVol.mount({
                                subPath: "kubernetes.yaml"
                            }),
                            "/app/config/widgets.yaml": configVol.mount({
                                subPath: "widgets.yaml"
                            }),
                            "/app/config/logs": logsVol.mount()
                        }
                    })
                }
            }
        })

        const service = new Service(name, {
            $backend: deploy,
            $ports: {
                http: 80
            },
            $frontend: {
                type: "LoadBalancer",
                loadBalancerIP: "10.0.12.127"
            }
        })
    }
})
