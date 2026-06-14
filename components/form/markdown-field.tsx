import { Box, FormHelperText, TextField, Typography } from '@mui/material'
import { Control, FieldValues, Path, useController } from 'react-hook-form'

type MarkdownFieldProps<T extends FieldValues> = {
  name: Path<T>
  control: Control<T>
  label?: string
  placeholder?: string
  minRows?: number
}

// Plain monospace Markdown editor. Content is rendered server-side through the
// shared `renderMarkdown` pipeline (GFM + ```mermaid diagrams + prism), so the
// admin can author case studies with code blocks and architecture flowcharts.
export function MarkdownField<T extends FieldValues>({
  name,
  control,
  label,
  placeholder,
  minRows = 16,
}: MarkdownFieldProps<T>) {
  const {
    field: { onChange, value },
    fieldState: { error },
  } = useController({ name, control })

  return (
    <Box sx={{ my: 2 }}>
      {label && (
        <Typography variant="body2" sx={{ mb: 1 }}>
          {label}
        </Typography>
      )}
      <TextField
        fullWidth
        multiline
        minRows={minRows}
        value={(value as string) ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        error={!!error}
        InputProps={{
          sx: {
            alignItems: 'flex-start',
            fontFamily: '"JetBrains Mono", ui-monospace, monospace',
            fontSize: 13,
            lineHeight: 1.6,
          },
        }}
      />
      <FormHelperText error={!!error}>
        {error?.message ?? 'Hỗ trợ Markdown, bảng, code, và ```mermaid để vẽ sơ đồ kiến trúc.'}
      </FormHelperText>
    </Box>
  )
}
