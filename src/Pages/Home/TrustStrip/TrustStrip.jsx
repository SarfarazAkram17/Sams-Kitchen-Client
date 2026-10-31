import { FiCreditCard, FiMapPin, FiNavigation } from "react-icons/fi";
import { PiCookingPotBold } from "react-icons/pi";
import Reveal from "../../../Components/Shared/Reveal";

const items = [
  { icon: PiCookingPotBold, title: "Cooked to order", text: "Every dish is prepared fresh in our kitchen." },
  { icon: FiCreditCard, title: "Secure payment", text: "Pay by card or mobile banking, safely." },
  { icon: FiNavigation, title: "Live tracking", text: "Follow your order from kitchen to door." },
  { icon: FiMapPin, title: "Nationwide delivery", text: "Choose your district and thana at checkout." },
];

const TrustStrip = () => (
  <Reveal className="relative z-10 mx-auto -mt-10 w-full max-w-6xl px-4 sm:-mt-12">
    <ul className="grid grid-cols-1 gap-px overflow-hidden rounded-3xl border border-base-300 bg-base-300 shadow-xl shadow-black/10 sm:grid-cols-2 lg:grid-cols-4">
      {items.map(({ icon: Icon, title, text }) => (
        <li key={title} className="flex items-start gap-4 bg-base-100 p-5 sm:p-6">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary/12 text-primary">
            <Icon size={20} aria-hidden="true" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-base-content">{title}</h3>
            <p className="mt-1 text-xs leading-5 text-base-content/70">{text}</p>
          </div>
        </li>
      ))}
    </ul>
  </Reveal>
);

export default TrustStrip;
