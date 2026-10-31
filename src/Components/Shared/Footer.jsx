import { Link, NavLink } from "react-router";
import { FiArrowUpRight, FiMapPin } from "react-icons/fi";
import logo from "../../assets/images/logo.png";

const Footer = () => {
  const linkClass = "shared-route-link w-fit text-sm px-4";
  return (
    <footer className="border-t border-base-300 bg-base-200">
      <div className="mx-auto grid max-w-[1500px] gap-10 px-5 py-12 sm:px-8 md:grid-cols-[1.4fr_.8fr_1fr] md:py-16">
        <div>
          <Link to="/" className="flex w-fit items-center gap-2">
            <img
              src={logo}
              alt="Sam's Kitchen"
              className="size-12 object-contain"
            />
            <span className="text-lg font-bold tracking-tight text-base-content">
              Sam’s Kitchen
            </span>
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-6 text-base-content/60">
            A neighborhood kitchen in Bangladesh, cooking familiar favorites
            fresh and bringing them straight to your door.
          </p>
        </div>

        <div>
          <p className="mb-4 text-xs font-bold uppercase tracking-[.16em] text-primary">
            Explore
          </p>
          <nav className="grid gap-3">
            <NavLink to="/" end className={linkClass}>
              Home
            </NavLink>
            <NavLink to="/about" className={linkClass}>
              About Us
            </NavLink>
            <NavLink to="/allFoods" className={linkClass}>
              All Foods
            </NavLink>
            <NavLink to="/offers" className={linkClass}>
              Offers
            </NavLink>
            <NavLink to="/register" className={linkClass}>
              Create account
            </NavLink>
            <NavLink to="/login" className={linkClass}>
              Sign in
            </NavLink>
          </nav>
        </div>

        <div>
          <p className="mb-4 text-xs font-bold uppercase tracking-[.16em] text-primary">
            Delivery coverage
          </p>
          <div className="grid gap-3 text-sm text-base-content/65">
            <p className="flex items-center gap-2">
              <FiMapPin className="shrink-0 text-primary" /> Bangladesh
            </p>
            <p className="leading-6">
              Choose your region, district, and thana at checkout to confirm
              delivery coverage.
            </p>
          </div>
          <Link
            to="/allFoods"
            className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-primary hover:gap-3 transition-all"
          >
            Find your next favorite <FiArrowUpRight />
          </Link>
        </div>
      </div>
      <div className="border-t border-base-300">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-2 px-5 py-4 text-xs text-base-content/50 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <span>
            © {new Date().getFullYear()} Sam’s Kitchen. Made with care in
            Bangladesh.
          </span>
          <span>One kitchen. Good food, close to home.</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
