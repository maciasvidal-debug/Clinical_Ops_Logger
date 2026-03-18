import React from 'react';

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
            <p>
              El presente documento establece los términos legales que rigen el uso de la aplicación web <strong>SiteFlow - Clinical Ops Logger</strong> (en adelante, la &quot;Plataforma&quot;), propiedad de Michael Macias Vidal, RUT 26.029.005-3, con domicilio en Av. Santa María 0206, Providencia, Santiago, Chile.
            </p>
            <p>
              Al registrarse o utilizar la Plataforma, el usuario (en adelante, el &quot;Usuario&quot;) declara ser mayor de edad, y haber leído, entendido y aceptado sin reservas los presentes términos.
            </p>

            <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">1. IDENTIFICACIÓN Y CONTACTO</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Proveedor:</strong> Michael Macias Vidal</li>
              <li><strong>Representante Legal:</strong> Michael Macias Vidal</li>
              <li><strong>Correo electrónico de soporte y privacidad:</strong> michaelmaciasvidal@hotmail.com</li>
              <li><strong>Teléfono de contacto:</strong> +56 9 3330 9095</li>
            </ul>

            <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">2. OBJETO DEL SERVICIO</h3>
            <p>
              La Plataforma ofrece servicios de Software (SaaS) diseñados específicamente para la gestión, registro y trazabilidad de operaciones clínicas. SiteFlow permite a profesionales de investigación clínica (como CRAs, CRCs y Managers) registrar sus actividades, tiempos, bitácoras (logs) y visitas a sitios de investigación. Actualmente, el acceso y uso de las funcionalidades básicas de la Plataforma se ofrece de manera gratuita, sin perjuicio de que el Proveedor se reserve el derecho de modificar esta condición en el futuro, previo aviso al Usuario.
            </p>

            <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">3. CONDICIONES DE USO Y GRATUIDAD</h3>
            <p>Dado que la Plataforma se ofrece actualmente de forma gratuita, el Usuario reconoce y acepta que:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>El Proveedor no asume ninguna obligación de mantener el servicio gratuito a perpetuidad.</li>
              <li>En caso de que se implementen modelos de suscripción o tarifas en el futuro, los Usuarios serán notificados con antelación y tendrán la opción de aceptar los nuevos términos comerciales o cancelar su cuenta.</li>
              <li>Las disposiciones relativas a garantías legales y derechos de retracto por compras digitales contempladas en la Ley 19.496 (Ley del Consumidor) no son aplicables en esta etapa de gratuidad, sin perjuicio de los derechos irrenunciables que la ley otorgue a los usuarios de servicios gratuitos.</li>
            </ul>

            <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">4. PROTECCIÓN DE DATOS PERSONALES (LEY 21.719 Y RGPD)</h3>
            <p>
              De acuerdo con la Ley de Protección de Datos de Chile y el Reglamento General de Protección de Datos (RGPD) de la Unión Europea, informamos lo siguiente:
            </p>

            <h4 className="text-lg font-semibold text-gray-800 mt-6 mb-3">4.1. Base de Licitud</h4>
            <p>El tratamiento de sus datos se basa en:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Consentimiento Explícito:</strong> Al marcar la casilla de aceptación durante el registro.</li>
              <li><strong>Ejecución del Contrato:</strong> Necesario para proveer el servicio principal de la Web App (gestión de cuentas, registro de actividades y métricas).</li>
            </ul>

            <h4 className="text-lg font-semibold text-gray-800 mt-6 mb-3">4.2. Derechos del Usuario (ARCO-P)</h4>
            <p>
              Usted puede ejercer en cualquier momento los siguientes derechos enviando un correo a michaelmaciasvidal@hotmail.com o utilizando las herramientas automatizadas dentro de la Plataforma:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Acceso:</strong> Saber qué datos tenemos de usted.</li>
              <li><strong>Rectificación:</strong> Corregir datos inexactos.</li>
              <li><strong>Cancelación (Supresión/Olvido):</strong> Solicitar el borrado definitivo de sus datos y registros de actividad.</li>
              <li><strong>Oposición:</strong> Negarse a ciertos tratamientos (ej. comunicaciones de marketing).</li>
              <li><strong>Portabilidad:</strong> Derecho a descargar y recibir sus datos personales y registros de actividad (logs, horas) en un formato estructurado y legible por máquina (JSON) desde su panel de usuario.</li>
              <li><strong>Derecho a Reclamar:</strong> Tiene derecho a presentar una reclamación ante la Agencia de Protección de Datos competente si considera que el tratamiento no se ajusta a la normativa vigente.</li>
            </ul>

            <h4 className="text-lg font-semibold text-gray-800 mt-6 mb-3">4.3. Conservación, Seguridad y Transferencia Internacional</h4>
            <p>
              Los datos se conservarán mientras dure la relación contractual o hasta que el Usuario solicite su supresión. Implementamos medidas de cifrado SSL en tránsito y cifrado avanzado (AES-GCM) para el almacenamiento local de datos en su dispositivo. Utilizamos proveedores de infraestructura en la nube (Cloud) de primer nivel, lo que puede implicar la transferencia internacional de datos, salvaguardada mediante Cláusulas Contractuales Tipo (SCC) y estrictos estándares de seguridad industrial.
            </p>

            <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">5. PROPIEDAD INTELECTUAL</h3>
            <p>
              Todo el software, código fuente, logotipos, diseños y contenidos de la Plataforma son propiedad exclusiva de Michael Macias Vidal. Se otorga al Usuario una licencia de uso personal, profesional, revocable, no exclusiva y no transferible. Queda estrictamente prohibida cualquier forma de ingeniería inversa, modificación o copia del código.
            </p>

            <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">6. USOS PROHIBIDOS Y RESTRICCIÓN DE DATOS DE SALUD</h3>
            <p>El Usuario se obliga a no:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Utilizar la Plataforma para actividades ilícitas según las leyes aplicables.</li>
              <li>Introducir virus, troyanos o cualquier código malicioso.</li>
              <li>Suplantar la identidad de otros usuarios o del personal de la empresa.</li>
              <li className="text-red-600 font-bold bg-red-50 p-2 rounded">
                [MUY IMPORTANTE] Ingresar Información Personal de Salud (PHI), Identificadores de Pacientes (ej. RUT, SSN, iniciales, fechas de nacimiento completas) o cualquier dato de salud sensible de sujetos de investigación clínica en los campos de texto, notas o logs de la Plataforma. SiteFlow es una herramienta de gestión de operaciones (Clinical Ops), no un repositorio de datos de pacientes (eCRF/EMR).
              </li>
            </ul>

            <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">7. LIMITACIÓN DE RESPONSABILIDAD</h3>
            <p>
              La Plataforma se provee &quot;tal cual&quot;. Si bien garantizamos un alto estándar de disponibilidad y resiliencia, no nos hacemos responsables por:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Interrupciones breves por mantenimiento programado.</li>
              <li>Fallas en las redes de telecomunicaciones ajenas a nuestra infraestructura.</li>
              <li>Pérdida de datos derivada del mal uso de las credenciales por parte del Usuario o incumplimiento de sus propias políticas corporativas.</li>
            </ul>

            <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">8. MODIFICACIONES</h3>
            <p>
              Cualquier cambio sustancial en estos términos será notificado al Usuario mediante correo electrónico o un aviso destacado en la Web App con al menos 15 días de anticipación. El uso continuado de la Plataforma tras la modificación implica la aceptación ineludible de los nuevos términos.
            </p>

            <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">9. LEY APLICABLE Y JURISDICCIÓN</h3>
            <p>
              Este contrato se rige por las leyes de la República de Chile. Para cualquier controversia, las partes fijan su domicilio en la comuna de Providencia, sometiéndose a la competencia de sus Tribunales Ordinarios de Justicia, sin perjuicio de los derechos irrenunciables del consumidor de demandar en el tribunal correspondiente a su propio domicilio.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
