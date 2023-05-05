import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import monkey, { cdn } from 'vite-plugin-monkey'
import path from 'path'
// https://vitejs.dev/config/
export default defineConfig(() => {
    const monkeyOption = monkey({
        entry: 'src/main.tsx',
        userscript: {
            name: '哔站倍速插件',
            version: '1.4.1',
            description: '哔站播放视频倍速,支持按钮、键盘X,C及滚轮控制',
            icon: 'https://github.com/roo12589/my-monkey-scripts/blob/master/assets/bili-favicon.ico?raw=true',
            namespace: 'github/roo12589',
            author: 'roo12589',
            match: [
                '*://*.bilibili.com/video/*',
                /* 测试用 */
                // '*://*/*',
            ],
        },
        build: {
            externalGlobals: {
                react: cdn.jsdelivr('React', 'umd/react.production.min.js'),
                'react-dom': cdn.jsdelivr('ReactDOM', 'umd/react-dom.production.min.js'),
            },
        },
    })
    return {
        plugins: [react(), monkeyOption],
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
            },
        },
        server: {
            port: 3001,
        },
    }
})
