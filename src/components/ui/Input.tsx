import React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, required, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold uppercase tracking-wider text-poab-navy mb-1.5"
          >
            {label} {required && <span className="text-red-600">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          required={required}
          className={cn(
            "w-full px-4 py-2.5 bg-white border border-poab-grey-border text-poab-charcoal text-sm transition-colors",
            "focus:outline-none focus:border-poab-navy focus:ring-1 focus:ring-poab-navy",
            "disabled:bg-poab-stone disabled:opacity-70 disabled:cursor-not-allowed",
            error && "border-red-600 focus:border-red-600 focus:ring-red-600",
            className
          )}
          {...props}
        />
        {helperText && !error && (
          <p className="mt-1 text-xs text-poab-charcoal/70">{helperText}</p>
        )}
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, id, required, rows = 4, ...props }, ref) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-xs font-semibold uppercase tracking-wider text-poab-navy mb-1.5"
          >
            {label} {required && <span className="text-red-600">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          required={required}
          rows={rows}
          className={cn(
            "w-full px-4 py-2.5 bg-white border border-poab-grey-border text-poab-charcoal text-sm transition-colors resize-y",
            "focus:outline-none focus:border-poab-navy focus:ring-1 focus:ring-poab-navy",
            "disabled:bg-poab-stone disabled:opacity-70 disabled:cursor-not-allowed",
            error && "border-red-600 focus:border-red-600 focus:ring-red-600",
            className
          )}
          {...props}
        />
        {helperText && !error && (
          <p className="mt-1 text-xs text-poab-charcoal/70">{helperText}</p>
        )}
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
