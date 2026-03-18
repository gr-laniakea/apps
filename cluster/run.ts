import { Runner } from "k8ts"

import "./_storage/_media"
import { W } from "./root"
import "./svcs/factorio"
import "./svcs/flaresolverr/flaresolverr"
import "./svcs/homepage/homepage"
import "./svcs/media/arr/bazarr"
import "./svcs/media/arr/jackett"
import "./svcs/media/arr/prowlarr"
import "./svcs/media/arr/radarr"
import "./svcs/media/arr/sonarr"
import "./svcs/media/arr/sync-bazarr"
import "./svcs/media/downloaders/sabnzbd/sabnzbd"
import "./svcs/media/downloaders/transmission/transmission"
import "./svcs/media/jellyfin"
import "./svcs/media/jellyseer"
import "./svcs/media/media"
import "./svcs/minecraft"
import "./svcs/mumble"
import "./svcs/speedtest-tracker/speedtest-tracker"
import "./svcs/syncthing"
import "./svcs/thelounge"
async function main() {
    const runner = new Runner({
        cwd: ".",
        outdir: ".k8ts"
    })

    const secrets = [] as any[]
    try {
        const hpSecrets = require("./svcs/homepage/secret/secret.ts").default
        const speedtestSecrets = require("./svcs/speedtest-tracker/secret/index.ts").default
        const wgPortalSecrets = require("./svcs/wgportal/secret/index.ts").default
        secrets.push(hpSecrets, speedtestSecrets, wgPortalSecrets)
    } catch (e: any) {
        console.error(e.message)
    }
    await runner.run(W)
}
main()
