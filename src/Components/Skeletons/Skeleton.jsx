// A shimmering placeholder block. Size and shape come from className.
export const Skeleton = ({ className = "" }) => (
  <div aria-hidden="true" className={`skeleton-block ${className}`} />
);

// Announces the loading state once to screen readers and wraps a skeleton page.
export const SkeletonRegion = ({ label = "Loading", className = "", children }) => (
  <div role="status" aria-busy="true" aria-live="polite" className={className}>
    <span className="sr-only">{label}</span>
    {children}
  </div>
);
