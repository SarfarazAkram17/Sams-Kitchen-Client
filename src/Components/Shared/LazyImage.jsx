import { useEffect, useRef, useState } from "react";
import { FiImage } from "react-icons/fi";

// Image that loads when it nears the viewport, shows a shimmer until it has
// loaded, then fades in. Put it inside a `relative` box with a fixed size or
// aspect ratio so the page does not jump. `priority` loads it right away.
// If the file is missing or broken, the box shows a neutral "no image" panel
// that fills the same space, so the layout stays as designed.
const LazyImage = ({ src, alt = "", className = "", priority = false, ...props }) => {
  const imageRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  // An image that was already cached can finish before React attaches onLoad.
  useEffect(() => {
    if (imageRef.current?.complete && imageRef.current.naturalWidth > 0) setLoaded(true);
  }, [src]);

  // A new source gets a fresh chance to load.
  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (failed || !src) {
    return (
      <span
        role="img"
        aria-label={alt ? `${alt} (image unavailable)` : "Image unavailable"}
        className="@container absolute inset-0 grid place-items-center overflow-hidden bg-base-200 text-base-content/45"
      >
        <span className="flex flex-col items-center gap-1 px-2 text-center">
          <FiImage className="size-[clamp(1rem,22cqw,2.25rem)]" aria-hidden="true" />
          <span className="hidden text-[11px] font-semibold uppercase tracking-wide @[7rem]:block">No image</span>
        </span>
      </span>
    );
  }

  return (
    <>
      {!loaded && <span aria-hidden="true" className="skeleton-block absolute inset-0 rounded-none" />}
      <img
        ref={imageRef}
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        className={`${className} transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
        {...props}
      />
    </>
  );
};

export default LazyImage;
