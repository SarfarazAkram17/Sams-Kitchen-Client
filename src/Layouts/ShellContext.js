import { createContext } from "react";

// True when a page is already drawn inside the public or dashboard frame, so a
// loading skeleton must not add a second header, navbar or sidebar.
export const ShellContext = createContext(false);
