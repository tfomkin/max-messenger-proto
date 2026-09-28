import { useState, type FormEvent } from 'react'
import { ValidationError } from 'yup'
import { useChatStore } from '@/store/chatStore'
import formStyles from '@/shared/ui/form.module.css'
import { loginSchema } from './loginSchema'
import styles from './LoginPage.module.css'

const FIELDS = [
  {
    name: 'idInstance' as const,
    label: 'idInstance',
    placeholder: '3100000000',
  },
  {
    name: 'apiTokenInstance' as const,
    label: 'apiTokenInstance',
    placeholder: 'токен из кабинета GREEN-API',
  },
  {
    name: 'apiUrl' as const,
    label: 'apiUrl',
    placeholder: 'https://api.green-api.com',
  },
]

export function LoginPage() {
  const login = useChatStore((state) => state.login)
  const [values, setValues] = useState({
    idInstance: '',
    apiTokenInstance: '',
    apiUrl: 'https://api.green-api.com',
  })
  const [error, setError] = useState<string | null>(null)

  const submit = async () => {
    try {
      const validated = await loginSchema.validate(values, { abortEarly: true })
      setError(null)
      login(validated)
    } catch (err) {
      if (err instanceof ValidationError) {
        setError(err.message)
        return
      }
      throw err
    }
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    void submit()
  }

  return (
    <div className={styles.page}>
      <form className={styles.card} onSubmit={handleSubmit}>
        <div className={styles.brand}>
          <div className={styles.logo} aria-hidden>
            M
          </div>
          <h1 className={styles.title}>MAX</h1>
          <p className={styles.subtitle}>
            Введите учётные данные GREEN-API для входа в чат
          </p>
        </div>

        {FIELDS.map((field) => (
          <label key={field.name} className={formStyles.field}>
            <span>{field.label}</span>
            <input
              value={values[field.name]}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  [field.name]: event.target.value,
                }))
              }
              placeholder={field.placeholder}
              autoComplete="off"
            />
          </label>
        ))}

        {error ? <p className={formStyles.error}>{error}</p> : null}

        <button type="submit" className={styles.submit}>
          Войти
        </button>
      </form>
    </div>
  )
}
