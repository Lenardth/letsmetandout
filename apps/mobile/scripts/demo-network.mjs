import { networkInterfaces } from 'node:os';
import { isIP } from 'node:net';
export function demoHost() {
  const configured = process.env.SAFEMEET_DEMO_HOST;
  if (configured) {
    if (isIP(configured) !== 4 || configured === '127.0.0.1' || configured === '0.0.0.0') throw new Error('SAFEMEET_DEMO_HOST must be your Mac’s reachable IPv4 address.');
    return configured;
  }
  const interfaces = networkInterfaces();
  const preferred = interfaces.en0 || [];
  const candidates = [...preferred, ...Object.values(interfaces).flat()];
  const address = candidates.find((item) => item.family === 'IPv4' && !item.internal && /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(item.address));
  if (!address) throw new Error('Connect your Mac to Wi-Fi, or set SAFEMEET_DEMO_HOST to its LAN IPv4 address.');
  return address.address;
}
