import { v1 } from "k8ts/kinds"

export const objHomepageSecretStructure = {
    HP_SPEEDTEST_API_KEY: "",
    HP_SABNZBD_API_KEY: "",
    HP_SONARR_API_KEY: "",
    HP_RADARR_API_KEY: "",
    HP_PROWLARR_API_KEY: "",
    HP_BAZARR_API_KEY: "",
    HP_JELLYFIN_API_KEY: "",
    HP_JELLYSEER_API_KEY: ""
}
export type EnvKeys = keyof typeof objHomepageSecretStructure
export const ext_Secret = v1.Secret._.refKey({
    name: "api-keys",
    namespace: "homepage"
}).External({
    keys: Object.keys(objHomepageSecretStructure) as EnvKeys[]
})
