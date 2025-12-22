import namespaces from "@/_namespaces/namespaces"
import { Bazarr, Prowlarr, Radarr, Sonarr } from "@/svcs/media/arr"
import Jellyfin from "@/svcs/media/jellyfin"
import TheLounge from "@/svcs/thelounge"
import { Deployment, Pv, Pvc, Runner } from "k8ts"

import { topolvm } from "./root"
import factorio from "./svcs/factorio"
import sabnzbd from "./svcs/media/downloaders/sabnzbd/sabnzbd"
import transmission from "./svcs/media/downloaders/transmission/transmission"
import jellyseer from "./svcs/media/jellyseer"
import media from "./svcs/media/media"
import minecraft from "./svcs/minecraft"
import mumble from "./svcs/mumble"
import Public from "./_storage/_media"
import { Syncthing } from "./svcs/syncthing"
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
        minecraft
    ])
}
main()
