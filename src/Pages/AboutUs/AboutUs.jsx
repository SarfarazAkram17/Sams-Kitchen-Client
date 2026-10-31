import { Link } from "react-router";
import { createElement } from "react";
import { FiArrowUpRight, FiClock, FiHeart, FiMapPin } from "react-icons/fi";

const AboutUs = () => {
  return (
    <section className="mx-auto w-full max-w-[1240px] px-4 sm:px-6 mb-16">
      <header className="relative overflow-hidden rounded-[2rem] border border-base-300 bg-base-200 px-6 py-12 sm:px-10 sm:py-16 lg:px-16">
        <div className="pointer-events-none absolute -right-12 -top-16 size-64 rounded-full border border-primary/20 sm:size-80" />
        <div className="pointer-events-none absolute -right-2 -top-6 size-48 rounded-full border border-secondary/20 sm:size-64" />
        <div className="relative max-w-3xl">
          <p className="mb-5 text-xs font-bold uppercase tracking-[.2em] text-primary">
            A little kitchen with a lot of heart
          </p>
          <h1 className="max-w-2xl text-5xl leading-[.98] text-base-content sm:text-6xl lg:text-7xl">
            The familiar taste of <em>home.</em>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-base-content/70 sm:text-lg">
            Sam’s Kitchen is an independent neighborhood restaurant in
            Bangladesh. We cook the dishes we grew up with, fresh in small
            batches and ready for your table.
          </p>
          <Link
            to="/allFoods"
            className="btn btn-primary mt-8 inline-flex min-h-12 px-6"
          >
            Meet the menu <FiArrowUpRight size={17} />
          </Link>
        </div>
      </header>

      <div className="grid gap-8 py-12 sm:py-16 lg:grid-cols-[.82fr_1.18fr] lg:gap-16">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.2em] text-primary">
            Why we cook
          </p>
          <h2 className="mt-4 max-w-md font-display text-4xl leading-tight sm:text-5xl">
            Good food should feel like it knows you.
          </h2>
        </div>
        <div className="space-y-5 text-sm leading-7 text-base-content/70 sm:text-base">
          <p>
            There is comfort in a properly cooked plate of khichuri, a generous
            serving of biryani, or the first spoonful of a curry that has had
            time to come together. That everyday comfort is what we want to
            bring to your doorstep.
          </p>
          <p>
            We keep our menu rooted in Bangladeshi favorites, use ingredients
            thoughtfully, and make each order when it comes in. No fuss, no
            shortcuts that take away the good part—just a kitchen that cares
            about what leaves it.
          </p>
        </div>
      </div>

      <div className="grid gap-4 border-y border-base-300 py-8 sm:grid-cols-3 sm:gap-8 sm:py-10">
        {[
          {
            icon: FiHeart,
            title: "Made with care",
            copy: "Familiar recipes, cooked fresh and packed with attention.",
          },
          {
            icon: FiClock,
            title: "Fresh, not waiting",
            copy: "We prepare your meal after you order, not hours before.",
          },
          {
            icon: FiMapPin,
            title: "Close to home",
            copy: "A local kitchen serving the people and places around us.",
          },
        ].map(({ icon: Icon, title, copy }) => (
          <article key={title} className="flex gap-4 py-2">
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
              {createElement(Icon, { size: 20 })}
            </span>
            <div>
              <h3 className="font-semibold text-base-content">{title}</h3>
              <p className="mt-1 text-sm leading-6 text-base-content/65">
                {copy}
              </p>
            </div>
          </article>
        ))}
      </div>

      <div className="my-12 flex flex-col justify-between gap-6 rounded-3xl border border-base-300 bg-base-200 p-6 sm:my-16 sm:flex-row sm:items-center sm:p-9">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.18em] text-primary">
            Come hungry
          </p>
          <h2 className="mt-2 font-display text-3xl sm:text-4xl">
            There’s always room at our table.
          </h2>
        </div>
        <Link
          to="/allFoods"
          className="btn btn-outline w-fit rounded-full border-base-300 px-5 hover:border-primary hover:bg-primary hover:text-primary-content"
        >
          Browse the menu <FiArrowUpRight size={16} />
        </Link>
      </div>
    </section>
  );
};

export default AboutUs;
