import { useMemo, useState, type ComponentProps, type KeyboardEvent } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { Input } from "./ui/input";
import { FieldError } from "./ui/field-error";
import { Label } from "./ui/label";

export interface LocationOption { id: string; name: string }

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es").trim();
}

export default function LocationOptionCombobox({
  id,
  name,
  label,
  placeholder,
  value,
  options,
  error,
  disabled = false,
  inputProps,
  onChange,
  onBlur,
}: {
  id: string;
  name: string;
  label: string;
  placeholder: string;
  value?: LocationOption;
  options: readonly LocationOption[];
  error?: string;
  disabled?: boolean;
  inputProps?: ComponentProps<"input">;
  onChange: (option?: LocationOption) => void;
  onBlur?: () => void;
}) {
  const [query, setQuery] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const shownOptions = useMemo(() => {
    const search = normalize(query ?? "");
    return options.filter((option) => normalize(option.name).includes(search)).slice(0, 60);
  }, [options, query]);

  const choose = (option?: LocationOption) => {
    onChange(option);
    setQuery(null);
    setOpen(false);
    setActiveIndex(0);
  };

  const keyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((current) => Math.max(0, Math.min(shownOptions.length - 1, current + (event.key === "ArrowDown" ? 1 : -1))));
    } else if (event.key === "Enter" && open) {
      event.preventDefault();
      if (shownOptions[activeIndex]) choose(shownOptions[activeIndex]);
    } else if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      setQuery(null);
    }
  };

  return <div className="relative min-w-0" onBlur={(event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setOpen(false);
      setQuery(null);
      onBlur?.();
    }
  }}>
    <Label htmlFor={id}>{label}<span className="text-destructive"> *</span></Label>
    <div className="relative mt-2">
      <Input
        {...inputProps}
        id={id}
        name={name}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={`${id}-options`}
        aria-activedescendant={open && shownOptions[activeIndex] ? `${id}-option-${activeIndex}` : undefined}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        autoComplete="off"
        disabled={disabled}
        placeholder={placeholder}
        value={query ?? value?.name ?? ""}
        onFocus={() => { setOpen(true); setActiveIndex(0); }}
        onClick={() => setOpen(true)}
        onChange={(event) => { setQuery(event.target.value); setOpen(true); setActiveIndex(0); onChange(undefined); }}
        onKeyDown={keyDown}
        className="pr-10"
      />
      {value ? <button type="button" aria-label={`Limpiar ${label.toLocaleLowerCase("es")}`} disabled={disabled} onClick={() => choose()} className="absolute right-1 top-1 grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"><X className="size-4" aria-hidden="true" /></button> : <ChevronDown className="pointer-events-none absolute right-3 top-3 size-4 text-muted-foreground" aria-hidden="true" />}
    </div>
    {open && !disabled && <div className="absolute inset-x-0 top-full z-50 mt-2 rounded-xl border border-border bg-background p-1.5 shadow-lg">
      <ul id={`${id}-options`} role="listbox" aria-label={`Opciones de ${label.toLocaleLowerCase("es")}`} className="max-h-60 overflow-y-auto overscroll-contain">
        {shownOptions.map((option, index) => <li key={option.id} id={`${id}-option-${index}`} role="option" aria-selected={value?.id === option.id || activeIndex === index}
          onPointerDown={(event) => event.preventDefault()} onClick={() => choose(option)}
          className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm ${activeIndex === index ? "bg-tertiary text-foreground" : "hover:bg-muted"}`}>
          <span>{option.name}</span>{value?.id === option.id && <Check className="size-4 text-foreground" aria-hidden="true" />}
        </li>)}
      </ul>
      {shownOptions.length === 0 && <p role="status" className="px-3 py-4 text-sm text-muted-foreground">No encontramos opciones. Probá con otro texto.</p>}
      {options.length > 60 && shownOptions.length === 60 && <p className="px-3 pb-2 text-xs text-muted-foreground">Seguí escribiendo para acotar las opciones.</p>}
    </div>}
    <FieldError id={`${id}-error`}>{error}</FieldError>
  </div>;
}
