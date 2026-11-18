import { DitherField } from "./DitherField";
import { Nav } from "./Nav";

/** The dithered wave band at the top of every page, with the nav and a title sitting over its faded end. */
export function Hero({ children }: { children: React.ReactNode }) {
  return (
    <header className="relative">
      <div className="absolute inset-x-0 top-0 -z-10 h-[420px] sm:h-[480px]">
        <DitherField fadeStart={0.25} />
      </div>
      <div className="mx-auto flex min-h-[340px] max-w-3xl flex-col justify-between gap-16 px-6 pt-6 pb-10 sm:min-h-[400px]">
        <Nav />
        <div>{children}</div>
      </div>
    </header>
  );
}
