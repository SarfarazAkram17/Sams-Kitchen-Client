import { FaClock, FaLeaf, FaShieldAlt, FaStar } from "react-icons/fa";
import Reveal from "../../../Components/Shared/Reveal";
import SectionHeading from "../../../Components/Shared/SectionHeading";

const secondary = [
  { icon: FaClock, title: "Delivered hot", description: "Reliable riders bring your meal straight from our kitchen, on time.", tone: "bg-secondary/15 text-secondary" },
  { icon: FaShieldAlt, title: "Safe & hygienic", description: "Strict hygiene routines keep every meal clean and safe.", tone: "bg-info/15 text-info" },
  { icon: FaStar, title: "Honest reviews", description: "Read real reviews on every dish before you order.", tone: "bg-primary/12 text-primary" },
];

const WhyChooseUs = () => (
  <section className="band-warm border-y border-base-300 px-4 py-16 sm:py-24" aria-labelledby="why-title">
    <div className="mx-auto max-w-7xl">
      <SectionHeading
        id="why-title"
        eyebrow="Why Sam’s Kitchen"
        title="Good food takes care"
        description="Fresh ingredients, careful hands and a team that treats every order like a family meal."
      />

      <div className="grid gap-5 lg:grid-cols-[1.15fr_1fr]">
        <Reveal>
          <article className="relative flex h-full min-h-[22rem] flex-col justify-between overflow-hidden rounded-[2rem] border border-base-300 bg-base-100 p-8 sm:p-10">
            <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-success/15 blur-3xl" aria-hidden="true" />
            <span className="relative grid size-14 place-items-center rounded-2xl bg-success/15 text-success">
              <FaLeaf size={24} aria-hidden="true" />
            </span>
            <div className="relative mt-16">
              <h3 className="font-display text-4xl leading-tight text-base-content sm:text-5xl">Fresh ingredients, every single dish.</h3>
              <p className="mt-4 max-w-md text-sm leading-7 text-base-content/70 sm:text-base">
                We cook with fresh, high-quality ingredients and prepare each meal
                only when you order it—so what reaches your door tastes the way it should.
              </p>
            </div>
          </article>
        </Reveal>

        <div className="grid gap-5">
          {secondary.map(({ icon: Icon, title, description, tone }, index) => (
            <Reveal key={title} delay={0.1 * (index + 1)}>
              <article className="card-lift flex h-full items-start gap-5 rounded-3xl border border-base-300 bg-base-100 p-6">
                <span className={`grid size-12 shrink-0 place-items-center rounded-2xl ${tone}`}>
                  <Icon size={20} aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-lg font-bold text-base-content">{title}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-base-content/70">{description}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default WhyChooseUs;
