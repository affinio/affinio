import { defineConfig } from 'vite';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import laravel from 'laravel-vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import { createWorkspaceAliases } from '../config/workspace-aliases';

const devHost = process.env.VITE_DEV_SERVER_HOST ?? '0.0.0.0';
const devPort = Number(process.env.VITE_DEV_SERVER_PORT ?? 5173);
const devOrigin = process.env.VITE_DEV_SERVER_ORIGIN;
const hmrHost = process.env.VITE_HMR_HOST ?? 'localhost';
const hmrPort = Number(process.env.VITE_HMR_PORT ?? devPort);
const hmrProtocol = process.env.VITE_HMR_PROTOCOL ?? 'ws';
const rootPackage = JSON.parse(
    readFileSync(resolve(__dirname, '..', 'package.json'), 'utf-8')
);
const affinoVersion = rootPackage?.version ?? 'dev';

export default defineConfig({
    define: {
        __AFFINO_VERSION__: JSON.stringify(affinoVersion),
    },
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.js'],
            refresh: true,
        }),
        tailwindcss(),
    ],
    resolve: {
        alias: createWorkspaceAliases(import.meta.url, {
            '@': 'demo-laravel/resources/js',
        }),
        dedupe: ['@affino/overlay-kernel'],
        preserveSymlinks: true,
    },
    server: {
        host: true,
        port: devPort,
        strictPort: true,
        origin: devOrigin,
        hmr: {
            host: hmrHost,
            port: hmrPort,
            protocol: hmrProtocol,
        },
        watch: {
            ignored: ['**/storage/framework/views/**'],
        },
    },
});
