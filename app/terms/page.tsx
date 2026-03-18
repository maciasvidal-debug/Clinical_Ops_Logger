import React from 'react';
import { TermsAndPrivacyContent } from '@/components/legal/TermsAndPrivacyContent';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-3xl">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Términos y Condiciones de Uso y Política de Privacidad
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Última actualización: 18 de marzo de 2026
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-3xl">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="prose max-w-none text-gray-700 space-y-6">
            <TermsAndPrivacyContent />
          </div>
        </div>
      </div>
    </div>
  );
}
