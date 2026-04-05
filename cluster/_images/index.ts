import { ImageRegistry } from "@k8ts/instruments"

export namespace Images {
    namespace Authors {
        namespace Host {
            export const docker = ImageRegistry("docker.io")
            export const ghcr = ImageRegistry("ghcr.io")
            export const lscr = ImageRegistry("lscr.io")
        }
        export const nicolargo = Host.docker.namespace("nicolargo")
        export const linuxserver = Host.lscr.namespace("linuxserver")
        export const mumblevoip = Host.docker.namespace("mumblevoip")
        export const analogj = Host.ghcr.namespace("analogj")
        export const thelounge = Host.ghcr.namespace("thelounge")
        export const requarks = Host.docker.namespace("requarks")
        export const syncthing = Host.docker.namespace("syncthing")
        export const fallenbagel = Host.docker.namespace("fallenbagel")
        export const itzg = Host.docker.namespace("itzg")
        export const laniakea = Host.ghcr.namespace("gr-laniakea")
        export const ajmandourah = Host.ghcr.namespace("ajmandourah")
        export const homepage = Host.ghcr.namespace("gethomepage")
        export const flaresolverr = Host.ghcr.namespace("flaresolverr")
        export const wgPortal = Host.docker.namespace("wgportal")
        export const wgEasy = Host.ghcr.namespace("wg-easy")
        export const _ = Host.docker.namespace("_")
    }

    export const factorio = Authors.laniakea.repo("factorio-image").tag("latest")
    export const flaresolverr = Authors.flaresolverr.repo("flaresolverr").tag("latest")
    export const glances = Authors.nicolargo.repo("glances").tag("latest-full")
    export const homepage = Authors.homepage.repo("homepage").tag("latest")
    export const sabnzbd = Authors.linuxserver.repo("sabnzbd").tag("latest")
    export const syncthing = Authors.linuxserver.repo("syncthing").tag("latest")
    export const syncthingDiscovery = Authors.syncthing.repo("discosrv").tag("latest")
    export const transmission = Authors.linuxserver.repo("transmission").tag("latest")
    export const mumble = Authors.mumblevoip.repo("mumble-server").tag("latest")
    export const scrutiny = Authors.analogj.repo("scrutiny").tag("master-omnibus")
    export const sonarr = Authors.linuxserver.repo("sonarr").tag("latest")
    export const radarr = Authors.linuxserver.repo("radarr").tag("latest")
    export const bazarr = Authors.linuxserver.repo("bazarr").tag("latest")
    export const speedtestTracker = Authors.linuxserver.repo("speedtest-tracker").tag("latest")
    export const bazarrSync = Authors.ajmandourah.repo("bazarr-sync").tag("latest")
    export const jellyfin = Authors.linuxserver.repo("jellyfin").tag("latest")
    export const prowlarr = Authors.linuxserver.repo("prowlarr").tag("latest")
    export const jackett = Authors.linuxserver.repo("jackett").tag("latest")
    export const thelounge = Authors.thelounge.repo("thelounge").tag("latest")
    export const wgPortal = Authors.wgPortal.repo("wg-portal").tag("latest")
    export const wgEasy = Authors.wgEasy.repo("wg-easy").tag("15")

    export const wiki_js = Authors.requarks.repo("wiki").tag("latest")
    export const jellyseer = Authors.fallenbagel.repo("jellyseerr").tag("latest")
    export const minecraft = Authors.itzg.repo("minecraft-server").tag("latest")
    export const busybox = Authors._.repo("busybox").tag("latest")
}
