import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";

// Tilts its children in 3D towards the pointer. Children can sit at different
// depths with transform: translateZ(...). Plain div when motion is reduced.
const Tilt3D = ({ children, className = "", max = 8 }) => {
  const reduceMotion = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const spring = { stiffness: 140, damping: 18, mass: 0.6 };
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [max, -max]), spring);
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-max, max]), spring);

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  const handleMove = (event) => {
    const box = event.currentTarget.getBoundingClientRect();
    x.set((event.clientX - box.left) / box.width - 0.5);
    y.set((event.clientY - box.top) / box.height - 0.5);
  };

  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      style={{ rotateX, rotateY, transformPerspective: 1100, transformStyle: "preserve-3d" }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default Tilt3D;
