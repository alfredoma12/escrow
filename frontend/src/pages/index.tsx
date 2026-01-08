import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { Shield, CheckCircle, Lock, FileText } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Escrow Chile - Sistema de Custodia de Fondos para Vehículos</title>
        <meta name="description" content="Sistema seguro de custodia de fondos para la compra y venta de vehículos usados en Chile" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Shield className="h-8 w-8 text-primary-600" />
                <span className="text-2xl font-bold text-gray-900">Escrow Chile</span>
              </div>
              <div className="space-x-4">
                <Link href="/login" className="btn btn-secondary">
                  Iniciar Sesión
                </Link>
                <Link href="/register" className="btn btn-primary">
                  Registrarse
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <main>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <h1 className="text-5xl font-extrabold text-gray-900 mb-6">
                Compra y vende vehículos
                <br />
                <span className="text-primary-600">con total seguridad</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Sistema de custodia de fondos que protege tanto al comprador como al vendedor
                durante la transacción de vehículos usados en Chile.
              </p>
              <div className="flex justify-center space-x-4">
                <Link href="/register" className="btn btn-primary text-lg px-8 py-3">
                  Comenzar Ahora
                </Link>
                <Link href="#como-funciona" className="btn btn-secondary text-lg px-8 py-3">
                  ¿Cómo funciona?
                </Link>
              </div>
            </div>

            {/* Features */}
            <div className="mt-24 grid md:grid-cols-3 gap-8">
              <div className="card text-center">
                <div className="flex justify-center mb-4">
                  <Lock className="h-12 w-12 text-primary-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">Fondos Seguros</h3>
                <p className="text-gray-600">
                  El dinero queda en custodia hasta que se complete la transferencia del vehículo.
                </p>
              </div>

              <div className="card text-center">
                <div className="flex justify-center mb-4">
                  <CheckCircle className="h-12 w-12 text-primary-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">Proceso Transparente</h3>
                <p className="text-gray-600">
                  Seguimiento en tiempo real del estado de tu operación.
                </p>
              </div>

              <div className="card text-center">
                <div className="flex justify-center mb-4">
                  <FileText className="h-12 w-12 text-primary-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">Validación de Documentos</h3>
                <p className="text-gray-600">
                  Sistema de carga y validación de documentos legales.
                </p>
              </div>
            </div>

            {/* How it works */}
            <div id="como-funciona" className="mt-24">
              <h2 className="text-3xl font-bold text-center mb-12">¿Cómo funciona?</h2>
              <div className="space-y-8 max-w-3xl mx-auto">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">Crear Operación</h4>
                    <p className="text-gray-600">
                      Comprador y vendedor acuerdan precio y plazo. Se crea la operación en el sistema.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">Aceptar Términos</h4>
                    <p className="text-gray-600">
                      Ambas partes aceptan el contrato de custodia de fondos.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">Depósito de Fondos</h4>
                    <p className="text-gray-600">
                      El comprador transfiere el dinero a la cuenta escrow. Un administrador valida el depósito.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                    4
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">Firmar en Notaría</h4>
                    <p className="text-gray-600">
                      Las partes realizan la firma de compraventa en notaría (proceso externo).
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                    5
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">Liberación de Fondos</h4>
                    <p className="text-gray-600">
                      Se suben los documentos firmados. El administrador valida y libera los fondos al vendedor.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="mt-24 card bg-yellow-50 border-yellow-200">
              <h3 className="font-bold text-lg mb-2 text-yellow-900">⚠️ Importante</h3>
              <p className="text-yellow-800 text-sm">
                Este sistema solo se encarga de la <strong>custodia de fondos</strong>. No garantiza aspectos
                legales, mecánicos o documentales del vehículo. La notaría y transferencia son procesos
                externos que deben gestionar las partes. Escrow Chile no es un banco ni una institución
                financiera regulada.
              </p>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-8 mt-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p>&copy; 2026 Escrow Chile. Sistema de Custodia de Fondos.</p>
            <p className="text-sm text-gray-400 mt-2">
              Desarrollado con seguridad y transparencia para el mercado chileno.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
