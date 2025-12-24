import { v1 } from "k8ts/kinds"

export const objHomepageSecretStructure = {
    HOMEPAGE_VAR_SPEEDTEST_API_KEY: "",
    HOMEPAGE_VAR_SABNZBD_API_KEY: "",
    HOMEPAGE_VAR_SONARR_API_KEY: "",
    HOMEPAGE_VAR_RADARR_API_KEY: "",
    HOMEPAGE_VAR_PROWLARR_API_KEY: "",
    HOMEPAGE_VAR_BAZARR_API_KEY: "",
    HOMEPAGE_VAR_JELLYFIN_API_KEY: "",
    HOMEPAGE_VAR_JELLYSEER_API_KEY: ""
}
export type EnvKeys = keyof typeof objHomepageSecretStructure
export const homepageApiKeys = v1.Secret._.refKey({
    name: "api-keys",
    namespace: "homepage"
}).External({
    keys: Object.keys(objHomepageSecretStructure) as EnvKeys[]
})
