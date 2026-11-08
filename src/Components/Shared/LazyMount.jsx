import { useEffect, useRef, useState } from "react";

// Renders `children` only once the box is near the viewport; until then it
// shows `placeholder` (a skeleton). Saves rendering, images and work for cards
// far down a long list.
const LazyMount = ({ children, placeholder = null, rootMargin = "400px", className = "" }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(() => typeof IntersectionObserver === "undefined");

  useEffect(() => {
    if (visible || !ref.current) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [visible, rootMargin]);

  return (
    <div ref={ref} className={className}>
      {visible ? children : placeholder}
    </div>
  );
};

export default LazyMount;
