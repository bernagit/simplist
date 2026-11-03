import { networkInterfaces } from "node:os";

/** Virtual interfaces (Docker, VPNs, VMs): not reachable from a phone on the Wi-Fi. */
const VIRTUAL = /^(docker|br-|veth|virbr|vmnet|vboxnet|tun|tap|wg|tailscale|zt|lo)/;

/** IPv4 addresses of this machine on the local network, e.g. ["192.168.1.121"]. */
export function lanAddresses() {
  return Object.entries(networkInterfaces())
    .filter(([name]) => !VIRTUAL.test(name))
    .flatMap(([, addresses]) => addresses ?? [])
    .filter((address) => address.family === "IPv4" && !address.internal)
    .map((address) => address.address);
}
