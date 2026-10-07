import { existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
const config = process.argv.includes('--lan') ? 'firebase.demo.lan.json' : 'firebase.demo.json';
const args = ['-y', 'firebase-tools@latest', 'emulators:start', '--only', 'auth,firestore,storage', '--project', 'demo-safemeet-login', '--config', config, '--export-on-exit', '.firebase-demo'];
if (existsSync('.firebase-demo/firebase-export-metadata.json')) args.push('--import', '.firebase-demo');
const child = spawn('npx', args, { stdio: 'inherit', shell: false });
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
child.on('error', (error) => { console.error(error.message); process.exitCode = 1; });
child.on('exit', (code) => { process.exitCode = code ?? 1; });
