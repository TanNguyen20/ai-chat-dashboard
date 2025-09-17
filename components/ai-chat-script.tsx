"use client"

import React, { useEffect, useMemo, useRef, useState } from "react";

const DEFAULT_SRC =
  "https://cdn.jsdelivr.net/gh/TanNguyen20/ai-chatbot-ui@build/ai-chat-ui.js";
const SCRIPT_ID = "ai-chat-ui-loader";

// Keep a single shared load Promise on the window so multiple components coordinate.
declare global {
  interface Window {
    __aiChatReadyPromise?: Promise<void>;
  }
}

function loadAiChatScript(src: string = DEFAULT_SRC): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();

  // If custom element already defined, we're done.
  if (window.customElements && window.customElements.get("ai-chat")) {
    return Promise.resolve();
  }

  // Reuse the same in-flight promise if present.
  if (window.__aiChatReadyPromise) return window.__aiChatReadyPromise;

  window.__aiChatReadyPromise = new Promise<void>((resolve, reject) => {
    // If a script with our ID exists, hook into its load/error events or
    // poll for the custom element definition.
    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      if ((existing as any)._loaded) return resolve();
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Failed to load ai-chat script.")));
      // Fallback: if custom element appears, resolve.
      const check = () => {
        if (window.customElements.get("ai-chat")) resolve();
        else setTimeout(check, 50);
      };
      check();
      return;
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = src;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      (script as any)._loaded = true;
      resolve();
    };
    script.onerror = () => reject(new Error(`Failed to load ${src}`));

    document.head.appendChild(script);
  });

  return window.__aiChatReadyPromise;
}

export type AiChatProps = {
  /** Your API key; mapped to the `api_key` attribute expected by the web component */
  apiKey: string;
  /** Override the loader script URL if needed */
  src?: string;
  /** Optional placeholder while the script loads */
  fallback?: React.ReactNode;
  /** Called once the custom element definition is ready and attached */
  onReady?: (el: HTMLElement) => void;
  /** Called if the loader script fails */
  onError?: (error: unknown) => void;
  /** Standard DOM props */
  className?: string;
  style?: React.CSSProperties;
  /** Any other attributes supported by <ai-chat> can be passed through */
  [key: string]: any;
};

const AiChat: React.FC<AiChatProps> = ({
  apiKey,
  src = DEFAULT_SRC,
  fallback = null,
  onReady,
  onError,
  className,
  style,
  ...rest
}) => {
  const ref = useRef<HTMLElement | null>(null);
  const [ready, setReady] = useState<boolean>(false);

  // Separate props that should go on the custom element; exclude internal ones.
  const elementAttrs = useMemo(() => {
    const attrs: Record<string, any> = { ...rest };
    // Map React-style camelCase to the attribute the component expects if needed.
    // For api key specifically, force the attribute name `api_key`.
    attrs["api_key"] = apiKey;
    return attrs;
  }, [rest, apiKey]);

  useEffect(() => {
    let mounted = true;
    loadAiChatScript(src)
      .then(() => {
        if (!mounted) return;
        setReady(true);
      })
      .catch((e) => {
        if (onError) onError(e);
        // keep ready=false; render fallback
      });
    return () => {
      mounted = false;
    };
  }, [src, onError]);

  useEffect(() => {
    if (!ready || !ref.current) return;
    // Ensure non-primitive values (objects/functions) are set as properties,
    // since React only passes strings/booleans as attributes to custom elements.
    const el = ref.current as any;
    Object.entries(elementAttrs).forEach(([k, v]) => {
      if (typeof v === "object" || typeof v === "function") {
        el[k] = v;
      }
    });
    onReady?.(ref.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, elementAttrs]);

  // SSR-safe: during SSR or before script load, render a lightweight placeholder.
  if (typeof window === "undefined" || !ready) {
    return (
      <div className={className} style={{ width: "100%", height: "100%", ...style }}>
        {fallback}
      </div>
    );
  }

  // Once ready, render the actual web component. Unknown attributes are passed through.
  // @ts-expect-error: TS doesn't know about the custom element tag name, but the browser does.
  return <ai-chat ref={ref} className={className} style={style} {...elementAttrs} />;
};

export default AiChat;
