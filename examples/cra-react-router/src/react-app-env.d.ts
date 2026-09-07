/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DOMAIN: string;
  readonly VITE_CLIENT_ID: string;
  readonly VITE_AUDIENCE: string;
  readonly VITE_API_PORT: number;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
