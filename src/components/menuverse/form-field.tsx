import { forwardRef, useId } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type BaseProps = {
  label?: string;
  description?: string;
  error?: string;
  required?: boolean;
  className?: string;
};

function FieldWrap({
  id,
  label,
  description,
  error,
  required,
  className,
  children,
}: BaseProps & { id: string; children: React.ReactNode }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <Label htmlFor={id} className="flex items-center gap-1">
          {label}
          {required && <span className="text-destructive">*</span>}
        </Label>
      )}
      {children}
      {description && !error && <p className="text-xs text-muted-foreground">{description}</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export type TextFieldProps = BaseProps &
  Omit<React.ComponentProps<typeof Input>, "id"> & { id?: string };

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, description, error, required, className, id, ...rest },
  ref,
) {
  const auto = useId();
  const fieldId = id ?? auto;
  return (
    <FieldWrap
      id={fieldId}
      label={label}
      description={description}
      error={error}
      required={required}
      className={className}
    >
      <Input id={fieldId} ref={ref} aria-invalid={!!error || undefined} {...rest} />
    </FieldWrap>
  );
});

export type TextareaFieldProps = BaseProps &
  Omit<React.ComponentProps<typeof Textarea>, "id"> & { id?: string };

export const TextareaField = forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
  function TextareaField({ label, description, error, required, className, id, ...rest }, ref) {
    const auto = useId();
    const fieldId = id ?? auto;
    return (
      <FieldWrap
        id={fieldId}
        label={label}
        description={description}
        error={error}
        required={required}
        className={className}
      >
        <Textarea id={fieldId} ref={ref} aria-invalid={!!error || undefined} {...rest} />
      </FieldWrap>
    );
  },
);

export type SelectFieldProps = BaseProps & {
  id?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (v: string) => void;
  placeholder?: string;
  options: { value: string; label: string }[];
};

export function SelectField({
  label,
  description,
  error,
  required,
  className,
  id,
  value,
  defaultValue,
  onValueChange,
  placeholder,
  options,
}: SelectFieldProps) {
  const auto = useId();
  const fieldId = id ?? auto;
  return (
    <FieldWrap
      id={fieldId}
      label={label}
      description={description}
      error={error}
      required={required}
      className={className}
    >
      <Select value={value} defaultValue={defaultValue} onValueChange={onValueChange}>
        <SelectTrigger id={fieldId} aria-invalid={!!error || undefined}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FieldWrap>
  );
}

export function FormRow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("grid gap-4 sm:grid-cols-2", className)}>{children}</div>;
}

export function FormActions({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-center justify-end gap-2 pt-2", className)}>
      {children}
    </div>
  );
}
