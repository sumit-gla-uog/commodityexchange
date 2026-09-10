import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { Text } from '@salt-ds/core'
import { BASE_URL } from '../../api/client'
import styles from './LoginForm.module.css'

interface LoginFormData {
  email: string
  password: string
}

interface LoginFormProps {
  onSwitchToRegister: () => void
}

export const LoginForm = ({ onSwitchToRegister }: LoginFormProps) => {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const result = await res.json()
      if (!res.ok) { setError(result.detail || 'Invalid credentials'); return }
      localStorage.setItem('token', result.token)
      localStorage.setItem('user', JSON.stringify(result.user))
      navigate('/dashboard')
    } catch {
      setError('Connection error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.headerGroup}>
        <Text styleAs="h2" className={styles.title}>Welcome Back</Text>
        <Text styleAs="label" className={styles.subtitle}>Sign in to your CommodEx account</Text>
      </div>

      <div className={styles.fieldsGroup}>
        <div className={styles.field}>
          <label className={styles.label}>Email</label>
          <input {...register('email', { required: true })} type="email" placeholder="you@company.com" className={styles.input} />
          {errors.email && <Text className={styles.errorText}>Required</Text>}
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Password</label>
          <input {...register('password', { required: true })} type="password" placeholder="********" className={styles.input} />
          {errors.password && <Text className={styles.errorText}>Required</Text>}
        </div>

        {error && <Text className={styles.formError}>{error}</Text>}

        <button
          onClick={handleSubmit(onSubmit)}
          disabled={loading}
          className={styles.submitButton}
        >
          {loading ? 'Signing in...' : 'Login'}
        </button>

        <Text className={styles.footerText}>
          Don't have an account?{' '}
          <span onClick={onSwitchToRegister} className={styles.registerLink}>
            Register Now
          </span>
        </Text>
      </div>
    </div>
  )
}