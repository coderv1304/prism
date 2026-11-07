import { ButtonLink } from "@/components/ui/button";

export function FinalCta() {
  return (
    <section className="bg-ink text-paper">
      <div className="shell py-20 sm:py-28">
        <p className="label text-ochre">Dispatch</p>
        <h2 className="mt-6 max-w-4xl text-[clamp(2.4rem,6vw,4.8rem)] leading-[0.94] text-paper">
          Put the heavy work down.
          <br />
          <em className="italic text-ochre">Pick up the thread.</em>
        </h2>

        <div className="mt-12 flex flex-col justify-between gap-8 border-t border-paper/15 pt-7 lg:flex-row lg:items-center">
          <p className="max-w-md text-[13.5px] leading-6 text-paper/55">
            The queue is running, the record is durable and the console is open. Send a job and follow every stage
            yourself.
          </p>
          <div className="flex flex-wrap items-center gap-5">
            <ButtonLink
              href="/console"
              size="lg"
              className="border-paper bg-paper text-ink hover:border-ochre hover:bg-ochre"
            >
              Open the console
              <span aria-hidden="true" className="text-[15px] leading-none">
                →
              </span>
            </ButtonLink>
            <code className="font-mono text-[10.5px] text-paper/40">docker compose up --build</code>
          </div>
        </div>
      </div>
    </section>
  );
}
