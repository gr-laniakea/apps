import type { K8S } from "k8ts"

export const _nodeSelector: K8S.PodSpec["nodeSelector"] = {
    "laniakea/storage": "ssd"
}
export const nodeAffinity: K8S.VolumeNodeAffinity = {
    required: {
        nodeSelectorTerms: [
            {
                matchExpressions: [
                    {
                        key: "laniakea/storage",
                        operator: "In",
                        values: ["ssd"]
                    }
                ]
            }
        ]
    }
}
