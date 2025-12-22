import { Deployment, Pvc, Service, type CDK, type World } from "k8ts"
import { topolvm } from "./root"
export function applyHooks(W: World) {
    W.on("resource/manifested", ({ resource, manifest }) => {
        resource.node.when(Service, svc => {
            if (svc.props.$frontend.type === "LoadBalancer") {
                const mService = manifest as CDK.KubeServiceProps
                mService.spec!.allocateLoadBalancerNodePorts = false
                mService.spec!.externalTrafficPolicy = "Local"
            }
        })
    })
    W.on("resource/loaded", ({ resource }) => {
        resource.node.when(Pvc, entity => {
            if (entity.props.$storageClass?.name === "topolvm") {
                entity.name += "-topo"
                entity.meta.overwrite("name", entity.name)
            }
        })
        resource.node.when(Deployment, entity => {
            entity.props.$strategy = {
                type: "Recreate"
            }
            const hasTopolvmPvc = entity.node.recursiveRelationsSubtree
                .first(x => {
                    const ent = x.needed.entity
                    return ent instanceof Pvc && ent.props.$storageClass === topolvm
                })
                .pull()
            if (hasTopolvmPvc) {
                entity.meta.add({
                    "%has-topolvm-pvc": "true"
                })
            }
        })
    })
}
