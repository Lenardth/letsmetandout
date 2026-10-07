import { spawn } from 'node:child_process';
import { demoHost } from './demo-network.mjs';
const host = demoHost();
console.log(`iPhone demo: Mac address ${host}. Keep the LAN demo emulators running and use the same Wi-Fi.`);
const child = spawn('npx', ['expo', 'start', '--go', '--lan', '--clear', ...process.argv.slice(2)], {
  stdio: 'inherit', shell: false,
  env: { ...process.env, EXPO_PUBLIC_FIREBASE_USE_EMULATORS: 'true', EXPO_PUBLIC_FIREBASE_EMULATOR_HOST: host, REACT_NATIVE_PACKAGER_HOSTNAME: host },
});
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
child.on('error', (error) => { console.error(error.message); process.exitCode = 1; });
child.on('exit', (code) => { process.exitCode = code ?? 1; });
