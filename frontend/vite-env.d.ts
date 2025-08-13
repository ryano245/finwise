/// <reference types="vite/client" />

// (optional) strongly type your env vars
interface ImportMetaEnv {
  readonly VITE_API_URL: string
  // add more as needed
}
interface ImportMeta {
  readonly env: ImportMetaEnv
}
