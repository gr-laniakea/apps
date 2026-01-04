export const homepageSecretName = "api-keys" as const
export const homepageSecretStructure = {
    HOMEPAGE_VAR_SPEEDTEST_API_KEY: "",
    HOMEPAGE_VAR_SABNZBD_API_KEY: "",
    HOMEPAGE_VAR_SONARR_API_KEY: "",
    HOMEPAGE_VAR_RADARR_API_KEY: "",
    HOMEPAGE_VAR_PROWLARR_API_KEY: "",
    HOMEPAGE_VAR_BAZARR_API_KEY: "",
    HOMEPAGE_VAR_JELLYFIN_API_KEY: "",
    HOMEPAGE_VAR_JELLYSEER_API_KEY: ""
}
export type EnvKeys = keyof typeof homepageSecretStructure
