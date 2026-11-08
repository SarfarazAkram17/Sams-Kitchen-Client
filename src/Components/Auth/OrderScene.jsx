import { FaMotorcycle } from "react-icons/fa";
import { FiCheck } from "react-icons/fi";
import Tilt3D from "./Tilt3D";

const steps = [
  { label: "Confirmed", state: "done" },
  { label: "Cooking", state: "current" },
  { label: "On the way", state: "next" },
];

// Decorative showcase: an order moving from the kitchen to a rider, at three depths.
const OrderScene = () => (
  <div className="stage" aria-hidden="true">
    <Tilt3D className="relative mx-auto h-[25rem] w-full max-w-[34rem]" max={7}>
      <div className="scene-plate">
        <span className="scene-ring inset-[12%]" />
        <span className="scene-ring inset-[26%]" />
        <span className="scene-ring inset-[40%]" />
      </div>

      <div
        className="glass-card absolute left-[4%] top-[16%] w-[70%] p-5"
        style={{ transform: "translateZ(70px)" }}
      >
        <p className="text-xs font-semibold text-base-content/60">Order SK-2841</p>
        <p className="mt-1 font-display text-2xl">Kacchi biryani × 2</p>
        <ol className="mt-5 flex items-center gap-2 text-xs font-semibold">
          {steps.map((step, index) => (
            <li key={step.label} className="flex items-center gap-2">
              {index > 0 && <span className="h-px w-5 bg-base-content/25" />}
              <span
                className={`grid size-5 place-items-center rounded-full ${
                  step.state === "done"
                    ? "bg-primary text-primary-content"
                    : step.state === "current"
                      ? "scene-dot bg-primary/25 ring-2 ring-primary"
                      : "bg-base-content/10"
                }`}
              >
                {step.state === "done" && <FiCheck size={12} />}
              </span>
              <span className={step.state === "next" ? "text-base-content/50" : ""}>
                {step.label}
              </span>
            </li>
          ))}
        </ol>
      </div>

      <div
        className="glass-card absolute right-[2%] top-[2%] flex items-center gap-3 px-4 py-3"
        style={{ transform: "translateZ(110px)" }}
      >
        <span className="grid size-8 place-items-center rounded-full bg-success/20 text-success">
          <FiCheck size={16} />
        </span>
        <span>
          <span className="block text-sm font-bold tabular-nums">৳1,240</span>
          <span className="block text-xs text-base-content/60">Paid</span>
        </span>
      </div>

      <div
        className="glass-card absolute bottom-[6%] right-0 flex w-[56%] items-center gap-3 p-4"
        style={{ transform: "translateZ(140px)" }}
      >
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary text-primary-content shadow-lg">
          <FaMotorcycle size={20} />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-bold">Rider on the way</span>
          <span className="block truncate text-xs text-base-content/65">12 min to Dhanmondi</span>
        </span>
      </div>
    </Tilt3D>
  </div>
);

export default OrderScene;
