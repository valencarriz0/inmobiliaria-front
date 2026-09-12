import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { CURRENCIES } from "../constants/property";
import { createPropertySearchValues, validatePropertySearch } from "../lib/property-search";
import type { PropertySearchValues } from "../types/property-search";
import { Button } from "./ui/button";
import { InputField } from "./ui/input-field";
import { FieldError } from "./ui/field-error";

type PriceValue = Pick<PropertySearchValues, "currency" | "minPrice" | "maxPrice">;

const compactPrice = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });

function priceLabel(value: PriceValue) {
  const errors = validatePropertySearch({ ...createPropertySearchValues(), ...value });
  if (Object.values(errors).some(Boolean)) return "Precio";
  const amount = (text: string) => compactPrice.format(Number(text.trim().replace(",", "."))).replace("K", "k");
  const min = value.minPrice.trim();
  const max = value.maxPrice.trim();
  if (min && max) return `${value.currency} ${amount(min)}–${amount(max)}`;
  if (min) return `${value.currency} desde ${amount(min)}`;
  if (max) return `${value.currency} hasta ${amount(max)}`;
  return value.currency || "Precio";
}

interface PropertyPriceFilterProps {
  value: PriceValue;
  onChange: (value: PriceValue) => void;
  error?: string;
}

export default function PropertyPriceFilter({ value, onChange, error }: PropertyPriceFilterProps) {
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const dismiss = (event: PointerEvent) => {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, [open]);

  const close = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <div ref={rootRef} className="relative min-w-0" onKeyDown={(event) => {
      if (event.key === "Escape" && open) { event.preventDefault(); event.stopPropagation(); close(); }
    }} onBlur={(event) => {
      if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) setOpen(false);
    }}>
      <Button ref={triggerRef} type="button" variant="outline" aria-label={`Precio: ${priceLabel(value)}`}
        aria-haspopup="dialog" aria-expanded={open} aria-controls={`${id}-panel`}
        aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined}
        onClick={() => setOpen(!open)} title={priceLabel(value)}
        className="h-12 w-full justify-between gap-2 rounded-xl border-slate-200 bg-white px-3.5 font-normal text-foreground shadow-none hover:bg-slate-50 hover:text-foreground">
        <span className="truncate">{priceLabel(value)}</span><ChevronDown className="size-4 shrink-0 opacity-50" aria-hidden="true" />
      </Button>
      {open && <PricePanel id={`${id}-panel`} value={value} onApply={(next) => { onChange(next); close(); }} />}
      <FieldError id={`${id}-error`}>{error}</FieldError>
    </div>
  );
}

function PricePanel({ id, value, onApply }: { id: string; value: PriceValue; onApply: (value: PriceValue) => void }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState(value);
  const [submitted, setSubmitted] = useState(false);
  const validate = () => validatePropertySearch({ ...createPropertySearchValues(), ...draft });
  const errors = submitted ? validate() : {};

  useEffect(() => { panelRef.current?.querySelector<HTMLElement>("input")?.focus(); }, []);

  const apply = () => {
    setSubmitted(true);
    if (Object.values(validate()).some(Boolean)) {
      requestAnimationFrame(() => panelRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
      return;
    }
    onApply(draft);
  };

  return (
    <div id={id} ref={panelRef} role="dialog" aria-label="Filtrar por precio"
      className="absolute left-0 top-full z-50 mt-2 w-[min(20rem,calc(100vw-4rem))] rounded-2xl border border-slate-200 bg-white p-5 shadow-lg lg:left-auto lg:right-0"
      onKeyDown={(event) => {
        if (event.key === "Enter" && event.target instanceof HTMLInputElement) { event.preventDefault(); apply(); }
      }}>
      <fieldset className="mb-4">
        <legend className="mb-2 text-sm font-medium">Moneda</legend>
        <div className="grid grid-cols-2 gap-2">
          {CURRENCIES.map((currency) => (
            <label key={currency} className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg border p-2.5 text-sm ${draft.currency === currency ? "border-accent bg-accent/10 text-accent" : "border-slate-200"}`}>
              <input type="radio" name={`${id}-currency`} value={currency} checked={draft.currency === currency}
                className="accent-accent" aria-invalid={Boolean(errors.currency)} aria-describedby={errors.currency ? `${id}-currency-error` : undefined}
                onChange={() => setDraft({ ...draft, currency })} />
              {currency}
            </label>
          ))}
        </div>
        <FieldError id={`${id}-currency-error`}>{errors.currency}</FieldError>
      </fieldset>
      <div className="grid grid-cols-2 gap-3">
        {([["minPrice", "Desde"], ["maxPrice", "Hasta"]] as const).map(([field, label]) => (
          <InputField key={field} id={`${id}-${field}`} name={field} label={label} value={draft[field]}
            inputMode="decimal" placeholder="Sin límite" className="h-11 rounded-lg border-slate-200"
            onChange={(event) => setDraft({ ...draft, [field]: event.target.value })}
            error={errors[field]} errorId={`${id}-${field}-error`} />
        ))}
      </div>
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">Seleccioná una moneda para filtrar por precio. Ingresá importes sin separador de miles.</p>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Button type="button" className="h-10 rounded-lg bg-accent text-white hover:bg-accent/90" onClick={apply}>Aplicar</Button>
        <Button type="button" variant="outline" className="h-10 rounded-lg border-slate-200 bg-white text-foreground hover:bg-slate-50 hover:text-foreground" onClick={() => onApply({ currency: "", minPrice: "", maxPrice: "" })}>Limpiar</Button>
      </div>
    </div>
  );
}
