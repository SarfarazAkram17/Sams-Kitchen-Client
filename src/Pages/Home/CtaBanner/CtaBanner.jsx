import { Link } from "react-router";
import { FiArrowUpRight } from "react-icons/fi";
import useAuth from "../../../Hooks/useAuth";
import Reveal from "../../../Components/Shared/Reveal";

const CtaBanner = () => {
  const { user } = useAuth();

  return (
    <section className="px-4 py-16 sm:py-24" aria-labelledby="cta-title">
      <Reveal>
        <div className="relative isolate mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-primary px-6 py-14 text-center text-primary-content sm:rounded-[2.5rem] sm:px-12 sm:py-20">
          <div className="pointer-events-none absolute -left-20 -top-24 -z-10 size-80 rounded-full bg-primary-content/10 blur-3xl" aria-hidden="true" />
          <div className="pointer-events-none absolute -bottom-28 -right-16 -z-10 size-96 rounded-full bg-secondary/30 blur-3xl" aria-hidden="true" />
          <p className="text-xs font-bold uppercase tracking-[.2em] opacity-80">Hungry?</p>
          <h2 id="cta-title" className="font-display mx-auto mt-4 max-w-3xl text-4xl leading-[1.05] sm:text-6xl">
            Your table is waiting. <span className="italic">Let’s cook.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 opacity-85 sm:text-base">
            Browse the menu, pick what you love, and we’ll have it on its way
            while it’s still fresh.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link to="/allFoods" className="btn min-h-13 border-0 bg-primary-content px-7 text-base text-primary hover:bg-primary-content/90">
              Order now <FiArrowUpRight aria-hidden="true" />
            </Link>
            <Link
              to={user ? "/dashboard" : "/register"}
              className="btn min-h-13 border-primary-content/40 bg-transparent px-7 text-base text-primary-content hover:border-primary-content hover:bg-primary-content/10"
            >
              {user ? "Go to my dashboard" : "Create an account"}
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
};

export default CtaBanner;
