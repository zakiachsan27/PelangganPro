"use client";

import { useState, useEffect, forwardRef } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface CurrencyInputProps {
  value?: number;
  onChange?: (value: number) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  min?: number;
  max?: number;
}

function formatNumber(value: number): string {
  return value.toLocaleString("id-ID");
}

function parseNumber(value: string): number {
  // Remove all non-digit characters
  const cleaned = value.replace(/[^\d]/g, "");
  return parseInt(cleaned, 10) || 0;
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value = 0, onChange, placeholder, className, disabled, min, max, ...props }, ref) => {
    const [displayValue, setDisplayValue] = useState(formatNumber(value));
    const [isFocused, setIsFocused] = useState(false);

    // Update display when value prop changes (from parent)
    useEffect(() => {
      if (!isFocused) {
        setDisplayValue(formatNumber(value));
      }
    }, [value, isFocused]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      
      // Parse the number
      const numericValue = parseNumber(inputValue);
      
      // Apply min/max constraints
      let constrainedValue = numericValue;
      if (min !== undefined && numericValue < min) constrainedValue = min;
      if (max !== undefined && numericValue > max) constrainedValue = max;
      
      // Update display with formatted value
      setDisplayValue(formatNumber(constrainedValue));
      
      // Notify parent
      onChange?.(constrainedValue);
    };

    const handleFocus = () => {
      setIsFocused(true);
      // Select all text for easy editing
      setDisplayValue(value.toString());
    };

    const handleBlur = () => {
      setIsFocused(false);
      // Reformat with thousand separators
      setDisplayValue(formatNumber(value));
    };

    return (
      <Input
        ref={ref}
        type="text"
        inputMode="numeric"
        placeholder={placeholder}
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled}
        className={cn("text-right", className)}
        {...props}
      />
    );
  }
);

CurrencyInput.displayName = "CurrencyInput";

// Simple number input with thousand separator (for non-currency numbers like stock)
interface NumberInputProps {
  value?: number;
  onChange?: (value: number) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  min?: number;
  max?: number;
}

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  ({ value = 0, onChange, placeholder, className, disabled, min, max, ...props }, ref) => {
    const [displayValue, setDisplayValue] = useState(formatNumber(value));
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
      if (!isFocused) {
        setDisplayValue(formatNumber(value));
      }
    }, [value, isFocused]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      const numericValue = parseNumber(inputValue);
      
      let constrainedValue = numericValue;
      if (min !== undefined && numericValue < min) constrainedValue = min;
      if (max !== undefined && numericValue > max) constrainedValue = max;
      
      setDisplayValue(formatNumber(constrainedValue));
      onChange?.(constrainedValue);
    };

    const handleFocus = () => {
      setIsFocused(true);
      setDisplayValue(value.toString());
    };

    const handleBlur = () => {
      setIsFocused(false);
      setDisplayValue(formatNumber(value));
    };

    return (
      <Input
        ref={ref}
        type="text"
        inputMode="numeric"
        placeholder={placeholder}
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled}
        className={cn("text-right", className)}
        {...props}
      />
    );
  }
);

NumberInput.displayName = "NumberInput";
