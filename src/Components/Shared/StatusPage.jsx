import { Link } from "react-router";
import logo from "../../assets/images/logo.png";
import Tilt3D from "../Auth/Tilt3D";
import ThemeToggle from "./ThemeToggle";

// Full-page notice with extruded numerals, used for 404 and 403.
const StatusPage = ({ code, title, description, children }) => (
  <div className="relative grid min-h-dvh place-items-center overflow-hidden px-4 py-24">
    <header className="absolute inset-x-0 top-0 flex items-center justify-between px-4 py-4 sm:px-8 sm:py-6">
      <Link to="/" className="flex items-center gap-3 rounded-xl">
        <img src={logo} alt="" className="h-10 w-auto object-contain" />
        <span className="font-display text-lg font-semibold">Sam’s Kitchen</span>
      </Link>
      <ThemeToggle />
    </header>

    <main className="stage text-center">
      <p className="sr-only">Error {code}</p>
      <Tilt3D className="flex justify-center gap-1 sm:gap-3" max={9}>
        {code.split("").map((digit, index) => (
          <span key={index} className="digit-3d" aria-hidden="true">
            {digit}
          </span>
        ))}
      </Tilt3D>
      <h1 className="mt-12 text-3xl sm:text-4xl">{title}</h1>
      <p className="mx-auto mt-3 max-w-md leading-relaxed text-base-content/70">{description}</p>
      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">{children}</div>
    </main>
  </div>
);

export default StatusPage;
