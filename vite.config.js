"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vite_1 = require("vite");
const plugin_react_1 = __importDefault(require("@vitejs/plugin-react"));
const path_1 = __importDefault(require("path"));
exports.default = (0, vite_1.defineConfig)({
    root: './client',
    plugins: [(0, plugin_react_1.default)()],
    server: {
        port: 3500,
        host: true,
        hmr: {
            port: 24679
        },
        proxy: {
            '/api': {
                target: 'http://localhost:3501',
                changeOrigin: true
            }
        }
    },
    resolve: {
        alias: {
            '@': path_1.default.resolve(__dirname, './src'),
            '@components': path_1.default.resolve(__dirname, './src/components'),
            '@utils': path_1.default.resolve(__dirname, './src/utils'),
            '@hooks': path_1.default.resolve(__dirname, './src/hooks'),
            '@contexts': path_1.default.resolve(__dirname, './src/contexts'),
            '@types': path_1.default.resolve(__dirname, './src/types')
        },
    },
    build: {
        outDir: 'dist-evofithealthprotocol',
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom', 'react-router-dom'],
                    pdf: ['jspdf', 'html2canvas']
                }
            }
        }
    },
    define: {
        'process.env': {}
    }
});
//# sourceMappingURL=vite.config.js.map