import type { CDK } from "k8ts"

export const _nodeSelector: CDK.PodSpec["nodeSelector"] = {
    "laniakea/storage": "ssd"
}
export const nodeAffinity: CDK.VolumeNodeAffinity = {
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
