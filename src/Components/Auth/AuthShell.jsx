import { Link } from "react-router";
import logo from "../../assets/images/logo.png";
import ThemeToggle from "../Shared/ThemeToggle";
import OrderScene from "./OrderScene";

const Brand = ({ className = "" }) => (
  <Link
    to="/"
    className={`flex w-fit items-center gap-3 rounded-xl ${className}`}
  >
    <img src={logo} alt="" className="h-11 w-auto object-contain" />
    <span className="font-display text-xl font-semibold tracking-tight">
      Sam’s Kitchen
    </span>
  </Link>
);

// Shared frame for sign in, register and onboarding: a brand showcase beside the form.
// The footer link sits right under the card (not pinned to the bottom of the page),
// so the gap is the same on every auth page whatever the card's height.
const AuthShell = ({ title, subtitle, children, footer, wide = false }) => (
  <div className="auth-page">
    <aside className="auth-aside hidden flex-col justify-between p-10 lg:flex xl:p-14">
      <Brand />
      <OrderScene />
      <div>
        <p className="max-w-md font-display text-3xl leading-tight xl:text-4xl">
          Cooked to order, at your door while it’s hot.
        </p>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-base-content/70">
          Home-style Bangladeshi meals from one kitchen, delivered by riders who
          know your area.
        </p>
      </div>
    </aside>

    <div className="flex min-w-0 flex-col px-4 py-5 sm:px-8">
      <header className="flex items-center justify-between">
        <Brand className="lg:invisible" />
        <ThemeToggle />
      </header>

      <main className="flex flex-1 items-center justify-center py-8">
        <div className={`w-full ${wide ? "max-w-2xl" : "max-w-md"}`}>
          <section className="auth-card">
            <h1 className="text-3xl leading-tight sm:text-4xl">{title}</h1>
            {subtitle && (
              <p className="mt-2 text-sm leading-relaxed text-base-content/70">
                {subtitle}
              </p>
            )}
            <div className="mt-7">{children}</div>
          </section>

          {footer && (
            <footer className="mt-6 text-center text-sm text-base-content/70">
              {footer}
            </footer>
          )}
        </div>
      </main>
    </div>
  </div>
);

export default AuthShell;