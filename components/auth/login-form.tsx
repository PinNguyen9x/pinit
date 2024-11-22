import { useLoginFormSchema } from '@/hooks'
import { LoginPayload } from '@/models'
import { yupResolver } from '@hookform/resolvers/yup'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import { Box, Button, CircularProgress, IconButton, InputAdornment } from '@mui/material'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { InputField } from '../form'

export interface LoginFormProps {
  onSubmit?: (values: LoginPayload) => void
}

export function LoginForm({ onSubmit }: LoginFormProps) {
  const schema = useLoginFormSchema()
  const [showPassword, setShowPassword] = useState(false)
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginPayload>({
    defaultValues: {
      username: '',
      password: '',
    },
    resolver: yupResolver(schema),
  })
  const handleLoginSubmit = async (values: LoginPayload) => {
    await onSubmit?.(values)
  }
  return (
    <Box component="form" onSubmit={handleSubmit(handleLoginSubmit)}>
      <InputField name="username" control={control} label="Username" />
      <InputField
        name="password"
        type={showPassword ? 'text' : 'password'}
        control={control}
        label="Password"
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                edge="end"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      <Button
        disabled={isSubmitting}
        startIcon={isSubmitting ? <CircularProgress color="inherit" size="1em" /> : null}
        type="submit"
        variant="contained"
        sx={{ mt: 3 }}
        fullWidth
      >
        Login
      </Button>
    </Box>
  )
}
