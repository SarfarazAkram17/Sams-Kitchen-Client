import logo from "../../assets/images/logo.png";

const Loading = () => (
  <div
    className="mx-auto flex min-h-[42vh] w-full max-w-5xl items-center justify-center px-5 py-12"
    role="status"
    aria-live="polite"
    aria-label="Loading Sam's Kitchen"
  >
    <div className="relative flex w-full max-w-sm flex-col items-center overflow-hidden rounded-3xl border border-base-300/80 bg-base-100 px-8 py-10 text-center shadow-[0_24px_70px_-38px_rgba(0,0,0,0.8)]">
      <div
        className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent"
        aria-hidden="true"
      />

      <div className="relative grid size-[5.5rem] place-items-center">
        <span
          className="absolute inset-0 rounded-full border-2 border-base-300/80"
          aria-hidden="true"
        />
        <span
          className="absolute inset-0 rounded-full border-2 border-transparent border-r-secondary/70 border-t-primary motion-safe:animate-spin"
          aria-hidden="true"
        />
        <span
          className="absolute inset-2 grid place-items-center rounded-full bg-base-200 ring-1 ring-base-300/70"
          aria-hidden="true"
        >
          <img src={logo} alt="" className="h-11 w-14 object-contain" />
        </span>
      </div>

      <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
        Sam&apos;s Kitchen
      </p>
      <p className="mt-2 text-xl font-semibold tracking-tight text-base-content">
        Getting everything ready
      </p>
      <p className="mt-2 max-w-[15rem] text-sm leading-6 text-base-content/60">
        Please wait while we prepare your page.
      </p>
      <div className="mt-6 flex items-center gap-1.5" aria-hidden="true">
        <span className="size-1.5 rounded-full bg-primary motion-safe:animate-pulse" />
        <span className="size-1.5 rounded-full bg-secondary motion-safe:animate-pulse [animation-delay:150ms]" />
        <span className="size-1.5 rounded-full bg-accent motion-safe:animate-pulse [animation-delay:300ms]" />
      </div>
    </div>
  </div>
);

export default Loading;
