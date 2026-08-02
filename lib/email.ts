import { Resend } from "resend";
import { SITE_NAME, CONTACT_EMAIL } from "@/lib/seo";

function getClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("Falta RESEND_API_KEY en las variables de entorno.");
  }
  return new Resend(apiKey);
}

const FROM = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
export const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || CONTACT_EMAIL;

/**
 * Todo el mail que envía la página pasa por acá, para que siempre llegue
 * una copia a ADMIN_EMAIL (salvo que ya sea el destinatario directo).
 */
async function send(params: {
  to: string;
  subject: string;
  html: string;
  attachments?: { filename: string; content: string }[];
}) {
  const resend = getClient();
  const bcc = params.to === ADMIN_EMAIL ? undefined : ADMIN_EMAIL;

  return resend.emails.send({
    from: FROM,
    to: params.to,
    bcc,
    subject: params.subject,
    html: params.html,
    attachments: params.attachments,
  });
}

export async function sendBookAccessCodeEmail(params: {
  to: string;
  bookTitle: string;
  code: string;
}) {
  const readUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/libros`;

  return send({
    to: params.to,
    subject: `Tu código de acceso para "${params.bookTitle}"`,
    html: `
      <p>¡Gracias por tu compra!</p>
      <p>Tu código de acceso para <strong>${params.bookTitle}</strong> es:</p>
      <p style="font-size: 24px; font-weight: bold; letter-spacing: 2px;">${params.code}</p>
      <p>Ingresá a <a href="${readUrl}">${readUrl}</a>, buscá el libro y usá este código para desbloquearlo si no accedés automáticamente con tu cuenta.</p>
    `,
  });
}

export async function sendOrderConfirmationEmail(params: {
  to: string;
  orderId: string;
  total: number;
}) {
  return send({
    to: params.to,
    subject: `Confirmamos tu pedido #${params.orderId.slice(0, 8)}`,
    html: `
      <p>¡Gracias por tu compra!</p>
      <p>Confirmamos el pago de tu pedido por un total de $${params.total.toFixed(2)}.</p>
      <p>Podés ver el detalle en tu cuenta, sección "Mis pedidos".</p>
    `,
  });
}

export async function sendBirthdayEmail(params: {
  to: string;
  name: string;
  couponCode: string;
  percentOff: number;
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  return send({
    to: params.to,
    subject: `¡Feliz cumpleaños${params.name ? `, ${params.name}` : ""}! 🎂`,
    html: `
      <div style="max-width: 480px; margin: 0 auto; padding: 40px 24px; background: #ffffff; border: 1px solid rgba(0,0,0,.08); font-family: Georgia, 'Times New Roman', serif; color: #1a1a1a;">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; width: 56px; height: 56px; border-radius: 999px; background: #e4d9f7; line-height: 56px; font-size: 26px;">🎉</div>
        </div>
        <h1 style="text-align: center; font-size: 26px; font-weight: normal; margin: 0 0 16px;">
          ¡Feliz cumpleaños${params.name ? `, ${params.name}` : ""}!
        </h1>
        <p style="text-align: center; font-size: 15px; line-height: 1.6; color: #1a1a1acc;">
          En ${SITE_NAME} festejamos tu cumpleaños. Te deseamos un día hermoso, y un año repleto de buenas realizaciones.<br/>
          Gracias por ser parte de nuestra comunidad. 💜
        </p>
        <div style="text-align: center; margin: 28px 0; padding: 16px; border: 1px dashed rgba(43,38,34,.25);">
          <p style="margin: 0 0 8px; font-size: 11px; letter-spacing: 1px; text-transform: uppercase; color: #1a1a1a99;">Tu regalo</p>
          <p style="margin: 0; font-size: 22px; font-weight: bold; letter-spacing: 3px;">${params.percentOff}% OFF</p>
          <p style="margin: 10px 0 0; font-size: 18px; font-weight: bold; letter-spacing: 2px;">${params.couponCode}</p>
        </div>
        <p style="text-align: center; font-size: 12px; color: #1a1a1a99; margin: 0 0 8px;">
          Ingresá el código en el carrito al pagar. Válido para tu próxima compra, un solo uso.
        </p>
        <div style="text-align: center; margin-top: 8px;">
          <a href="${siteUrl}" style="display: inline-block; padding: 12px 28px; background: #1a1a1a; color: #fff; text-decoration: none; font-size: 12px; letter-spacing: 1px; text-transform: uppercase;">
            Visitá nuestro sitio
          </a>
        </div>
      </div>
    `,
  });
}

const CUSTOMIZATION_LABELS: Record<string, string> = {
  color1: "Color 1",
  color2: "Color 2",
  quiereFrases: "¿Frases?",
  tipoFrase: "Tipo de frase",
  hojaEspecial: "Hoja/formulario especial",
  notas: "Notas para el diseño",
  color: "Color preferido",
  grabado: "Texto para grabar",
};

function customizationRowsHtml(customization: Record<string, unknown>) {
  return Object.entries(customization)
    .filter(([key]) => key !== "fotos")
    .filter(([, value]) => value !== null && value !== undefined && value !== "")
    .map(([key, value]) => {
      const label = CUSTOMIZATION_LABELS[key] || key;
      const display = typeof value === "boolean" ? (value ? "Sí" : "No") : String(value);
      return `<tr><td style="padding:4px 16px 4px 0; color:#1a1a1a99; font-size:13px; white-space:nowrap;">${label}</td><td style="padding:4px 0; font-size:13px;">${display}</td></tr>`;
    })
    .join("");
}

export async function sendCustomizationEmail(params: {
  to: string;
  orderId: string;
  itemTitle: string;
  customization: Record<string, unknown>;
  photoLinks: string[];
}) {
  const rows = customizationRowsHtml(params.customization);

  const photosHtml = params.photoLinks.length
    ? `<p style="margin:20px 0 6px; font-size:13px; font-weight:bold;">Fotos de referencia (${params.photoLinks.length}):</p>` +
      params.photoLinks
        .map(
          (url, i) =>
            `<a href="${url}" style="display:inline-block; margin:0 10px 6px 0; font-size:13px;">Ver foto ${i + 1}</a>`
        )
        .join("")
    : "";

  return send({
    to: params.to,
    subject: `Nueva personalización: ${params.itemTitle} (#${params.orderId.slice(0, 8)})`,
    html: `
      <div style="font-family: Arial, Helvetica, sans-serif; color: #1a1a1a; max-width: 520px;">
        <h2 style="font-weight: normal; margin: 0 0 4px;">${params.itemTitle}</h2>
        <p style="font-size: 12px; color: #1a1a1a99; margin: 0 0 16px;">Pedido #${params.orderId.slice(0, 8)}</p>
        <table style="border-collapse: collapse;">${rows}</table>
        ${photosHtml}
      </div>
    `,
  });
}

export async function sendAdminOrderNotificationEmail(params: {
  orderId: string;
  customerEmail: string;
  total: number;
  items: { title: string; quantity: number; unit_price: number }[];
}) {
  const itemsHtml = params.items
    .map(
      (i) =>
        `<tr><td style="padding:4px 16px 4px 0; font-size:13px;">${i.title} × ${i.quantity}</td><td style="padding:4px 0; font-size:13px; color:#1a1a1a99;">$${i.unit_price.toFixed(2)}</td></tr>`
    )
    .join("");

  return send({
    to: ADMIN_EMAIL,
    subject: `Nueva compra: pedido #${params.orderId.slice(0, 8)}`,
    html: `
      <div style="font-family: Arial, Helvetica, sans-serif; color: #1a1a1a; max-width: 520px;">
        <h2 style="font-weight: normal; margin: 0 0 4px;">Nueva compra confirmada</h2>
        <p style="font-size: 12px; color: #1a1a1a99; margin: 0 0 16px;">
          Pedido #${params.orderId.slice(0, 8)} — ${params.customerEmail}
        </p>
        <table style="border-collapse: collapse;">${itemsHtml}</table>
        <p style="margin-top: 16px; font-size: 15px; font-weight: bold;">Total: $${params.total.toFixed(2)}</p>
      </div>
    `,
  });
}

export async function sendTurnoConfirmationEmail(params: {
  to: string;
  clientName: string;
  servicioNombre: string | null;
  startAt: string;
}) {
  const when = new Date(params.startAt).toLocaleString("es-AR", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "America/Argentina/Buenos_Aires",
  });

  return send({
    to: params.to,
    subject: `Turno confirmado — ${when}`,
    html: `
      <p>Hola ${params.clientName}, ¡tu turno quedó confirmado!</p>
      <p><strong>${when}</strong></p>
      ${params.servicioNombre ? `<p>Motivo de consulta: ${params.servicioNombre}</p>` : ""}
      <p>Cualquier cambio, escribinos por WhatsApp.</p>
    `,
  });
}

export async function sendTurnoAdminNotificationEmail(params: {
  clientName: string;
  clientEmail: string;
  clientPhone: string | null;
  servicioNombre: string | null;
  startAt: string;
  notes: string | null;
}) {
  const when = new Date(params.startAt).toLocaleString("es-AR", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "America/Argentina/Buenos_Aires",
  });

  return send({
    to: ADMIN_EMAIL,
    subject: `Nuevo turno reservado — ${when}`,
    html: `
      <div style="font-family: Arial, Helvetica, sans-serif; color: #1a1a1a; max-width: 520px;">
        <h2 style="font-weight: normal; margin: 0 0 4px;">Nuevo turno reservado</h2>
        <p style="font-size: 15px; font-weight: bold; margin: 8px 0;">${when}</p>
        <table style="border-collapse: collapse;">
          <tr><td style="padding:4px 16px 4px 0; color:#1a1a1a99; font-size:13px;">Nombre</td><td style="padding:4px 0; font-size:13px;">${params.clientName}</td></tr>
          <tr><td style="padding:4px 16px 4px 0; color:#1a1a1a99; font-size:13px;">Email</td><td style="padding:4px 0; font-size:13px;">${params.clientEmail}</td></tr>
          ${params.clientPhone ? `<tr><td style="padding:4px 16px 4px 0; color:#1a1a1a99; font-size:13px;">Teléfono</td><td style="padding:4px 0; font-size:13px;">${params.clientPhone}</td></tr>` : ""}
          ${params.servicioNombre ? `<tr><td style="padding:4px 16px 4px 0; color:#1a1a1a99; font-size:13px;">Motivo</td><td style="padding:4px 0; font-size:13px;">${params.servicioNombre}</td></tr>` : ""}
          ${params.notes ? `<tr><td style="padding:4px 16px 4px 0; color:#1a1a1a99; font-size:13px;">Notas</td><td style="padding:4px 0; font-size:13px;">${params.notes}</td></tr>` : ""}
        </table>
      </div>
    `,
  });
}

function formatARS(value: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);
}

export type WeeklyStats = {
  nuevosUsuarios: number;
  pedidosNuevos: number;
  pedidosPagados: number;
  ingresos: number;
  codigosGenerados: number;
  codigosCanjeados: number;
  topProductos: [string, number][];
  totales: {
    usuarios: number;
    libros: number;
    agendas: number;
    artesanias: number;
    varios: number;
    cursos: number;
  };
};

function statRow(label: string, value: string | number) {
  return `<tr><td style="padding:6px 16px 6px 0; font-size:14px; color:#1a1a1a99;">${label}</td><td style="padding:6px 0; font-size:14px; font-weight:bold; text-align:right;">${value}</td></tr>`;
}

export async function sendBackupEmail(params: {
  to: string;
  jsonContent: string;
  dateLabel: string;
  stats: WeeklyStats;
}) {
  const s = params.stats;
  const topProductosHtml = s.topProductos.length
    ? `<table style="width:100%; border-collapse: collapse; margin-top:4px;">${s.topProductos
        .map(([title, qty]) => statRow(title, `${qty} u.`))
        .join("")}</table>`
    : `<p style="font-size:13px; color:#1a1a1a99; margin:4px 0 0;">Sin ventas esta semana.</p>`;

  return send({
    to: params.to,
    subject: `Resumen semanal de ${SITE_NAME} — ${params.dateLabel}`,
    html: `
      <div style="font-family: Arial, Helvetica, sans-serif; color: #1a1a1a; max-width: 560px; margin: 0 auto;">
        <h1 style="font-size:20px; font-weight:normal; margin:0 0 4px;">Resumen semanal — ${params.dateLabel}</h1>
        <p style="font-size:12px; color:#1a1a1a99; margin:0 0 24px;">Últimos 7 días</p>

        <table style="width:100%; border-collapse: collapse; margin-bottom: 24px;">
          ${statRow("Usuarios nuevos", s.nuevosUsuarios)}
          ${statRow("Pedidos nuevos", s.pedidosNuevos)}
          ${statRow("Pedidos pagados", s.pedidosPagados)}
          ${statRow("Ingresos (pedidos pagados)", formatARS(s.ingresos))}
          ${statRow("Códigos de libro generados", s.codigosGenerados)}
          ${statRow("Códigos de libro canjeados", s.codigosCanjeados)}
        </table>

        <h2 style="font-size:15px; font-weight:bold; margin:0 0 8px;">Productos más vendidos esta semana</h2>
        ${topProductosHtml}

        <h2 style="font-size:15px; font-weight:bold; margin:24px 0 8px;">Totales acumulados</h2>
        <table style="width:100%; border-collapse: collapse; margin-bottom: 24px;">
          ${statRow("Usuarios registrados", s.totales.usuarios)}
          ${statRow("Libros activos", s.totales.libros)}
          ${statRow("Agendas activas", s.totales.agendas)}
          ${statRow("Artesanías activas", s.totales.artesanias)}
          ${statRow("Varios activos", s.totales.varios)}
          ${statRow("Cursos activos", s.totales.cursos)}
        </table>

        <p style="font-size:12px; color:#1a1a1a99; border-top:1px solid rgba(43,38,34,.12); padding-top:16px;">
          Estos números no incluyen visitas/tráfico del sitio — para eso revisá Google Analytics o Vercel Analytics.
          Adjuntamos también el backup completo de la base de datos en formato JSON, por si hace falta restaurar algo.
        </p>
      </div>
    `,
    attachments: [
      {
        filename: `backup-${params.dateLabel}.json`,
        content: Buffer.from(params.jsonContent).toString("base64"),
      },
    ],
  });
}
