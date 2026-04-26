"use client"

import { NumericFormat } from "react-number-format"
import { Input } from "./input"
import { cn } from "@/lib/utils"

interface CurrencyInputProps {
  value?: number | string
  onChange?: (value: number) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function CurrencyInput({
  value,
  onChange,
  placeholder = "0",
  className,
  disabled,
}: CurrencyInputProps) {
  return (
    <NumericFormat
      value={value ?? ""}
      onValueChange={(values) => {
        onChange?.(values.floatValue ?? 0)
      }}
      thousandSeparator="."
      decimalSeparator=","
      decimalScale={0}
      allowNegative={false}
      prefix="Rp "
      placeholder={`Rp ${placeholder}`}
      customInput={Input}
      className={cn(className)}
      disabled={disabled}
    />
  )
}
