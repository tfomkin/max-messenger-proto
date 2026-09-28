import * as yup from 'yup'

export const loginSchema = yup.object({
  idInstance: yup
    .string()
    .trim()
    .required('Введите idInstance')
    .matches(/^\d+$/, 'idInstance должен содержать только цифры'),
  apiTokenInstance: yup.string().trim().required('Введите apiTokenInstance'),
  apiUrl: yup
    .string()
    .trim()
    .required('Введите apiUrl')
    .url('Введите корректный URL'),
})

export type LoginFormValues = yup.InferType<typeof loginSchema>
