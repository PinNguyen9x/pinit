import { TextField, TextFieldProps } from '@mui/material'
import { ChangeEvent } from 'react'
import { Control, FieldValues, Path, useController } from 'react-hook-form'

type InputFieldProps<T extends FieldValues> = TextFieldProps & {
  name: Path<T>
  control: Control<T>
}

export function InputField<T extends FieldValues>({
  name,
  label,
  control,
  onChange: externamOnchange,
  onBlur: externamOnBlur,
  ...props
}: InputFieldProps<T>) {
  const {
    field: { onChange, onBlur, value, ref },
    fieldState: { error },
  } = useController({
    name,
    control,
  })
  return (
    <TextField
      fullWidth
      margin="normal"
      size="small"
      name={name}
      label={label}
      onChange={(e: ChangeEvent<HTMLInputElement>) => {
        onChange(e)
        externamOnchange?.(e)
      }}
      onBlur={onBlur}
      inputRef={ref}
      value={value}
      error={!!error}
      helperText={error?.message}
      {...props}
    />
  )
}
