import { Pvc, Runner } from "k8ts"

import "./_storage/_media"
import { W } from "./root"
import "./svcs/factorio"
import "./svcs/flaresolverr/flaresolverr"
import "./svcs/homepage/homepage"
import "./svcs/media/arr/jackett"
import "./svcs/media/downloaders/sabnzbd/sabnzbd"
import "./svcs/media/downloaders/transmission/transmission"
import "./svcs/media/jellyseer"
import "./svcs/media/media"
import "./svcs/minecraft"
import "./svcs/mumble"
import "./svcs/speedtest-tracker/speedtest-tracker"
import "./svcs/syncthing"
import "./svcs/wg-portal"
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
    try {
        await import("./svcs/homepage/secret/secret")
        await import("./svcs/speedtest-tracker/secret/index")
        await import("./svcs/wg-portal/secret/index")
    } catch (e: any) {
        console.error(e.message)
    }
    await runner.run(W)
}
main()
