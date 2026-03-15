# Configuración de Correo Real y SMTP en Supabase

Este documento explica cómo hacer la transición de los correos ficticios de prueba a tu correo real en el proyecto **SiteFlow**, y cómo configurar un servidor SMTP gratuito para eliminar el límite de 3 correos por hora de Supabase.

## 1. Cómo cambiar tu correo ficticio por el real (Mejor Práctica)

La mejor práctica es **no crear un usuario nuevo**, sino actualizar el usuario de prueba existente (el que ya tiene el rol de administrador y datos asociados) con tu correo real. De esta forma no pierdes la configuración ni los permisos.

La forma más rápida, limpia y efectiva (sin modificar el código de la aplicación) es hacerlo directamente en la base de datos de Supabase.

### Pasos para cambiar el correo:
1. Ve al panel de control de [Supabase](https://supabase.com/dashboard) y entra a tu proyecto **SiteFlow**.
2. En el menú lateral izquierdo, haz clic en **SQL Editor**.
3. Haz clic en **New query** (Nueva consulta).
4. Copia y pega el siguiente código en el editor, reemplazando los correos por los tuyos:

```sql
UPDATE auth.users
SET email = 'tu_correo_real@ejemplo.com'
WHERE email = 'correo_ficticio_actual@ejemplo.com';
```

5. Haz clic en el botón verde **Run** (Ejecutar). Si ves "Success" o "1 rows affected", el cambio fue exitoso.

### Pasos para cambiar la contraseña (Opcional):
Si también quieres actualizar la contraseña de ese usuario para que deje de ser la de prueba, puedes usar este otro comando SQL en el mismo editor:

```sql
UPDATE auth.users
SET encrypted_password = crypt('TuNuevaContraseña123', gen_salt('bf'))
WHERE email = 'tu_correo_real@ejemplo.com';
```

¡Listo! A partir de ahora, cuando entres a la aplicación, usarás tu correo real con la contraseña que hayas configurado.

---

## 2. Cómo configurar un Servidor SMTP Gratuito

Supabase utiliza por defecto su propia infraestructura para enviar los correos de OTP y Magic Links, pero tiene un límite estricto de **3 correos por hora**. Para eliminar este límite sin costo, la mejor opción es usar **Resend**, un servicio de envío de correos muy moderno que ofrece una capa gratuita de hasta 3,000 correos al mes (100 diarios).

### Paso A: Obtener credenciales en Resend
1. Ve a [Resend.com](https://resend.com/) y crea una cuenta gratuita.
2. Una vez dentro, ve a la sección **"API Keys"** en el menú lateral.
3. Haz clic en **"Create API Key"**.
4. Ponle un nombre (ej. `SiteFlow Supabase`) y dale permisos de "Full Access" o "Sending Access".
5. **Copia la API Key generada** (empieza con `re_...`). Guárdala bien porque no la volverás a ver.

*Nota sobre dominios:* Para enviar correos a cualquier persona, Resend te pedirá que verifiques un dominio propio en la sección **"Domains"**. Si solo te vas a enviar correos a tu propia dirección real de prueba, Resend permite usar su correo de pruebas (`onboarding@resend.dev`), pero la recomendación es registrar y verificar tu propio dominio (ej. `mi-empresa.com`) añadiendo unos registros DNS.

### Paso B: Configurar SMTP en Supabase
1. Vuelve al panel de tu proyecto **SiteFlow** en Supabase.
2. En el menú lateral, ve a **Project Settings** (el ícono de engranaje ⚙️) en la parte inferior.
3. Haz clic en **"Authentication"** dentro de la configuración.
4. Desplázate hacia abajo hasta encontrar la sección **"SMTP Settings"**.
5. Activa la opción **"Enable Custom SMTP"**.
6. Rellena los campos con la siguiente información de Resend:
   - **Host:** `smtp.resend.com`
   - **Port Number:** `465` (recomendado para cifrado seguro) o `587`.
   - **Username:** Escribe exactamente la palabra `resend`.
   - **Password:** Pega aquí la **API Key** que copiaste en el Paso A.
   - **Sender email:** El correo desde donde se enviarán los mensajes. Si no has verificado un dominio en Resend, usa `onboarding@resend.dev`. Si ya verificaste tu dominio, usa algo como `noreply@tu-dominio.com`.
   - **Sender name:** `SiteFlow App` (o el nombre que prefieras que vean los usuarios).
7. Haz clic en **"Save"** (Guardar).

**¡Felicidades!** Ahora todos los correos de OTP y autenticación se enviarán a través de Resend, lo que te permite hacer todas las pruebas que necesites sin preocuparte por los límites de Supabase.
