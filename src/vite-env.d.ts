/// <reference types="vite/client" />
/// <reference types="vite-plugin-monkey/client" />
//// <reference types="vite-plugin-monkey/global" />

declare global {
    interface Window {
        pluginNotification: HTMLElement
    }
}

export {}
