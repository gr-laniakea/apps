import { Images } from "@/_images"
import { hddNodePublicIp, ssdNodePublicIp } from "@/_ips"
import { getAppMeta } from "@/_meta/app-meta"
import namespaces from "@/_namespaces/namespaces"
import { userMumble } from "@/_users"
import { setBackupMode, topolvm, W } from "@/root"

export default W.Scope(namespaces["Namespace/mumble"])
    .File("mumble.yaml")
    .metadata(getAppMeta("mumble"))
    .Resources(function* FILE(FILE) {
        const deploy = FILE.Deployment("mumble", {
            replicas: 1
        })
            .Template({})
            .POD(function* POD(POD) {
                const vol = POD.Volume("var", {
                    $backend: FILE.Claim("mumble-var", {
                        $accessModes: "RWO",
                        $storageClass: topolvm,
                        $storage: "=3Gi"
                    }).with(setBackupMode("pvc-main-schedule"))
                })
                yield POD.Container("mumble", {
                    $image: Images.mumble,
                    $ports: {
                        tcp: {
                            port: 64738,
                            protocol: "TCP",
                            hostIp: ssdNodePublicIp,
                            hostPort: 64738
                        },
                        udp: {
                            port: 64738,
                            protocol: "UDP",
                            hostIp: ssdNodePublicIp,
                            hostPort: 64738
                        }
                    },
                    $env: {
                        ...userMumble.toDockerEnv(),
                        MUMBLE_CONFIG_SERVER_PASSWORD: "superspecialawesomegame",
                        MUMBLE_SERVER_USERNAME: "greg",
                        MUMBLE_SERVER_ADMIN_KEY: "atroposwasneveratropos",
                        MUMBLE_SUPERUSER_PASSWORD: "thechickensarecoming"
                    },
                    $resources: {
                        cpu: "100m -> 500m",
                        memory: "500Mi -> 1Gi"
                    },
                    $mounts: {
                        "/data": vol.Mount()
                    }
                })
            })
    })
