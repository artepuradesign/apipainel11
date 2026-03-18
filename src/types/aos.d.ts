// Global type augmentation for AOS (Animate On Scroll)
// Keep this in a .d.ts file to avoid duplicated/partial declarations.

export {};

declare global {
  interface Window {
    AOS?: {
      init?: (params: any) => void;
      refresh?: () => void;
    };
  }
}

