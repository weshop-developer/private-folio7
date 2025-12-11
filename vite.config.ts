import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import devServer from '@hono/vite-dev-server'

export default defineConfig({
    plugins: [
        react(),
        devServer({
            entry: 'src/index.ts', // Hono入口
            exclude: [ // Vite负责这部分静态资源，不经Hono处理
                /^\/assets\/.+/,
                /^\/favicon\.ico/,
                /^\/client\/.+/,
                /^\/node_modules\/.+/,
                /^\/@.+/,
            ],
            injectClientScript: false, // 避免与React冲突
        }),
    ],
    build: {
        outDir: 'dist',
        emptyOutDir: true,
    },
})
