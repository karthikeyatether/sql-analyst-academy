/// <reference types="vite/client" />
declare module "monaco-editor/esm/vs/*";
declare module "virtual:pwa-register" {
  export function registerSW(options?: {
    immediate?: boolean;
    onNeedRefresh?: () => void;
    onOfflineReady?: () => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onRegistered?: (registration: any) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onRegisterError?: (error: any) => void;
  }): (reloadPage?: boolean) => Promise<void>;
}
