import namespaces from "@/_namespaces/namespaces"
import { Bazarr, Prowlarr, Radarr, Sonarr } from "@/svcs/media/arr"
import Jellyfin from "@/svcs/media/jellyfin"
import TheLounge from "@/svcs/thelounge"
import { Pvc, Runner } from "k8ts"

import Public from "./_storage/_media"
import factorio from "./svcs/factorio"
import flaresolverr from "./svcs/flaresolverr/flaresolverr"
import homepage from "./svcs/homepage/homepage"
import jackett from "./svcs/media/arr/jackett"
import sabnzbd from "./svcs/media/downloaders/sabnzbd/sabnzbd"
import transmission from "./svcs/media/downloaders/transmission/transmission"
import jellyseer from "./svcs/media/jellyseer"
import media from "./svcs/media/media"
import minecraft from "./svcs/minecraft"
import mumble from "./svcs/mumble"
import speedtestTracker from "./svcs/speedtest-tracker/speedtest-tracker"
import { Syncthing } from "./svcs/syncthing"
import { WgPortal } from "./svcs/wgportal"
async function main() {
    const runner = new Runner({
        cwd: ".",
        outdir: ".k8ts",
        progress: {
            waitTransition: 5
        }
    })

    const sourcePvcs = [] as Pvc<any>[]
    const targetPvcs = [] as Pvc<any>[]

    runner.on("load", ({ resource }) => {})
    runner.on("manifest", ({ resource }) => {})
    const secrets = [] as any[]
    try {
        const hpSecrets = require("./svcs/homepage/secret/secret.ts").default
        const speedtestSecrets = require("./svcs/speedtest-tracker/secret/index.ts").default
        secrets.push(hpSecrets, speedtestSecrets)
    } catch (e: any) {
        console.error(e.message)
    }
    await runner.run([
        Jellyfin,
        TheLounge,
        Prowlarr,
        Radarr,
        Sonarr,
        Bazarr,
        transmission,
        sabnzbd,
        Syncthing,
        namespaces,
        mumble,
        Public,
        jellyseer,
        media,
        factorio,
        minecraft,
        homepage,
        speedtestTracker,
        flaresolverr,
        jackett,
        WgPortal,
        ...secrets
    ])
}
main()
