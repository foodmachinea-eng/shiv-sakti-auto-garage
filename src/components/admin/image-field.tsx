"use client";

import { useId, useRef, useState } from "react";
import { toast } from "sonner";
import { ImagePlus, Link2, Trash2 } from "lucide-react";
import { SmartImage } from "@/components/ui/smart-image";
import { Button } from "@/components/ui/button";
import { inputClasses } from "@/components/ui/field";
import { uploadImage } from "@/lib/image-upload";
import { cn } from "@/lib/format";

/** Image picker: upload from the device (compressed in the browser) or paste a link. */
export function ImageField({
  label,
  value,
  onChange,
  hint,
  error,
  aspect = "aspect-[16/10]",
  allowEmpty = true,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  hint?: string;
  error?: string;
  aspect?: string;
  allowEmpty?: boolean;
}) {
  const id = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [showUrl, setShowUrl] = useState(false);

  return (
    <div>
      <p className="text-[0.88rem] font-medium" id={`${id}-label`}>
        {label}
      </p>
      <div className="mt-1.5 flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className={cn("relative w-full shrink-0 overflow-hidden rounded-md bg-paper ring-1 ring-line sm:w-48", aspect)}>
          {value ? (
            <SmartImage src={value} alt="" sizes="200px" maxWidth={480} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[0.8rem] text-slate">No image</div>
          )}
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="subtle" size="sm" loading={uploading} onClick={() => fileRef.current?.click()}>
              <ImagePlus className="h-4 w-4" aria-hidden="true" /> {value ? "Replace" : "Upload"}
            </Button>
            <Button type="button" variant="subtle" size="sm" onClick={() => setShowUrl((v) => !v)} aria-expanded={showUrl}>
              <Link2 className="h-4 w-4" aria-hidden="true" /> Use a link
            </Button>
            {allowEmpty && value && (
              <Button type="button" variant="subtle" size="sm" onClick={() => onChange("")}>
                <Trash2 className="h-4 w-4" aria-hidden="true" /> Remove
              </Button>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="sr-only"
            aria-labelledby={`${id}-label`}
            onChange={async (e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (!file) return;
              setUploading(true);
              try {
                const { url } = await uploadImage(file);
                onChange(url);
                toast.success("Image uploaded");
              } catch (err) {
                toast.error((err as Error).message);
              } finally {
                setUploading(false);
              }
            }}
          />
          {showUrl && (
            <input
              type="url"
              value={value}
              onChange={(e) => onChange(e.target.value.trim())}
              placeholder="https://…"
              aria-label={`${label} link`}
              className={cn(inputClasses, "h-10 rounded-md text-[0.88rem]")}
            />
          )}
          {error ? (
            <p className="text-[0.82rem] font-medium text-[#b42318]">{error}</p>
          ) : (
            hint && <p className="text-[0.8rem] text-slate">{hint}</p>
          )}
        </div>
      </div>
    </div>
  );
}
