import { Link } from "react-router";
import { FiArrowUpRight } from "react-icons/fi";
import { FaMotorcycle, FaSearch, FaSmile } from "react-icons/fa";
import { PiShoppingCartBold } from "react-icons/pi";
import Reveal from "../../../Components/Shared/Reveal";
import SectionHeading from "../../../Components/Shared/SectionHeading";

const steps = [
  { icon: FaSearch, title: "Browse the menu", description: "Explore our dishes, read reviews and pick your favorites." },
  { icon: PiShoppingCartBold, title: "Place your order", description: "Add items to your cart and check out in a few taps." },
  { icon: FaMotorcycle, title: "We deliver", description: "A rider collects your meal fresh from the kitchen and brings it over." },
  { icon: FaSmile, title: "Enjoy", description: "Sit back and enjoy a hot meal right at your doorstep." },
];

const HowItWorks = () => (
  <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:py-24" aria-labelledby="how-it-works-title">
    <SectionHeading
      id="how-it-works-title"
      align="center"
      eyebrow="Simple by design"
      title="From our kitchen to your table"
      description="Ordering from Sam’s Kitchen takes four easy steps—and a few minutes."
    />

    <ol className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
      {steps.map(({ icon: Icon, title, description }, index) => (
        <Reveal as="li" key={title} delay={index * 0.1} className="relative">
          <div className="card-lift h-full rounded-3xl border border-base-300 bg-base-100 p-6 text-center">
            <div className="relative mx-auto grid size-[4.5rem] place-items-center rounded-full border border-base-300 bg-base-200 text-primary">
              <Icon size={26} aria-hidden="true" />
              <span className="absolute -right-1 -top-1 grid size-7 place-items-center rounded-full bg-primary text-xs font-bold text-primary-content">
                {index + 1}
              </span>
            </div>
            <h3 className="font-display mt-5 text-2xl text-base-content">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-base-content/70">{description}</p>
          </div>
        </Reveal>
      ))}
    </ol>

    <Reveal className="mt-10 text-center">
      <Link to="/allFoods" className="btn btn-primary min-h-12 px-7">
        Start your order <FiArrowUpRight aria-hidden="true" />
      </Link>
    </Reveal>
  </section>
);

export default HowItWorks;
