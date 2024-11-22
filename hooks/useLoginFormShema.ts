import * as yup from 'yup'
export function useLoginFormSchema() {
  return yup.object().shape({
    username: yup
      .string()
      .required('Please enter your username')
      .min(4, 'Username is required to have at least 4 characters'),
    password: yup
      .string()
      .required('Please enter your password')
      .min(6, 'Password is required to have at least 6 characters'),
  })
}
