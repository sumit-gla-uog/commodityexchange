import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { Button, Text, StackLayout } from '@salt-ds/core'
import { BASE_URL } from '../../api/client'

interface LoginFormData {
  email: string
  password: string
}

interface LoginFormProps {
  onSwitchToRegister: () => void
}

const inputStyle = {
  width: '100%',
  backgroundColor: '#1a1f2e',
  border: '1px solid #2d3748',
  borderRadius: '8px',
  padding: '12px 16px',
  color: '#ffffff',
  fontSize: '14px',
  boxSizing: 'border-box' as const,
  outline: 'none'
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
    <StackLayout gap={5}>
      <StackLayout gap={5}>
        <Text styleAs="h2" style={{ color: '#ffffff', fontWeight: 'bold' }}>Welcome Back</Text>
        <Text styleAs="label" style={{ color: '#94a3b8' }}>Sign in to your CommodEx account</Text>
      </StackLayout>

      <StackLayout gap={5}>
        <div>
          <label style={{ color: '#94a3b8', fontSize: '16px', display: 'block', marginBottom: '6px' }}>Email</label>
          <input {...register('email', { required: true })} type="email" placeholder="you@company.com" style={inputStyle} />
          {errors.email && <Text style={{ color: '#f87171', fontSize: '12px' }}>Required</Text>}
        </div>

        <div>
          <label style={{ color: '#94a3b8', fontSize: '16px', display: 'block', marginBottom: '6px' }}>Password</label>
          <input {...register('password', { required: true })} type="password" placeholder="••••••••" style={inputStyle} />
          {errors.password && <Text style={{ color: '#f87171', fontSize: '12px' }}>Required</Text>}
        </div>

        {error && <Text style={{ color: '#f87171', fontSize: '13px' }}>{error}</Text>}

        <button
          onClick={handleSubmit(onSubmit)}
          // sentiment="accented"
          disabled={loading}
          style={{
            width: '100%',
            backgroundColor: '#3b82f6',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            padding: '13px',
            fontWeight: '600',
            fontSize: '15px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? 'Signing in...' : 'Login'}
        </button>

        <Text style={{ textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
          Don't have an account?{' '}
          <span onClick={onSwitchToRegister} style={{ color: '#3b82f6', cursor: 'pointer', fontWeight: '500' }}>
            Register Now
          </span>
        </Text>
      </StackLayout>
    </StackLayout>
  )
}