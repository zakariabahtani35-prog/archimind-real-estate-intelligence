/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_NAME: string;
  readonly VITE_API_URL: string;
  readonly VITE_USER_AVATAR_URL: string;
  readonly VITE_ENABLE_MOCKS: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
