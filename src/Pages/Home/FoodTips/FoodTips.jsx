import { FaClock, FaFire, FaLeaf, FaSnowflake } from "react-icons/fa";
import Reveal from "../../../Components/Shared/Reveal";
import SectionHeading from "../../../Components/Shared/SectionHeading";

const foodTips = [
  { icon: FaSnowflake, tone: "text-info", title: "Store it properly", description: "Keep leftovers in airtight containers and refrigerate within 2 hours to prevent spoilage." },
  { icon: FaFire, tone: "text-primary", title: "Reheat safely", description: "Reheat evenly to at least 74°C (165°F) to keep food safe and flavorful." },
  { icon: FaLeaf, tone: "text-success", title: "Choose fresh", description: "Fresh, well-prepared ingredients are the secret to the best flavor and nutrition." },
  { icon: FaClock, tone: "text-secondary", title: "Eat in good time", description: "Enjoy cooked food within 3–4 days for the best taste and safety." },
];

const FoodTips = () => (
  <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:py-24" aria-labelledby="tips-title">
    <SectionHeading
      id="tips-title"
      eyebrow="Kitchen notes"
      title="Make every meal last"
      description="Small habits that keep your food tasting its best, from the first bite to the last."
    />
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {foodTips.map(({ icon: Icon, tone, title, description }, index) => (
        <Reveal key={title} delay={index * 0.08}>
          <article className="card-lift h-full rounded-3xl border border-base-300 bg-base-100 p-6">
            <Icon className={`text-2xl ${tone}`} aria-hidden="true" />
            <h3 className="mt-5 text-lg font-bold text-base-content">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-base-content/70">{description}</p>
          </article>
        </Reveal>
      ))}
    </div>
  </section>
);

export default FoodTips;
