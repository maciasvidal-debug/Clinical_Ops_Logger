import re

with open('app/terms/page.tsx', 'r') as f:
    content = f.read()

new_section = """
            <h3 className="text-xl font-bold text-gray-900 mt-12 mb-4 border-t pt-8">ANEXO: POLÍTICA TÉCNICA DE SEGURIDAD Y PRIVACIDAD (ESTÁNDAR 2026)</h3>
            <p className="mb-6">
              Este anexo detalla las medidas organizativas y técnicas adoptadas por SiteFlow para garantizar la integridad, confidencialidad y disponibilidad de los datos, cumpliendo con la Ley 21.719 (Chile) y el Art. 32 del RGPD.
            </p>

            <h4 className="text-lg font-semibold text-gray-800 mt-6 mb-3">1. MEDIDAS DE SEGURIDAD TÉCNICA</h4>
            <p>Para proteger la infraestructura de la Web App, implementamos:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Cifrado en Tránsito:</strong> Uso obligatorio de protocolos TLS 1.3 (HTTPS) para toda comunicación entre el navegador del usuario y nuestros servidores.</li>
              <li><strong>Cifrado en Reposo (Privacy by Design):</strong> Los datos sensibles gestionados por la aplicación y almacenados temporalmente en el dispositivo del usuario (localStorage) se cifran localmente de extremo a extremo mediante algoritmos AES-GCM (Web Crypto API) antes de su persistencia. En nuestros servidores, las bases de datos en reposo están cifradas mediante algoritmos AES-256.</li>
              <li><strong>Hash de Contraseñas y Autenticación Segura:</strong> Las contraseñas nunca se almacenan en texto plano; utilizamos funciones de derivación de claves robustas (ej. BCrypt con salt aleatorio) gestionadas por nuestro proveedor de identidad (Supabase GoTrue).</li>
              <li><strong>Firewalls y WAF:</strong> Despliegue de un Web Application Firewall para mitigar ataques de Inyección SQL, Cross-Site Scripting (XSS) y ataques de denegación de servicio (DDoS).</li>
            </ul>

            <h4 className="text-lg font-semibold text-gray-800 mt-6 mb-3">2. GESTIÓN DE ACCESO Y AUTENTICACIÓN</h4>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Principio de Privilegio Mínimo:</strong> Solo el personal técnico crítico tiene acceso a las bases de datos de producción, limitado estrictamente a tareas de mantenimiento mediante roles y políticas RLS (Row Level Security).</li>
              <li><strong>Autenticación Segura (OTP/Magic Links):</strong> Ofrecemos y priorizamos el uso de &quot;Magic Links&quot; y Códigos de Un Solo Uso (OTP) enviados por correo electrónico para garantizar una autenticación robusta y mitigar los riesgos asociados a contraseñas débiles.</li>
              <li><strong>Logs de Auditoría:</strong> Registramos de forma inalterable quién, cuándo y desde dónde se accedió a los datos críticos de la plataforma para fines de trazabilidad.</li>
            </ul>

            <h4 className="text-lg font-semibold text-gray-800 mt-6 mb-3">3. PROTOCOLO DE BRECHAS DE SEGURIDAD</h4>
            <p>En caso de una filtración o acceso no autorizado (Incidente de Seguridad):</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Notificación a la Autoridad:</strong> Informaremos a la Agencia de Protección de Datos Personales (Chile) y, si aplica, a la autoridad de control del RGPD, en un plazo máximo de 72 horas tras tener constancia del incidente.</li>
              <li><strong>Comunicación al Usuario:</strong> Si la brecha supone un riesgo para los derechos y libertades del Usuario, se le notificará vía correo electrónico de forma inmediata con recomendaciones de seguridad.</li>
            </ul>

            <h4 className="text-lg font-semibold text-gray-800 mt-6 mb-3">4. SUBCONTRATACIÓN DE SERVICIOS (ENCARGADOS DE TRATAMIENTO)</h4>
            <p>Utilizamos proveedores de infraestructura de primer nivel que cumplen con certificaciones ISO 27001 y SOC2. Nuestros principales &quot;Encargados de Tratamiento&quot; son:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Hosting de la Aplicación Web (Frontend):</strong> Vercel Inc., con servidores globales en el Edge para asegurar alta disponibilidad.</li>
              <li><strong>Infraestructura de Backend, Base de Datos y Autenticación:</strong> Supabase (alojado en infraestructura de Amazon Web Services - AWS), que actúa como proveedor central de identidad y persistencia de datos bajo los más altos estándares de cumplimiento de la industria.</li>
            </ul>

            <h4 className="text-lg font-semibold text-gray-800 mt-6 mb-3">5. POLÍTICA DE COOKIES Y RASTREO (COOKIES TÉCNICAS)</h4>
            <p>
              <strong>Solo Cookies Esenciales:</strong> SiteFlow respeta profundamente su privacidad y <strong>no utiliza cookies de marketing, rastreo de terceros o análisis de comportamiento</strong>. Solo utilizamos tokens y cookies estrictamente técnicas (esenciales) requeridas para mantener la sesión abierta, gestionar la autenticación y garantizar la seguridad de la aplicación. Por lo tanto, al no utilizar cookies no esenciales, la Plataforma no requiere mostrar banners de consentimiento de cookies invasivos.
            </p>

            <h4 className="text-lg font-semibold text-gray-800 mt-6 mb-3">6. BORRADO LÓGICO Y RETENCIÓN DE DATOS (AUDITORÍA CLÍNICA)</h4>
            <p>
              Dada la naturaleza de la plataforma (Clinical Ops Tracker), que registra tiempos y actividades vinculados a operaciones de investigación clínica, implementamos un proceso de <strong>Borrado con Anonimización</strong>. Si un Usuario ejerce su derecho al olvido y elimina su cuenta:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Se eliminarán inmediata y físicamente todos sus datos personales directos (nombre, apellidos, correo electrónico, perfil).</li>
              <li>Sus registros de actividad (logs de tiempo) se conservarán únicamente con fines estadísticos y de cumplimiento normativo de auditoría clínica, quedando permanentemente disociados y vinculados a un identificador completamente anónimo (&quot;Usuario Eliminado&quot;), sin posibilidad de reidentificación.</li>
            </ul>

            <h4 className="text-lg font-semibold text-gray-800 mt-6 mb-3">7. DERECHO A LA PORTABILIDAD (IMPLEMENTACIÓN)</h4>
            <p>
              El Usuario puede ejercer su derecho a la portabilidad descargando su &quot;Expediente de Datos Personales&quot; directamente desde la pestaña de Configuración General en su panel de usuario. El archivo se genera en tiempo real y se entrega en formato estructurado e interoperable (.JSON) conforme a la normativa de 2026.
            </p>
"""

# Insert the new section just before the final closing </div></div></div>
content = re.sub(r'(</p>\s*</div>\s*</div>\s*</div>\s*</div>\s*\);\s*})', new_section + r'\1', content)

with open('app/terms/page.tsx', 'w') as f:
    f.write(content)
