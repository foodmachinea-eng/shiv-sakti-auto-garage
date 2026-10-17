"use client";

import type { ReactNode } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Edit a list of items: add, remove and reorder. */
export function ListEditor<T>({
  label,
  items,
  onChange,
  create,
  render,
  max = 10,
  min = 0,
  addLabel = "Add item",
  itemLabel,
}: {
  label: string;
  items: T[];
  onChange: (items: T[]) => void;
  create: () => T;
  render: (item: T, update: (item: T) => void, index: number) => ReactNode;
  max?: number;
  min?: number;
  addLabel?: string;
  itemLabel: (item: T, index: number) => string;
}) {
  const move = (i: number, d: number) => {
    const next = [...items];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    onChange(next);
  };
  return (
    <fieldset>
      <legend className="text-[0.95rem] font-semibold">{label}</legend>
      <ol className="mt-3 space-y-3">
        {items.map((item, i) => (
          <li key={i} className="rounded-md border border-line bg-paper/60 p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="text-[0.82rem] font-medium text-slate">{itemLabel(item, i)}</span>
              <div className="flex">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="rounded p-1.5 text-slate hover:bg-white disabled:opacity-30" aria-label={`Move ${itemLabel(item, i)} up`}>
                  <ArrowUp className="h-4 w-4" aria-hidden="true" />
                </button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} className="rounded p-1.5 text-slate hover:bg-white disabled:opacity-30" aria-label={`Move ${itemLabel(item, i)} down`}>
                  <ArrowDown className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => onChange(items.filter((_, k) => k !== i))}
                  disabled={items.length <= min}
                  className="rounded p-1.5 text-slate hover:bg-white hover:text-[#b42318] disabled:opacity-30"
                  aria-label={`Remove ${itemLabel(item, i)}`}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
            {render(item, (next) => onChange(items.map((x, k) => (k === i ? next : x))), i)}
          </li>
        ))}
      </ol>
      {items.length < max && (
        <Button type="button" variant="subtle" size="sm" className="mt-3" onClick={() => onChange([...items, create()])}>
          <Plus className="h-4 w-4" aria-hidden="true" /> {addLabel}
        </Button>
      )}
    </fieldset>
  );
}
