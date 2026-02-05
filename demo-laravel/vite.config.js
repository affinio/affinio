import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import tailwindcss from '@tailwindcss/vite';

const devHost = process.env.VITE_DEV_SERVER_HOST ?? '0.0.0.0';
const devPort = Number(process.env.VITE_DEV_SERVER_PORT ?? 5173);
const devOrigin = process.env.VITE_DEV_SERVER_ORIGIN;
const hmrHost = process.env.VITE_HMR_HOST ?? 'localhost';
const hmrPort = Number(process.env.VITE_HMR_PORT ?? devPort);
const hmrProtocol = process.env.VITE_HMR_PROTOCOL ?? 'ws';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.js'],
            refresh: true,
        }),
        tailwindcss(),
    ],
    resolve: {
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
