import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { Button, Text } from '@salt-ds/core'
import { BASE_URL } from '../../api/client'
import styles from './RegisterForm.module.css'

interface RegisterFormData {
  email: string
  password: string
  sme_name: string
  location_uk: string
}

interface RegisterFormProps {
  onSwitchToLogin: () => void
}

export const RegisterForm = ({ onSwitchToLogin }: RegisterFormProps) => {
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const result = await res.json()
      if (!res.ok) { setError(result.detail || 'Registration failed'); return }
      localStorage.setItem('token', result.token)
      localStorage.setItem('user', JSON.stringify(result.user))
      navigate('/')
      alert('Account created! Please login.')
    } catch {
      setError('Connection error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.headerGroup}>
        <Text styleAs="h2" className={styles.title}>Create Account</Text>
        <Text styleAs="label" className={styles.subtitle}>Join CommodEx, B2B Commodity Exchange</Text>
      </div>

      <div className={styles.fieldsGroup}>
        <div className={styles.field}>
          <label className={styles.label}>Email</label>
          <input {...register('email', { required: true })} type="email" placeholder="you@company.com" className={styles.input} />
          {errors.email && <Text className={styles.errorText}>Required</Text>}
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Password</label>
          <input {...register('password', { required: true, minLength: 6 })} type="password" placeholder="••••••••" className={styles.input} />
          {errors.password && <Text className={styles.errorText}>Min 6 characters</Text>}
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Company Name</label>
          <input {...register('sme_name', { required: true })} placeholder="Acme Steel Ltd" className={styles.input} />
          {errors.sme_name && <Text className={styles.errorText}>Required</Text>}
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Location (UK City)</label>
          <input {...register('location_uk')} placeholder="Glasgow" className={styles.input} />
        </div>

        {error && <Text className={styles.formError}>{error}</Text>}

        <button
          onClick={handleSubmit(onSubmit)}
          disabled={loading}
          className={styles.submitButton}
        >
          {loading ? 'Creating account...' : 'Create Account'}
        </button>

        <Text className={styles.footerText}>
          Already have an account?{' '}
          <span onClick={onSwitchToLogin} className={styles.loginLink}>
            Login
          </span>
        </Text>
      </div>
    </div>
  )
}