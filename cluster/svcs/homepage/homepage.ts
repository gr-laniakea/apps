import { Images } from "@/_images"
import { getAppMeta } from "@/_meta/app-meta"
import namespaces from "@/_namespaces/namespaces"
import { scTopolvm } from "@/externals"
import { W } from "@/root"
import { local_file } from "@k8ts/instruments"
import { ClusterRole, ClusterRoleBinding, ConfigMap, Deployment, Pvc, ServiceAccount } from "k8ts"
import { v1 } from "k8ts/kinds"
import { ext_Secret } from "./secret-structure"

const name = "homepage"

export default W.File(`${name}.yaml`, {
    namespace: namespaces[`Namespace/${name}`],
    meta: getAppMeta(name),
    *FILE() {
        const serviceAccount = new ServiceAccount(name, {
            automountToken: true
        })

        yield serviceAccount

        const secret = v1.Secret._.External({
            name: "homepage",
            namespace: namespaces[`Namespace/${name}`]
        })

        // Set annotations for service account token secret
        secret.meta.add("^kubernetes.io/service-account.name", name)

        yield secret

        const clusterRole = new ClusterRole(name, {
            rules: () => [
                {
                    resources: [] as any,
                    verbs: ["get", "list"]
                }
            ]
        })

        yield clusterRole

        const clusterRoleBinding = new ClusterRoleBinding(name, {
            $role: clusterRole,
            $subjects: [serviceAccount]
        })

        yield clusterRoleBinding

        const configMap = new ConfigMap(name, {
            $data: {
                "settings.yaml": local_file("./settings.yaml").as("text"),
                "services.yaml": local_file("./services.yaml").as("text"),
                "bookmarks.yaml": local_file("./bookmarks.yaml").as("text"),
                "widgets.yaml": local_file("./widgets.yaml").as("text"),
                "kubernetes.yaml": local_file("./kubernetes.yaml").as("text")
            }
        })

        yield configMap

        const deploy = new Deployment(name, {
            replicas: 1,
            $template: {
                serviceAccountName: name,
                automountServiceAccountToken: true,
                *$POD(POD) {
                    const configVol = POD.Volume("homepage-config", {
                        $backend: configMap
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
                            HOMEPAGE_ALLOWED_HOSTS: ""
                        },
                        $resources: {
                            cpu: "50m -> 500m",
                            memory: "64Mi -> 1Gi"
                        },
                        $envFrom: [
                            {
                                source: ext_Secret
                            }
                        ],
                        readinessProbe: {
                            httpGet: {
                                path: "/",
                                port: "http" as any
                            },
                            initialDelaySeconds: 5,
                            periodSeconds: 10
                        },
                        livenessProbe: {
                            httpGet: {
                                path: "/",
                                port: "http" as any
                            },
                            initialDelaySeconds: 15,
                            periodSeconds: 20
                        },
                        $mounts: {
                            "/app/config/": configVol.Mount(),
                            "/app/config/logs": logsVol.Mount()
                        }
                    })
                }
            }
        })

        yield deploy
    }
})
