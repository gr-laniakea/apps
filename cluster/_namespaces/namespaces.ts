import { W } from "@/root"
import { Namespace } from "k8ts"

export default W.File("namespaces.yaml", {
    metadata: {},
    *resources$() {
        yield new Namespace("factorio")
        yield new Namespace("flaresolverr")
        yield new Namespace("glances")
        yield new Namespace("homepage")
        yield new Namespace("media")
        yield new Namespace("minecraft")
        yield new Namespace("mumble")
        yield new Namespace("scrutiny")
        yield new Namespace("speedtest-tracker")
        yield new Namespace("syncthing")
        yield new Namespace("thelounge")
        yield new Namespace("wg-portal")
        yield new Namespace("wg-client")
        yield new Namespace("wiki-js")
    }
})
