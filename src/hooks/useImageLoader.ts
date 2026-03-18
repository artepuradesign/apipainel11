import { useState, useEffect } from 'react';

interface UseImageLoaderReturn {
  src: string | null;
  isLoading: boolean;
  error: boolean;
}

export const useImageLoader = (originalSrc: string | undefined): UseImageLoaderReturn => {
  const [src, setSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!originalSrc) {
      setSrc(null);
      setIsLoading(false);
      setError(false);
      return;
    }

    // Suporte a previews locais: data: e blob:
    if (originalSrc.startsWith('data:') || originalSrc.startsWith('blob:')) {
      setSrc(originalSrc);
      setIsLoading(false);
      setError(false);
      return;
    }

    setIsLoading(true);
    setError(false);
    setSrc(null);

    const inIframe = (() => {
      try {
        return window.self !== window.top;
      } catch {
        return true;
      }
    })();

    const getProxyUrl = (url: string) => {
      // Proxy público com CORS liberado
      return `https://images.weserv.nl/?url=${encodeURIComponent(url)}&n=-1`;
    };

    const bustCache = (url: string) => {
      const sep = url.includes('?') ? '&' : '?';
      return `${url}${sep}_ts=${Date.now()}`;
    };

    const tryLoad = (url: string) =>
      new Promise<string>((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(url);
        img.onerror = () => reject(new Error('load failed'));
        img.src = bustCache(url);
      });

    const loadWithFallback = async () => {
      const proxyUrl = getProxyUrl(originalSrc);
      const primary = inIframe ? proxyUrl : originalSrc;
      const secondary = inIframe ? originalSrc : proxyUrl;

      try {
        const ok = await tryLoad(primary);
        setSrc(ok);
        setIsLoading(false);
        return;
      } catch {}

      try {
        const ok2 = await tryLoad(secondary);
        setSrc(ok2);
        setIsLoading(false);
        return;
      } catch {}

      // Último recurso: marcar erro
      setError(true);
      setIsLoading(false);
      setSrc(null);
    };

    loadWithFallback();

    return () => {
      if (src && src.startsWith('blob:')) {
        URL.revokeObjectURL(src);
      }
    };
  }, [originalSrc]);

  return { src, isLoading, error };
};