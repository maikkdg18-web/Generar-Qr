-- Agrega soporte para tipos de QR además de "url": wifi, vcard, text, email.
-- `payload` guarda los campos estructurados de esos tipos (SSID/contraseña, nombre/teléfono, etc.)
-- `destination_url` se sigue usando: para 'url' es el link real; para los demás tipos
-- guarda el contenido final ya formateado que se codifica en el QR (no hay redirect ni tracking
-- posible en esos tipos, porque el QR contiene el dato en sí, no una URL a la que redirigir).

alter table public.qrs
  add column if not exists qr_type text not null default 'url',
  add column if not exists payload jsonb;

alter table public.qrs
  drop constraint if exists qrs_qr_type_check;

alter table public.qrs
  add constraint qrs_qr_type_check check (qr_type in ('url', 'wifi', 'vcard', 'text', 'email'));
