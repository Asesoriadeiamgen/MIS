export type ProductType = "libro" | "agenda" | "artesania" | "varios" | "curso" | "pack";
export type OrderStatus = "pending" | "paid" | "failed" | "cancelled";

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  birth_day: number | null;
  birth_month: number | null;
  is_admin: boolean;
  created_at: string;
};

export type Book = {
  id: string;
  title: string;
  author: string | null;
  description: string | null;
  price: number | null;
  cover_url: string | null;
  file_path: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
};

export type Agenda = {
  id: string;
  name: string;
  description: string | null;
  base_price: number | null;
  cover_url: string | null;
  image_urls: string[];
  is_active: boolean;
  sort_order: number;
  created_at: string;
};

export type Artesania = {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  image_urls: string[];
  is_active: boolean;
  sort_order: number;
  created_at: string;
};

export type VariosProduct = {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
};

export type Curso = {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  duration: string | null;
  start_date: string | null;
  start_time: string | null;
  image_urls: string[];
  is_active: boolean;
  created_at: string;
};

export type Servicio = {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  modalidad: "online" | "presencial" | "ambas";
  image_urls: string[];
  is_active: boolean;
  sort_order: number;
  created_at: string;
};

export type DurationUnit = "sesiones" | "meses" | "semanas" | "dias" | "horas";

export type Pack = {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  sessions_count: number | null;
  duration_unit: DurationUnit;
  image_urls: string[];
  is_active: boolean;
  sort_order: number;
  created_at: string;
};

export type PortfolioItem = {
  id: string;
  title: string | null;
  description: string | null;
  image_url: string | null;
  before_image_url: string | null;
  after_image_url: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
};

export type GaleriaFoto = {
  id: string;
  category: string;
  image_url: string;
  caption: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
};

export type Testimonio = {
  id: string;
  client_name: string;
  quote: string;
  photo_url: string | null;
  rating: number | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
};

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_url: string | null;
  published_at: string;
  is_active: boolean;
  created_at: string;
};

export type Faq = {
  id: string;
  question: string;
  answer: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
};

export type DisponibilidadSemanal = {
  id: string;
  weekday: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
  created_at: string;
};

export type BloqueoFecha = {
  id: string;
  start_at: string;
  end_at: string;
  reason: string | null;
  created_at: string;
};

export type Turno = {
  id: string;
  start_at: string;
  end_at: string;
  servicio_nombre: string | null;
  client_name: string;
  client_email: string;
  client_phone: string | null;
  notes: string | null;
  status: "confirmado" | "cancelado";
  created_at: string;
};

export type Order = {
  id: string;
  user_id: string;
  status: OrderStatus;
  total: number;
  mp_preference_id: string | null;
  mp_payment_id: string | null;
  coupon_code: string | null;
  created_at: string;
  updated_at: string;
};

export type DiscountCode = {
  id: string;
  code: string;
  percent_off: number | null;
  amount_off: number | null;
  is_active: boolean;
  created_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_type: ProductType;
  product_id: string;
  title: string;
  quantity: number;
  unit_price: number;
  customization: Record<string, unknown>;
  created_at: string;
};

export type BookAccess = {
  id: string;
  book_id: string;
  user_id: string | null;
  order_id: string | null;
  code: string;
  email_sent_to: string | null;
  redeemed_at: string | null;
  created_at: string;
};

export type AboutPage = {
  id: number;
  photo_url: string | null;
  formacion_html: string | null;
  filosofia_html: string | null;
  historia_html: string | null;
  updated_at: string;
};

export type RateLimitEvent = {
  id: string;
  key: string;
  created_at: string;
};

export type BookPromoCode = {
  id: string;
  book_id: string;
  code: string;
  is_active: boolean;
  created_at: string;
};

type Relationship = {
  foreignKeyName: string;
  columns: string[];
  isOneToOne?: boolean;
  referencedRelation: string;
  referencedColumns: string[];
};

type Table<Row, Rel extends Relationship[] = []> = {
  Row: Row;
  Insert: Partial<Row>;
  Update: Partial<Row>;
  Relationships: Rel;
};

export type Database = {
  public: {
    Tables: {
      profiles: Table<Profile>;
      books: Table<Book>;
      agendas: Table<Agenda>;
      artesanias: Table<Artesania>;
      varios_products: Table<VariosProduct>;
      cursos: Table<Curso>;
      servicios: Table<Servicio>;
      packs: Table<Pack>;
      portfolio: Table<PortfolioItem>;
      testimonios: Table<Testimonio>;
      blog_posts: Table<BlogPost>;
      faqs: Table<Faq>;
      disponibilidad_semanal: Table<DisponibilidadSemanal>;
      bloqueos_fecha: Table<BloqueoFecha>;
      turnos: Table<Turno>;
      discount_codes: Table<DiscountCode>;
      about_page: Table<AboutPage>;
      rate_limit_events: Table<RateLimitEvent>;
      galeria_fotos: Table<GaleriaFoto>;
      orders: Table<
        Order,
        [
          {
            foreignKeyName: "orders_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ]
      >;
      order_items: Table<
        OrderItem,
        [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          }
        ]
      >;
      book_access: Table<
        BookAccess,
        [
          {
            foreignKeyName: "book_access_book_id_fkey";
            columns: ["book_id"];
            isOneToOne: false;
            referencedRelation: "books";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "book_access_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "book_access_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          }
        ]
      >;
      book_promo_codes: Table<
        BookPromoCode,
        [
          {
            foreignKeyName: "book_promo_codes_book_id_fkey";
            columns: ["book_id"];
            isOneToOne: false;
            referencedRelation: "books";
            referencedColumns: ["id"];
          }
        ]
      >;
    };
    Views: Record<string, never>;
    Functions: {
      horarios_disponibles: {
        Args: { p_date: string; p_duration_minutes?: number };
        Returns: { start_at: string }[];
      };
      reservar_turno: {
        Args: {
          p_start_at: string;
          p_duration_minutes: number;
          p_servicio_nombre: string | null;
          p_client_name: string;
          p_client_email: string;
          p_client_phone: string | null;
          p_notes: string | null;
        };
        Returns: Turno;
      };
    };
  };
};
