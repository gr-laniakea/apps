import type { Meta } from "@k8ts/metadata"

export function getAppMeta(name: string, parent?: string): Meta.Input {
    return {
        "app.kubernetes.io/": {
            "%instance": name,
            "%name": name,
            "%part-of": parent ?? "laniakea"
        }
    }
}
