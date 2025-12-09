import { CDK } from "k8ts"

export const nodeAffinity: CDK.VolumeNodeAffinity = {
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
