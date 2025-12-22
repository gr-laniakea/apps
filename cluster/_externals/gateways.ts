import { W } from "@/root"
import { gateway } from "k8ts/kinds"

export namespace Gateways {
    export const laniakea = W.External(gateway.v1.Gateway._, "laniakea-boo", "gateways")
    export const parjs = W.External(gateway.v1.Gateway._, "parjs", "gateways")
}
