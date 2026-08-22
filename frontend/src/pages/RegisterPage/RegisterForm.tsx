import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { Button, Text, StackLayout } from '@salt-ds/core'
import { BASE_URL } from '../../api/client'

interface RegisterFormData {
  email: string
  password: string
  sme_name: string
  location_uk: string
}

interface RegisterFormProps {
  onSwitchToLogin: () => void
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
      navigate('/dashboard')
    } catch {
      setError('Connection error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <StackLayout gap={3}>
      <StackLayout gap={0.5}>
        <Text styleAs="h2" style={{ color: '#ffffff', fontWeight: 'bold' }}>Create Account</Text>
        <Text styleAs="label" style={{ color: '#94a3b8' }}>Join CommodEx — B2B Commodity Exchange</Text>
      </StackLayout>

      <StackLayout gap={2}>
        <div>
          <label style={{ color: '#94a3b8', fontSize: '12px', display: 'block', marginBottom: '6px' }}>Email</label>
          <input {...register('email', { required: true })} type="email" placeholder="you@company.com" style={inputStyle} />
          {errors.email && <Text style={{ color: '#f87171', fontSize: '12px' }}>Required</Text>}
        </div>

        <div>
          <label style={{ color: '#94a3b8', fontSize: '12px', display: 'block', marginBottom: '6px' }}>Password</label>
          <input {...register('password', { required: true, minLength: 6 })} type="password" placeholder="••••••••" style={inputStyle} />
          {errors.password && <Text style={{ color: '#f87171', fontSize: '12px' }}>Min 6 characters</Text>}
        </div>

        <div>
          <label style={{ color: '#94a3b8', fontSize: '12px', display: 'block', marginBottom: '6px' }}>Company Name</label>
          <input {...register('sme_name', { required: true })} placeholder="Acme Steel Ltd" style={inputStyle} />
          {errors.sme_name && <Text style={{ color: '#f87171', fontSize: '12px' }}>Required</Text>}
        </div>

        <div>
          <label style={{ color: '#94a3b8', fontSize: '12px', display: 'block', marginBottom: '6px' }}>Location (UK City)</label>
          <input {...register('location_uk')} placeholder="Glasgow" style={inputStyle} />
        </div>

        {error && <Text style={{ color: '#f87171', fontSize: '13px' }}>{error}</Text>}

        <Button
          onClick={handleSubmit(onSubmit)}
          // sentiment="accented"
          disabled={loading}
          style={{ width: '100%', padding: '12px', fontWeight: '600', fontSize: '15px' }}
        >
          {loading ? 'Creating account...' : 'Create Account'}
        </Button>

        <Text style={{ textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
          Already have an account?{' '}
          <span onClick={onSwitchToLogin} style={{ color: '#3b82f6', cursor: 'pointer', fontWeight: '500' }}>
            Login
          </span>
        </Text>
      </StackLayout>
    </StackLayout>
  )
}