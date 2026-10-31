import { motion, useReducedMotion } from "framer-motion";

/** Fades and lifts its children in once, the first time they scroll into view. */
const Reveal = ({ children, delay = 0, y = 24, as = "div", className = "" }) => {
  const reduceMotion = useReducedMotion();
  const Tag = motion[as] ?? motion.div;

  return (
    <Tag
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay, ease: [0.2, 0.75, 0.25, 1] }}
    >
      {children}
    </Tag>
  );
};

export default Reveal;
