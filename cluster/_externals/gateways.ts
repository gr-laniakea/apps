import { gateway } from "k8ts/kinds"

export namespace Gateways {
    export const laniakea = gateway.v1.Gateway._.refKey({
        name: "laniakea-boo",
        namespace: "gateways"
    }).External()
    export const parjs = gateway.v1.Gateway._.refKey({
        name: "parjs",
        namespace: "gateways"
    }).External()
}
