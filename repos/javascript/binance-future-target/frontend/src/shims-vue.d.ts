declare module '*.vue' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent<
    Record<string, unknown>,
    Record<string, unknown>,
    unknown
  >
  export default component
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
declare interface Window {
  // extend the window
}
