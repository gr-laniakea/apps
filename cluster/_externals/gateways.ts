import { W } from "@/root"
import { api } from "k8ts/kinds"
const gwKind = api.gateway_.v1_.Gateway
export namespace Gateways {
    export const laniakea = W.External(gwKind, "laniakea-boo", "gateways")
    export const parjs = W.External(gwKind, "parjs", "gateways")
}
