import { useState } from "react";

const initialsOf = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?";

// Round photo with initials when there is no photo or it fails to load.
const Avatar = ({ src, name = "", className = "size-11", textClassName = "text-sm" }) => {
  const [failed, setFailed] = useState(false);

  return (
    <span
      className={`relative inline-grid shrink-0 place-items-center overflow-hidden rounded-full bg-primary/15 font-bold text-primary ${textClassName} ${className}`}
    >
      {src && !failed ? (
        <img
          src={src}
          alt={name}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className="size-full object-cover"
        />
      ) : (
        <span aria-label={name || "No photo"}>{initialsOf(name)}</span>
      )}
    </span>
  );
};

export default Avatar;
