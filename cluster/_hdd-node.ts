import type { CDK } from "k8ts"

export const _tolerations = [
    {
        key: "laniakea/storage",
        value: "hdd"
    }
] as CDK.Toleration[]
export const _nodeSelector: CDK.PodSpec["nodeSelector"] = {
    "laniakea/storage": "hdd"
}
export const nodeAffinity: CDK.VolumeNodeAffinity = {
    required: {
        nodeSelectorTerms: [
            {
                matchExpressions: [
                    {
                        key: "laniakea/storage",
                        operator: "In",
                        values: ["hdd"]
                    }
                ]
            }
        ]
    }
}

export const scheduleOnHdd = {
    tolerations: _tolerations,
    nodeSelector: _nodeSelector
} satisfies Partial<CDK.PodSpec>
