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

    runner.on("load", ({ resource }) => {
        resource.when(Pvc, entity => {
            if (entity.props.$storageClass?.name === "topolvm") {
                targetPvcs.push(entity)
                entity.name += "-topo"
                // @ts-expect-error bad thing
                entity.node.key.name = entity.name
                entity.meta.overwrite("name", entity.name)
                targetPvcs.push(entity)
            }
        })
    })
    runner.on("manifest", ({ resource }) => {
        resource.when(Deployment, entity => {
            entity.props.$strategy = {
                type: "Recreate"
            }
            const hasTopolvmPvc = entity.node.recursiveRelationsSubtree
                .first(x => {
                    const ent = x.needed.entity
                    return ent instanceof Pvc && ent.props.$storageClass === topolvm
                })
                .pull()
            if (hasTopolvmPvc) {
                entity.meta.add({
                    "%has-topolvm-pvc": "true"
                })
            }
        })
    })

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
