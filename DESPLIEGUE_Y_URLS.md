# Guía de Despliegue en Vercel y Configuración de URLs en Supabase

Este documento explica por qué **GitHub Pages no es adecuado** para esta aplicación, cómo desplegarla correctamente de forma gratuita en **Vercel**, y cómo configurar **Supabase** para que los correos de autenticación (Magic Links, OTP, confirmaciones) te redirijan a tu nueva URL pública en lugar de `localhost:3000`.

---

## 1. Por qué NO usar GitHub Pages

Esta aplicación está construida con **Next.js** y utiliza características avanzadas de servidor (Server-Side Rendering, Server Actions para conectar con Supabase, integración segura con la API de Gemini mediante el paquete `server-only`).

**GitHub Pages solo soporta sitios web estáticos** (HTML, CSS, JS básico). Si intentas desplegar esta aplicación en GitHub Pages, las funciones de servidor fallarán, la autenticación se romperá y la app no funcionará.

---

## 2. Cómo desplegar la aplicación gratis en Vercel (Recomendado)

**Vercel** es la plataforma creada por los mismos desarrolladores de Next.js. Es la opción más fácil, rápida y 100% gratuita para alojar proyectos personales y MVP (Producto Mínimo Viable).

### Pasos para el despliegue:

1. **Sube tu código a GitHub** (si no lo has hecho ya):
   Asegúrate de que todo el código de tu aplicación esté en un repositorio de tu cuenta de GitHub.

2. **Crea una cuenta en Vercel**:
   Ve a [Vercel.com](https://vercel.com/) y regístrate usando tu cuenta de **GitHub**. Esto le dará permisos a Vercel para ver tus repositorios.

3. **Importa tu proyecto**:
   - En el panel de Vercel, haz clic en **"Add New..."** -> **"Project"**.
   - Verás una lista de tus repositorios de GitHub. Busca el repositorio de **SiteFlow** (o como se llame tu proyecto) y haz clic en **"Import"**.

4. **Configura las Variables de Entorno (¡Muy importante!)**:
   - Vercel detectará automáticamente que es un proyecto Next.js.
   - Despliega la sección **"Environment Variables"** (Variables de entorno).
   - Necesitas copiar aquí las mismas variables que tienes en tu archivo `.env.local` en tu computadora. Como mínimo:
     - `NEXT_PUBLIC_SUPABASE_URL` (Tu URL de Supabase)
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Tu clave pública anónima de Supabase)
     - `SUPABASE_SERVICE_ROLE_KEY` (Si la estás usando)
     - `GEMINI_API_KEY` (Tu clave de Google AI Studio)
   - Pega el nombre y el valor de cada una y haz clic en **"Add"**.

5. **Despliega la aplicación**:
   Haz clic en el botón azul **"Deploy"**. Vercel construirá tu aplicación en un par de minutos. Al finalizar, te dará una URL pública funcional (por ejemplo: `https://siteflow-app.vercel.app`).

---

## 3. Cómo configurar la URL de redirección en Supabase

Ahora que tienes tu aplicación en internet con una URL real, debes decirle a Supabase que deje de enviar los correos de confirmación o contraseñas a `localhost:3000` y empiece a usar tu nueva URL de Vercel.

### Pasos en Supabase:

1. Ve a tu panel de [Supabase](https://supabase.com/dashboard) y entra a tu proyecto **SiteFlow**.
2. En el menú lateral izquierdo, haz clic en **Authentication** (icono de usuarios).
3. En el menú secundario (arriba a la izquierda), selecciona **URL Configuration**.

#### Actualizar el "Site URL":
4. En la sección **Site URL**, haz clic en el botón de edición.
5. Borra `http://localhost:3000` y **pega la URL pública que te dio Vercel** (ej. `https://siteflow-app.vercel.app`).
6. Asegúrate de que **no termine con una barra inclinada (`/`)**.
7. Haz clic en **Save**.

#### Actualizar los "Redirect URLs":
Los Redirect URLs son listas blancas de URLs a las que Supabase tiene permitido enviar a los usuarios después de hacer clic en un enlace de correo.

8. En la sección **Redirect URLs**, haz clic en **"Add URL"**.
9. Pega tu URL de Vercel seguida de `/**` (dos asteriscos). Por ejemplo:
   `https://siteflow-app.vercel.app/**`
   *(Esto le dice a Supabase: "Permite redirecciones a la página principal y a cualquier sub-página dentro de mi sitio").*
10. También puedes agregar `http://localhost:3000/**` a la lista. Esto es muy útil para que, cuando estés programando en tu computadora, los enlaces de correo sigan funcionando localmente.
11. Dale a **Save**.

¡Listo! A partir de ahora, cualquier correo de confirmación de registro, OTP, Magic Link o reseteo de contraseña redirigirá correctamente a tu aplicación en vivo, permitiendo que la sesión se inicie correctamente.
