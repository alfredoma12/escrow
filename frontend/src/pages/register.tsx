import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { Shield } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { UserRole } from '@/types';
import { toast } from 'sonner';
import { validateRut, formatRut } from '@/lib/utils';

export default function Register() {
  const router = useRouter();
  const register = useAuthStore((state) => state.register);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    rut: '',
    phone: '',
    role: UserRole.BUYER,
  });

  const handleRutChange = (value: string) => {
    const formatted = formatRut(value);
    setFormData({ ...formData, rut: formatted });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (!validateRut(formData.rut)) {
      toast.error('RUT inválido');
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);
      toast.success('Registro exitoso');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Registrarse - Escrow Chile</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Shield className="h-12 w-12 text-primary-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Escrow Chile</h1>
            <p className="text-gray-600 mt-2">Crea tu cuenta</p>
          </div>

          <div className="card">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Nombre Completo</label>
                <input
                  type="text"
                  className="input"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                  placeholder="Juan Pérez González"
                />
              </div>

              <div>
                <label className="label">RUT</label>
                <input
                  type="text"
                  className="input"
                  value={formData.rut}
                  onChange={(e) => handleRutChange(e.target.value)}
                  required
                  placeholder="12345678-9"
                  maxLength={12}
                />
              </div>

              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  className="input"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  placeholder="tu@email.com"
                />
              </div>

              <div>
                <label className="label">Teléfono (opcional)</label>
                <input
                  type="tel"
                  className="input"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+56912345678"
                />
              </div>

              <div>
                <label className="label">Tipo de Usuario</label>
                <select
                  className="input"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                >
                  <option value={UserRole.BUYER}>Comprador</option>
                  <option value={UserRole.SELLER}>Vendedor</option>
                </select>
              </div>

              <div>
                <label className="label">Contraseña</label>
                <input
                  type="password"
                  className="input"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  placeholder="••••••••"
                  minLength={8}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Mínimo 8 caracteres, incluye mayúsculas, minúsculas y números
                </p>
              </div>

              <div>
                <label className="label">Confirmar Contraseña</label>
                <input
                  type="password"
                  className="input"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={loading}
              >
                {loading ? 'Registrando...' : 'Registrarse'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                ¿Ya tienes cuenta?{' '}
                <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                  Inicia sesión aquí
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
