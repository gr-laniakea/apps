import { W } from "@/root"

export default W.Scope("cluster")
    .File("namespaces.yaml")
    .Resources(function* FILE(FILE) {
        yield FILE.Namespace("glances")
        yield FILE.Namespace("media")
        yield FILE.Namespace("mumble")
        yield FILE.Namespace("syncthing")
        yield FILE.Namespace("scrutiny")
        yield FILE.Namespace("thelounge")
        yield FILE.Namespace("factorio")
        yield FILE.Namespace("minecraft")
        yield FILE.Namespace("wiki-js")
        yield FILE.Namespace("storage-migration")
    })
