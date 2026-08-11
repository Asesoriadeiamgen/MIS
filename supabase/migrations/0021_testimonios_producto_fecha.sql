-- Datos adicionales para mostrar los testimonios como tarjetas con contexto:
-- qué compró/contrató la persona y cuándo (mes/año de la compra, no de
-- cuando escribe el testimonio).
alter table public.testimonios add column if not exists product_or_service text;
alter table public.testimonios add column if not exists purchase_month text;
