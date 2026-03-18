import type { K8S } from "k8ts"

export const _tolerations = [
    {
        key: "laniakea/storage",
        value: "hdd"
    }
] as K8S.Toleration[]
export const _nodeSelector: K8S.PodSpec["nodeSelector"] = {
    "laniakea/storage": "hdd"
}
export const nodeAffinity: K8S.VolumeNodeAffinity = {
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
} satisfies Partial<K8S.PodSpec>
