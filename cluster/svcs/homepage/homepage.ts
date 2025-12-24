import { Images } from "@/_images"
import { getAppMeta } from "@/_meta/app-meta"
import namespaces from "@/_namespaces/namespaces"
import { userHomepage } from "@/_users"
import { scTopolvm } from "@/externals"
import { W } from "@/root"
import { localRefFile } from "@k8ts/instruments"
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
    meta: getAppMeta(name),
    *FILE() {
        const serviceAccount = new ServiceAccount(name, {
            automountToken: true
        })

        yield serviceAccount

        const secret = new Secret("homepage-account", {
            $type: "kubernetes.io/service-account-token"
        })

        // Set annotations for service account token secret
        secret.meta.add({
            "^kubernetes.io/service-account.name": serviceAccount.name
        })

        yield secret

        const clusterRole = new ClusterRole(name, {
            *rules(ROLE) {
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
                "settings.yaml": localRefFile("./config/settings.yaml").as("text"),
                "services.yaml": localRefFile("./config/services.yaml").as("text"),
                "widgets.yaml": localRefFile("./config/widgets.yaml").as("text"),
                "kubernetes.yaml": localRefFile("./config/kubernetes.yaml").as("text"),
                "docker.yaml": localRefFile("./config/docker.yaml").as("text")
            }
        })

        const deploy = new Deployment(name, {
            replicas: 1,
            $template: {
                serviceAccountName: name,
                dnsPolicy: "ClusterFirst",
                enableServiceLinks: true,
                automountServiceAccountToken: true,
                *$POD(POD) {
                    const configVol = POD.Volume("homepage-config", {
                        $backend: settingsFilesConfigMap
                    })
                    const logsVol = POD.Volume("logs", {
                        $backend: new Pvc("homepage-logs", {
                            $accessModes: "RWO",
                            $storageClass: scTopolvm,
                            $storage: "=1Gi"
                        })
                    })

                    yield POD.Container(name, {
                        $image: Images.homepage,
                        $ports: {
                            http: 3000
                        },
                        $env: {
                            HOMEPAGE_ALLOWED_HOSTS: "*",
                            ...userHomepage.toDockerEnv()
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
                            "/app/config/": configVol.Mount(),
                            "/app/config/logs": logsVol.Mount()
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
