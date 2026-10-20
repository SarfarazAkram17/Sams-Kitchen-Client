import { Link } from "react-router";
import { FiArrowUpRight, FiClock, FiMapPin, FiStar } from "react-icons/fi";

// Light-only: no dark: variants and no theme tokens (base-100, base-content,
// primary), so the banner looks the same even when the site is in dark mode.
const Banner = () => (
  <section className="relative isolate overflow-hidden rounded-[2rem] bg-[#f6efe5] text-[#241f1a]">
    <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#f6c47e]/30 blur-3xl" />
    <div className="absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-[#e8a753]/20 blur-3xl" />
    <div className="relative grid min-h-[540px] items-center gap-8 px-6 py-12 sm:px-10 lg:grid-cols-[1.02fr_.98fr] lg:px-16 lg:py-14">
      <div className="relative z-10 max-w-xl">
        <span className="inline-flex items-center gap-2 rounded-full border border-[#d94b27]/20 bg-white/80 px-4 py-2 text-xs font-bold uppercase tracking-[.16em] text-[#d94b27] shadow-sm">
          <span className="h-2 w-2 rounded-full bg-[#d94b27]" />
          Your neighborhood kitchen
        </span>
        <h1 className="font-display mt-6 text-5xl font-extrabold leading-[1.04] tracking-[-.055em] sm:text-6xl lg:text-[4.4rem]">
          Good food.
          <br />
          <span className="text-[#d94b27]">Good mood.</span>
        </h1>
        <p className="mt-6 max-w-lg text-base leading-7 text-[#60594f] sm:text-lg">
          Freshly made favorites from Sam’s Kitchen, brought right to your door.
          Order something lovely today.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/allFoods"
            className="btn h-13 rounded-full border-0 bg-[#d94b27] px-7 text-white shadow-lg shadow-[#d94b27]/20 hover:bg-[#d94b27]/90"
          >
            Explore the menu <FiArrowUpRight size={18} />
          </Link>
          <Link
            to="/offers"
            className="btn h-13 rounded-full border border-[#241f1a]/15 bg-white/65 px-7 text-[#241f1a] hover:border-[#d94b27]/40 hover:bg-white"
          >
            Today’s specials
          </Link>
        </div>
        <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-3 text-sm font-medium text-[#241f1a]/70">
          <span className="inline-flex items-center gap-2">
            <FiClock className="text-[#d94b27]" /> 20–30 min delivery
          </span>
          <span className="inline-flex items-center gap-2">
            <FiMapPin className="text-[#d94b27]" /> Fresh near you
          </span>
        </div>
      </div>

      <div className="relative mx-auto w-full max-w-[570px] lg:ml-auto">
        <div className="absolute -right-5 -top-7 z-10 hidden rounded-2xl bg-white p-4 shadow-xl sm:block">
          <div className="flex items-center gap-2 text-sm font-bold text-[#241f1a]">
            <FiStar className="fill-amber-400 text-amber-400" /> Made with care
          </div>
          <p className="mt-1 text-xs text-[#241f1a]/55">
            Fresh from our kitchen
          </p>
        </div>
        <div className="relative aspect-[1.1/1] overflow-hidden rounded-[2rem] shadow-2xl shadow-[#382410]/15">
          <img
            src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1200&q=85"
            alt="Freshly baked pizza with basil and colorful toppings"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
          <div className="absolute bottom-5 left-5 right-5 flex items-end justify-end gap-4 text-white">
            <div className="text-right">
              <p className="text-xs font-semibold uppercase tracking-[.18em] text-white/75">
                Made for your table
              </p>
              <p className="font-display mt-1 text-2xl font-bold">
                A little joy, delivered.
              </p>
            </div>
          </div>
        </div>
        <div className="absolute -bottom-4 -left-4 hidden rounded-2xl border border-[#e6ddd2] bg-white px-5 py-3 shadow-xl sm:block">
          <p className="text-xs text-[#241f1a]/55">From prep to your plate</p>
          <p className="mt-1 text-sm font-bold text-[#241f1a]">
            Always made fresh
          </p>
        </div>
      </div>
    </div>
  </section>
);

export default Banner;