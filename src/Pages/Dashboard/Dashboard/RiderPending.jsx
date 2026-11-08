import { FiClock } from "react-icons/fi";
import { Link } from "react-router";
import Tilt3D from "../../../Components/Auth/Tilt3D";

// Shown to a rider whose application the team has not approved yet.
const RiderPending = () => (
  <div className="stage grid min-h-[60vh] place-items-center px-4">
    <Tilt3D max={6} className="w-full max-w-lg">
      <section className="surface-panel rounded-3xl p-5 text-center sm:p-10">
        <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-primary/15 text-primary shadow-lg">
          <FiClock size={28} aria-hidden="true" />
        </span>
        <h1 className="mt-6 text-3xl">Your application is under review</h1>
        <p className="mx-auto mt-3 max-w-sm leading-relaxed text-base-content/70">
          The team checks every rider before they can take deliveries. You’ll get a notification as
          soon as you’re approved, and this page will turn into your rider workspace.
        </p>
        <Link to="/dashboard/manageProfile" className="btn mt-8 h-12 w-full sm:w-auto sm:min-w-44">
          Manage profile
        </Link>
      </section>
    </Tilt3D>
  </div>
);

export default RiderPending;
