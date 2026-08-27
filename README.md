# ScannQR — Generador de QR dinámicos

App web para generar códigos QR dinámicos, con cuentas de usuario, analytics de escaneo y personalización visual.

## Stack

- Frontend: React + Vite
- Backend: Supabase (Auth + Postgres + Storage + Edge Functions)
- Generación de QR: [`qrcode`](https://www.npmjs.com/package/qrcode) (cliente)
- Estilos: Tailwind CSS v4

## Setup

1. Instalar dependencias:

   ```bash
   npm install
   ```

2. Copiar `.env.example` a `.env` y completar con los datos de tu proyecto Supabase (`scannqr`):

   ```bash
   cp .env.example .env
   ```

   - `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`: Project Settings → API en el dashboard de Supabase.
   - `VITE_REDIRECT_BASE_URL` es opcional: si no se define, se deriva automáticamente de `VITE_SUPABASE_URL`.

3. Bucket de Storage `logos` (público) para los logos de personalización — ya creado en el proyecto `scannqr`. Si necesitas recrearlo: Dashboard de Supabase → Storage → New bucket → nombre `logos`, marcar como **público**.

4. Correr la migración `supabase/migrations/20260827_add_qr_types.sql` en el SQL Editor del dashboard (agrega soporte para tipos de QR además de link: WiFi, contacto, texto, email).

5. Correr el frontend:

   ```bash
   npm run dev
   ```

## Edge Function del redirector

Ruta pública: `/r/:short_code` (implementada como Edge Function `redirector` en `supabase/functions/redirector`, ya desplegada en `scannqr`).

Deploy (usa `--no-verify-jwt` porque cualquiera debe poder escanear el QR sin estar autenticado):

```bash
supabase link --project-ref shbavxhmrgsowuxudmbw
supabase functions deploy redirector --no-verify-jwt
```

No hace falta configurar `SUPABASE_SERVICE_ROLE_KEY` a mano: Supabase inyecta automáticamente `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` en el entorno de toda Edge Function desplegada (el nombre está reservado y no se puede setear vía `supabase secrets set`).

La función:

1. Recibe el `short_code` (como último segmento del path, ej. `/redirector/abc1234`).
2. Busca el `destination_url` en la tabla `qrs` usando `service_role` (evita RLS).
3. Inserta un registro en `scans` (user agent, referrer, fecha).
4. Responde con un 302 al `destination_url`.

Solo aplica a QRs de tipo `url` (`is_dynamic: true`). Los tipos WiFi, contacto, texto y email codifican el contenido directamente en la imagen del QR (así lo exigen esos formatos), por lo que no pasan por el redirector y no tienen seguimiento de escaneos.

## Estructura

```
src/
  lib/          # cliente supabase, helpers (short_code, redirect url, contenido por tipo de QR)
  context/      # AuthContext, ThemeContext
  components/   # Layout, ProtectedRoute, QrCodeCanvas, QrTypeSelector, QrTypeFields, FormField
  pages/        # LoginPage, DashboardPage, CreateQrPage, EditQrPage, QrDetailPage
supabase/
  functions/redirector/  # Edge Function del redirector
  migrations/             # cambios de esquema (correr a mano en el SQL Editor)
```

## Pendiente / fase 2

- Generación en lote de QRs vía CSV.
