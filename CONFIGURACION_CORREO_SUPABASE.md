# Configuración de Correo Real y SMTP en Supabase

Este documento explica cómo hacer la transición de los correos ficticios de prueba a tu correo real en el proyecto **SiteFlow**, y cómo configurar un servidor SMTP gratuito para eliminar el límite de 3 correos por hora de Supabase.

## 1. Cómo cambiar tu correo ficticio por el real (Mejor Práctica)

La mejor práctica es **no crear un usuario nuevo**, sino actualizar el usuario de prueba existente (el que ya tiene el rol de administrador y datos asociados) con tu correo real. De esta forma no pierdes la configuración ni los permisos.

### Pasos:
1. Ve al panel de control de [Supabase](https://supabase.com/dashboard) y entra a tu proyecto **SiteFlow**.
2. En el menú lateral izquierdo, haz clic en **Authentication** (icono de usuarios).
3. Asegúrate de estar en la pestaña **Users**.
4. Busca en la lista el correo ficticio que has estado usando para entrar como administrador.
5. Haz clic en el ícono de los **tres puntos verticales (⋮)** a la derecha de ese usuario y selecciona **"Edit user"** (Editar usuario).
6. En el campo **Email Address**, borra el correo ficticio y escribe **tu correo real**.
7. Si ves una opción que dice *"Send confirmation email"* o similar, puedes desmarcarla para que el cambio se aplique inmediatamente, o dejarla marcada y luego ir a tu bandeja de entrada real para confirmar el cambio.
8. Haz clic en **"Save"** (Guardar).

¡Listo! A partir de ahora, cuando entres a la aplicación, usarás tu correo real. Al solicitar el acceso, el código OTP o el Magic Link llegará directamente a tu bandeja de entrada.

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
