import { Image } from "@k8ts/instruments"

export namespace Images {
    namespace Authors {
        namespace Host {
            export const docker = Image.host("docker.io")
            export const ghcr = Image.host("ghcr.io")
            export const lscr = Image.host("lscr.io")
        }
        export const nicolargo = Host.docker.author("nicolargo")
        export const linuxserver = Host.lscr.author("linuxserver")
        export const mumblevoip = Host.docker.author("mumblevoip")
        export const analogj = Host.ghcr.author("analogj")
        export const thelounge = Host.ghcr.author("thelounge")
        export const requarks = Host.docker.author("requarks")
        export const syncthing = Host.docker.author("syncthing")
        export const fallenbagel = Host.docker.author("fallenbagel")
        export const itzg = Host.docker.author("itzg")
        export const laniakea = Host.ghcr.author("gr-laniakea")
        export const ajmandourah = Host.ghcr.author("ajmandourah")
        export const homepage = Host.ghcr.author("gethomepage")
        export const flaresolverr = Host.ghcr.author("flaresolverr")
        export const _ = Host.docker.author("_")
    }

    export const factorio = Authors.laniakea.image("factorio-image").tag("latest")
    export const flaresolverr = Authors.flaresolverr.image("flaresolverr").tag("latest")
    export const glances = Authors.nicolargo.image("glances").tag("latest-full")
    export const homepage = Authors.homepage.image("homepage").tag("latest")
    export const sabnzbd = Authors.linuxserver.image("sabnzbd").tag("latest")
    export const syncthing = Authors.linuxserver.image("syncthing").tag("latest")
    export const syncthingDiscovery = Authors.syncthing.image("discosrv").tag("latest")
    export const transmission = Authors.linuxserver.image("transmission").tag("latest")
    export const mumble = Authors.mumblevoip.image("mumble-server").tag("latest")
    export const scrutiny = Authors.analogj.image("scrutiny").tag("master-omnibus")
    export const sonarr = Authors.linuxserver.image("sonarr").tag("latest")
    export const radarr = Authors.linuxserver.image("radarr").tag("latest")
    export const bazarr = Authors.linuxserver.image("bazarr").tag("latest")
    export const speedtestTracker = Authors.linuxserver.image("speedtest-tracker").tag("latest")
    export const bazarrSync = Authors.ajmandourah.image("bazarr-sync").tag("latest")
    export const jellyfin = Authors.linuxserver.image("jellyfin").tag("latest")
    export const prowlarr = Authors.linuxserver.image("prowlarr").tag("latest")
    export const jackett = Authors.linuxserver.image("jackett").tag("latest")
    export const thelounge = Authors.thelounge.image("thelounge").tag("latest")

    export const wiki_js = Authors.requarks.image("wiki").tag("latest")
    export const jellyseer = Authors.fallenbagel.image("jellyseerr").tag("latest")
    export const minecraft = Authors.itzg.image("minecraft-server").tag("latest")
    export const busybox = Authors._.image("busybox").tag("latest")
}
