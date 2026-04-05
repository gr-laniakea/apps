import type { K8S } from "@k8ts/sample-interfaces"
import { Deployment, Pvc, Service, type K8tsWorld_Base } from "k8ts"
import { scTopolvm } from "./externals"
export function applyHooks(W: K8tsWorld_Base) {
    W.on("resource/manifested", ({ resource, manifest }) => {
        resource.__vertex__.when(Service, svc => {
            if (svc.props.$frontend.type === "LoadBalancer") {
                const mService = manifest as K8S.KubeServiceProps
                mService.spec!.allocateLoadBalancerNodePorts = false
                mService.spec!.externalTrafficPolicy = "Local"
            }
        })
    })
    W.on("resource/loaded", ({ resource }) => {
        resource.__vertex__.when(Pvc, entity => {
            if (entity.props.$storageClass?.ident.name === "topolvm") {
                entity.ident.name += "-topo"
            }
        })
        resource.__vertex__.when(Deployment, entity => {
            entity.props.$strategy = {
                type: "Recreate"
            }
            const hasTopolvmPvc = entity.__vertex__.recursiveRelationsSubtree
                .first(x => {
                    const ent = x.needed.entity
                    return ent instanceof Pvc && ent.props.$storageClass === scTopolvm
                })
                .pull()
            if (hasTopolvmPvc) {
                entity.metadata.add({
                    "%has-topolvm-pvc": "true"
                })
            }
        })
    })
}
