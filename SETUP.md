# Guía de configuración

Este proyecto es un sitio Next.js con 4 secciones (Libros, Agendas, Artesanías, Varios), carrito de
compra, pago con Mercado Pago, registro de usuarios y un repositorio de libros protegido por
pago o código. Para que funcione de punta a punta hace falta crear tres cuentas externas gratuitas
(Supabase, Mercado Pago, Resend) y cargar sus credenciales en variables de entorno.

## 0. Antes de arrancar

Este repo es una copia del sitio Lua Azul, vaciada de contenido específico, para usar como base de
sitios nuevos para otros clientes. Antes de tocar cuentas externas:

1. **Personalizar la marca**: editá [`lib/seo.ts`](lib/seo.ts) — ahí están centralizados
   `SITE_NAME`, `CONTACT_EMAIL`, `WHATSAPP_NUMBER` e `INSTAGRAM_ACCOUNTS`. Cambiarlos ahí alcanza
   para actualizar el nombre en el header, footer, metadatos SEO, emails automáticos y botón de
   WhatsApp — no hace falta tocar cada componente.
2. **Reemplazar imágenes**: `public/logo-icon.png`, `public/logo-full.png`, `app/icon.png` y
   `app/favicon.ico` todavía son los de Lua Azul (el build los necesita para no romperse, por eso
   no se borraron). Reemplazalos por los del cliente nuevo antes de lanzar.
3. **Cliente actual: Isabel.** Todas las cuentas — GitHub, Vercel, Supabase, Resend, Mercado Pago
   y el dominio — van a nombre de ella, no del desarrollador. Yo (Claude) no puedo crear ninguna
   de esas cuentas: requieren sus datos personales/de pago y aceptar términos de servicio de cada
   servicio, así que ese paso lo hace ella (o vos, con sus datos y su ok) directamente en cada
   sitio. Una vez creadas, yo puedo ayudar a configurar cada una (SQL, variables de entorno,
   conectar el repo a Vercel, etc.) si tengo acceso o si me van pasando lo que hace falta.

## 0.1 GitHub (antes que nada — el resto depende de esto)

Este repo hoy es local, sin remoto. Para conectarlo:

1. Isabel crea una cuenta en [github.com](https://github.com) (gratis).
2. Crea un repositorio nuevo, **vacío** (sin README/licencia, para no pisar lo que ya hay acá) —
   por ejemplo `isabel-sitio` — en público o privado, como prefiera.
3. Te agrega como **colaborador** (Settings → Collaborators, con tu usuario de GitHub) para que
   puedas pushear código sin que ella tenga que compartirte su contraseña.
4. Con eso, desde acá:
   ```bash
   git remote add origin https://github.com/<usuario-de-isabel>/<nombre-repo>.git
   git push -u origin master
   ```

## 1. Supabase (base de datos, login y archivos)

1. Creá una cuenta en [supabase.com](https://supabase.com) y un proyecto nuevo (elegí una región
   cercana, por ejemplo São Paulo).
2. **Importante — desactivá la traducción automática del navegador antes de tocar el SQL Editor.**
   Si Chrome traduce la página, puede alterar visualmente el texto de las consultas y de los nombres
   de tablas mientras lo escribís/pegás (aunque lo que se ejecuta contra la base suele quedar bien,
   la *vista* se corrompe y termina confundiendo). Anda a `chrome://settings/languages`, o cuando te
   aparezca el cartel de traducción hacé click y elegí "Ver página original" / "Show original".
3. Andá a **SQL Editor** y pegá el contenido de [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql)
   **abriendo el archivo directamente** (no copiando desde un chat, para evitar que se corte o se le
   cambien caracteres). Ejecutalo una sola vez: crea todas las tablas, los buckets de almacenamiento
   (`covers`, `books`, `agenda-photos`, `artesania-photos`) y las políticas de seguridad (RLS). Si el
   editor tira un error de sintaxis raro, probá seleccionar todo y borrar antes de pegar de nuevo.
4. Andá a **Project Settings → API Keys** y copiá:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - **Publishable key** (`sb_publishable_...`; en proyectos viejos puede llamarse `anon public`) →
     `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Secret key** (`sb_secret_...`; en proyectos viejos `service_role`, ¡secreta, nunca la expongas
     en el frontend!) → `SUPABASE_SERVICE_ROLE_KEY`
5. Registrate normalmente en el sitio (`/cuenta/registro`) con el email que vas a usar como
   administrador. Después, en el **SQL Editor** de Supabase, marcalo como admin:
   ```sql
   update public.profiles set is_admin = true where email = 'tu-email@ejemplo.com';
   ```
   Con eso ya podés entrar a `/admin` para cargar libros, agendas, artesanías y productos varios.
6. Por defecto Supabase pide **confirmar el email** antes de dejar iniciar sesión. Revisá la bandeja
   de entrada (y spam) del email que usaste, o desactivá esa confirmación en **Authentication →
   Providers → Email** mientras estás probando en local.

## 2. Mercado Pago (cobros)

**Esta cuenta tiene que ser del cliente** (en este proyecto, Isabel) — ahí es donde le va a entrar
el dinero de las ventas. Si necesitás ayuda de ella para crearla, pedísela con su documentación y
CBU/CVU a mano, pero la cuenta y las credenciales quedan a su nombre.

1. Creá una cuenta en [mercadopago.com.ar/developers](https://www.mercadopago.com.ar/developers/panel).
2. Creá una aplicación. Vas a tener dos juegos de credenciales:
   - **Credenciales de prueba (TEST-...)**: usalas mientras desarrollás. Los pagos no son reales;
     Mercado Pago te da tarjetas de prueba para simular compras aprobadas/rechazadas.
   - **Credenciales de producción**: recién activalas cuando el sitio esté en vivo y quieras cobrar
     de verdad.
3. Copiá el **Access Token** → `MERCADOPAGO_ACCESS_TOKEN` y la **Public Key** → `MERCADOPAGO_PUBLIC_KEY`.
4. El webhook de pagos (`/api/mercadopago/webhook`) necesita una URL pública para que Mercado Pago le
   avise cuándo se aprueba un pago. En local no funciona (localhost no es accesible desde afuera);
   para probar el flujo completo de pago necesitás tenerlo desplegado (ver paso 4) o usar una
   herramienta como `ngrok` para exponer tu servidor local temporalmente.

## 3. Resend (envío de emails)

1. Creá una cuenta en [resend.com](https://resend.com).
2. Para pruebas rápidas podés dejar `RESEND_FROM_EMAIL=onboarding@resend.dev` (solo te va a dejar
   enviar a tu propio email de cuenta). Para enviar a cualquier cliente, verificá tu dominio propio en
   Resend y usá una dirección tipo `pedidos@tudominio.com`.
3. Copiá la **API Key** → `RESEND_API_KEY`.

## 4. Variables de entorno

Copiá `.env.local.example` a `.env.local` y completá los valores de los pasos anteriores, más:

```
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 5. Correr en local

```bash
npm install
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000).

## 6. Deploy

**Recomendado: Vercel** (los creadores de Next.js). Es la opción más simple y el plan gratuito
(Hobby) alcanza de sobra para arrancar:

1. Subí este repo a GitHub.
2. En [vercel.com](https://vercel.com), "Add New Project" → importá el repo.
3. Cargá las mismas variables de entorno del `.env.local` (con `NEXT_PUBLIC_SITE_URL` apuntando a tu
   dominio de Vercel, ej. `https://tu-sitio.vercel.app`).
4. Deploy. Cada push a la rama principal se despliega automáticamente.
5. Si comprás el dominio en Hostinger (u otro lado), no hace falta mover el hosting: en Vercel
   agregás el dominio propio y te da los registros DNS para configurar en el panel de Hostinger.

Si preferís igual usar Hostinger como hosting completo, vas a necesitar su plan con soporte para
Node.js (no el hosting compartido tradicional de WordPress/PHP), y configurar manualmente el proceso
de `next start`. Es más trabajo y no tiene los despliegues automáticos ni las preview URLs de Vercel.

Una vez desplegado, actualizá `notification_url` implícita (ya se arma sola con
`NEXT_PUBLIC_SITE_URL`) y probá una compra real con las credenciales de **test** de Mercado Pago
antes de pasar a producción.

## 7. Pasar a producción

Cuando quieras cobrar de verdad:

1. Reemplazá `MERCADOPAGO_ACCESS_TOKEN` y `MERCADOPAGO_PUBLIC_KEY` por las credenciales de
   producción de tu cuenta de Mercado Pago.
2. Verificá tu dominio propio en Resend para poder enviar emails desde tu propia dirección.
3. Revisá que `NEXT_PUBLIC_SITE_URL` apunte al dominio final.
