import { K8S } from "k8ts"

export const nodeAffinity: K8S.VolumeNodeAffinity = {
    required: {
        nodeSelectorTerms: [
            {
                matchExpressions: [
                    {
                        key: "kubernetes.io/hostname",
                        operator: "In",
                        values: ["laniakea"]
                    }
                ]
            }
        ]
    }
}
