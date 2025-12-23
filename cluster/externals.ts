import { storage } from "k8ts/kinds"

export const scTopolvm = storage.v1.StorageClass._.refKey({
    name: "topolvm"
}).External()
