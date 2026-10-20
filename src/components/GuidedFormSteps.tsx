import { Check } from "lucide-react";

export type FormStep = { title: string; description: string };

export default function GuidedFormSteps({
  steps,
  activeStep,
  onSelect,
}: {
  steps: readonly FormStep[];
  activeStep: number;
  onSelect?: (step: number) => void;
}) {
  const progress = ((activeStep + 1) / steps.length) * 100;

  return (
    <aside aria-label="Progreso del formulario" className="h-fit rounded-2xl border border-border bg-background p-5 shadow-sm lg:sticky lg:top-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="font-semibold">Progreso</p>
          <p className="mt-1 text-sm text-muted-foreground">Paso {activeStep + 1} de {steps.length}</p>
        </div>
        <span className="text-sm font-semibold text-foreground">{Math.round(progress)}%</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted" aria-hidden="true">
        <div className="h-full rounded-full bg-primary transition-[width] duration-300" style={{ width: `${progress}%` }} />
      </div>
      <ol className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-1">
        {steps.map((step, index) => {
          const isActive = index === activeStep;
          const isComplete = index < activeStep;
          const content = (
            <>
              <span className={`grid size-9 shrink-0 place-items-center rounded-full border text-sm font-semibold transition-colors ${isActive ? "border-primary bg-primary text-primary-foreground" : isComplete ? "border-primary bg-tertiary text-foreground" : "border-border bg-muted text-muted-foreground"}`}>
                {isComplete ? <Check className="size-4" aria-hidden="true" /> : index + 1}
              </span>
              <span className="min-w-0">
                <span className={`block text-sm font-semibold ${isActive ? "text-foreground" : "text-muted-foreground"}`}>{step.title}</span>
                <span className="hidden text-xs text-muted-foreground sm:block">{step.description}</span>
              </span>
            </>
          );

          return (
            <li key={step.title}>
              {onSelect && index < activeStep ? (
                <button type="button" onClick={() => onSelect(index)} aria-current={isActive ? "step" : undefined} className={`flex w-full items-center gap-3 rounded-xl border p-2.5 text-left transition-colors hover:bg-muted ${isActive ? "border-primary/40 bg-tertiary/50" : "border-transparent"}`}>
                  {content}
                </button>
              ) : (
                <div aria-current={isActive ? "step" : undefined} className={`flex items-center gap-3 rounded-xl border p-2.5 ${isActive ? "border-primary/40 bg-tertiary/50" : "border-transparent"}`}>
                  {content}
                </div>
              )}
            </li>
          );
        })}
      </ol>
      <div className="mt-5 hidden rounded-xl border border-border bg-muted/60 p-3 text-sm text-muted-foreground lg:block">
        Podés volver a los pasos anteriores para revisar o cambiar la información.
      </div>
    </aside>
  );
}
