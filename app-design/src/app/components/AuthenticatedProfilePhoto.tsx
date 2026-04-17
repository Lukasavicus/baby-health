import { useEffect, useRef, useState, type ReactNode } from "react";
import { authHeaders, resolveMediaSrc } from "@/api/client";

/** Paths served by GET /api/media/* require Authorization; plain <img> cannot send it. */
function needsBearerFetch(url: string): boolean {
  const u = url.trim();
  if (!u) return false;
  if (u.startsWith("data:") || u.startsWith("blob:")) return false;
  if (/^https?:\/\//i.test(u)) return false;
  return u.includes("/api/media/");
}

type Props = {
  photoUrl: string | null;
  alt: string;
  /** Classes on the inner <img> (e.g. w-full h-full object-cover). */
  imgClassName?: string;
  fallback: ReactNode;
};

/**
 * Renders baby profile image. Uses fetch + blob URL when the stored URL is
 * under /api/media/ so the Bearer token is sent (unlike <img src>).
 */
export function AuthenticatedProfilePhoto({
  photoUrl,
  alt,
  imgClassName = "w-full h-full object-cover",
  fallback,
}: Props) {
  const [src, setSrc] = useState<string | null>(null);
  const [showFallback, setShowFallback] = useState(!photoUrl);
  const blobRef = useRef<string | null>(null);

  useEffect(() => {
    if (blobRef.current) {
      URL.revokeObjectURL(blobRef.current);
      blobRef.current = null;
    }
    setSrc(null);
    setShowFallback(!photoUrl);

    if (!photoUrl) return;

    if (!needsBearerFetch(photoUrl)) {
      const direct = resolveMediaSrc(photoUrl);
      setSrc(direct);
      setShowFallback(!direct);
      return;
    }

    const fullUrl = resolveMediaSrc(photoUrl);
    if (!fullUrl) {
      setShowFallback(true);
      return;
    }

    const ac = new AbortController();
    setShowFallback(true);

    void (async () => {
      try {
        const res = await fetch(fullUrl, {
          headers: authHeaders(),
          signal: ac.signal,
        });
        if (!res.ok) return;
        const blob = await res.blob();
        if (ac.signal.aborted) return;
        const objectUrl = URL.createObjectURL(blob);
        blobRef.current = objectUrl;
        setSrc(objectUrl);
        setShowFallback(false);
      } catch {
        if (!ac.signal.aborted) setShowFallback(true);
      }
    })();

    return () => {
      ac.abort();
      if (blobRef.current) {
        URL.revokeObjectURL(blobRef.current);
        blobRef.current = null;
      }
    };
  }, [photoUrl]);

  if (showFallback || !src) return <>{fallback}</>;

  return (
    <img
      src={src}
      alt={alt}
      className={imgClassName}
      onError={() => {
        setShowFallback(true);
        setSrc(null);
      }}
    />
  );
}
