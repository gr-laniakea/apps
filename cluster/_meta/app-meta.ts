import type { Metadata_Input } from "@k8ts/metadata"

export function getAppMeta(name: string, parent?: string): Metadata_Input {
    return {
        "app.kubernetes.io/": {
            "%instance": name,
            "%name": name,
            "%part-of": parent ?? "laniakea"
        }
    }
}
