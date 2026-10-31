import { useEffect, useState } from "react";
import { FiMoon, FiSun } from "react-icons/fi";

const getInitialTheme = () => {
  if (typeof window === "undefined") return "dark";
  const storedTheme = window.localStorage.getItem("sams-kitchen-theme");
  return storedTheme === "light" || storedTheme === "dark" ? storedTheme : "dark";
};

const ThemeToggle = () => {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("sams-kitchen-theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((current) => current === "dark" ? "light" : "dark");

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-pressed={theme === "light"}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      className="grid size-10 shrink-0 place-items-center rounded-full border border-base-300 bg-base-200 text-base-content transition-colors hover:border-primary hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      {theme === "dark" ? <FiSun size={17} /> : <FiMoon size={17} />}
    </button>
  );
};

export default ThemeToggle;
