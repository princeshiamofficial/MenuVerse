
-- =========================================================
-- ENUMS
-- =========================================================
CREATE TYPE public.app_role AS ENUM ('super_admin', 'owner', 'manager', 'staff', 'customer');
CREATE TYPE public.restaurant_status AS ENUM ('active', 'inactive', 'suspended');
CREATE TYPE public.branch_status AS ENUM ('open', 'closed', 'temporarily_closed');
CREATE TYPE public.order_status AS ENUM ('pending', 'confirmed', 'preparing', 'ready', 'served', 'completed', 'cancelled');
CREATE TYPE public.payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
CREATE TYPE public.subscription_plan AS ENUM ('free', 'starter', 'business', 'enterprise');
CREATE TYPE public.subscription_status AS ENUM ('trialing', 'active', 'past_due', 'cancelled', 'expired');
CREATE TYPE public.design_request_status AS ENUM ('draft', 'submitted', 'in_review', 'approved', 'rejected', 'completed');

-- =========================================================
-- updated_at trigger helper
-- =========================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- =========================================================
-- PROFILES (users)
-- =========================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================================
-- ROLES / PERMISSIONS
-- =========================================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  restaurant_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role, restaurant_id)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'super_admin');
$$;

CREATE TABLE public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.roles TO authenticated;
GRANT ALL ON public.roles TO service_role;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.permissions TO authenticated;
GRANT ALL ON public.permissions TO service_role;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.role_permissions (
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);
GRANT SELECT ON public.role_permissions TO authenticated;
GRANT ALL ON public.role_permissions TO service_role;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- RESTAURANTS
-- =========================================================
CREATE TABLE public.restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  logo_url TEXT,
  cover_url TEXT,
  cuisine TEXT,
  email TEXT,
  phone TEXT,
  website TEXT,
  status public.restaurant_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.restaurants TO authenticated;
GRANT SELECT ON public.restaurants TO anon;
GRANT ALL ON public.restaurants TO service_role;
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_restaurants_updated BEFORE UPDATE ON public.restaurants
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Ownership helper
CREATE OR REPLACE FUNCTION public.owns_restaurant(_user_id UUID, _restaurant_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.restaurants WHERE id = _restaurant_id AND owner_id = _user_id);
$$;

-- =========================================================
-- BRANCHES
-- =========================================================
CREATE TABLE public.branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  manager TEXT,
  status public.branch_status NOT NULL DEFAULT 'open',
  is_default BOOLEAN NOT NULL DEFAULT false,
  menu_id TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.branches TO authenticated;
GRANT SELECT ON public.branches TO anon;
GRANT ALL ON public.branches TO service_role;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_branches_updated BEFORE UPDATE ON public.branches
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- CATEGORIES
-- =========================================================
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES public.branches(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT SELECT ON public.categories TO anon;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_categories_updated BEFORE UPDATE ON public.categories
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- FOOD ITEMS
-- =========================================================
CREATE TABLE public.food_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES public.branches(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  compare_at_price NUMERIC(10,2),
  currency TEXT NOT NULL DEFAULT 'USD',
  is_available BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  tags TEXT[] NOT NULL DEFAULT '{}',
  calories INT,
  prep_time_minutes INT,
  sort_order INT NOT NULL DEFAULT 0,
  view_count INT NOT NULL DEFAULT 0,
  order_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.food_items TO authenticated;
GRANT SELECT ON public.food_items TO anon;
GRANT ALL ON public.food_items TO service_role;
ALTER TABLE public.food_items ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_food_items_updated BEFORE UPDATE ON public.food_items
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- FOOD IMAGES
-- =========================================================
CREATE TABLE public.food_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  food_item_id UUID NOT NULL REFERENCES public.food_items(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt_text TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.food_images TO authenticated;
GRANT SELECT ON public.food_images TO anon;
GRANT ALL ON public.food_images TO service_role;
ALTER TABLE public.food_images ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- MENU VERSIONS
-- =========================================================
CREATE TABLE public.menu_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES public.branches(id) ON DELETE CASCADE,
  version_number INT NOT NULL,
  label TEXT,
  snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.menu_versions TO authenticated;
GRANT ALL ON public.menu_versions TO service_role;
ALTER TABLE public.menu_versions ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- QR CODES
-- =========================================================
CREATE TABLE public.qr_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES public.branches(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  label TEXT,
  table_number TEXT,
  target_url TEXT,
  scan_count INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.qr_codes TO authenticated;
GRANT SELECT ON public.qr_codes TO anon;
GRANT ALL ON public.qr_codes TO service_role;
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_qr_codes_updated BEFORE UPDATE ON public.qr_codes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- ORDERS
-- =========================================================
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT,
  customer_phone TEXT,
  table_number TEXT,
  status public.order_status NOT NULL DEFAULT 'pending',
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  tax NUMERIC(10,2) NOT NULL DEFAULT 0,
  service_charge NUMERIC(10,2) NOT NULL DEFAULT 0,
  delivery_charge NUMERIC(10,2) NOT NULL DEFAULT 0,
  total NUMERIC(10,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT INSERT, SELECT ON public.orders TO anon;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_orders_updated BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- ORDER ITEMS
-- =========================================================
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  food_item_id UUID REFERENCES public.food_items(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  unit_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.order_items TO authenticated;
GRANT INSERT, SELECT ON public.order_items TO anon;
GRANT ALL ON public.order_items TO service_role;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- FEEDBACK
-- =========================================================
CREATE TABLE public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.feedback TO authenticated;
GRANT INSERT ON public.feedback TO anon;
GRANT ALL ON public.feedback TO service_role;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- FAVORITES
-- =========================================================
CREATE TABLE public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  food_item_id UUID NOT NULL REFERENCES public.food_items(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, food_item_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.favorites TO authenticated;
GRANT ALL ON public.favorites TO service_role;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- SUBSCRIPTIONS
-- =========================================================
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  plan public.subscription_plan NOT NULL DEFAULT 'free',
  status public.subscription_status NOT NULL DEFAULT 'active',
  billing_cycle TEXT NOT NULL DEFAULT 'monthly',
  amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_subscriptions_updated BEFORE UPDATE ON public.subscriptions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- PAYMENTS
-- =========================================================
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  status public.payment_status NOT NULL DEFAULT 'pending',
  provider TEXT,
  provider_reference TEXT,
  invoice_number TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_payments_updated BEFORE UPDATE ON public.payments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- NOTIFICATIONS
-- =========================================================
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- DESIGN REQUESTS (Color Hut)
-- =========================================================
CREATE TABLE public.design_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
  requested_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  status public.design_request_status NOT NULL DEFAULT 'draft',
  upload_url TEXT,
  preview_url TEXT,
  print_pdf_url TEXT,
  comments JSONB NOT NULL DEFAULT '[]'::jsonb,
  versions JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.design_requests TO authenticated;
GRANT ALL ON public.design_requests TO service_role;
ALTER TABLE public.design_requests ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_design_requests_updated BEFORE UPDATE ON public.design_requests
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- ANALYTICS EVENTS
-- =========================================================
CREATE TABLE public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  device_type TEXT,
  country TEXT,
  language TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.analytics_events TO authenticated;
GRANT INSERT ON public.analytics_events TO anon;
GRANT ALL ON public.analytics_events TO service_role;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- ACTIVITY LOGS
-- =========================================================
CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.activity_logs TO authenticated;
GRANT ALL ON public.activity_logs TO service_role;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- SETTINGS
-- =========================================================
CREATE TABLE public.settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL UNIQUE REFERENCES public.restaurants(id) ON DELETE CASCADE,
  theme JSONB NOT NULL DEFAULT '{}'::jsonb,
  language TEXT NOT NULL DEFAULT 'en',
  currency TEXT NOT NULL DEFAULT 'USD',
  tax_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  tax_inclusive BOOLEAN NOT NULL DEFAULT false,
  service_charge NUMERIC(5,2) NOT NULL DEFAULT 0,
  service_charge_enabled BOOLEAN NOT NULL DEFAULT false,
  delivery_charge NUMERIC(10,2) NOT NULL DEFAULT 0,
  free_delivery_threshold NUMERIC(10,2),
  notifications JSONB NOT NULL DEFAULT '{}'::jsonb,
  email_settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.settings TO authenticated;
GRANT SELECT ON public.settings TO anon;
GRANT ALL ON public.settings TO service_role;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_settings_updated BEFORE UPDATE ON public.settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- RLS POLICIES
-- =========================================================

-- profiles
CREATE POLICY "Profiles: self read" ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id OR public.is_super_admin(auth.uid()));
CREATE POLICY "Profiles: self update" ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Profiles: self insert" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- user_roles
CREATE POLICY "user_roles: self read" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_super_admin(auth.uid()));
CREATE POLICY "user_roles: admin manage" ON public.user_roles FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));

-- roles / permissions (read for all authenticated, admin manage)
CREATE POLICY "roles: read" ON public.roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "roles: admin manage" ON public.roles FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));
CREATE POLICY "permissions: read" ON public.permissions FOR SELECT TO authenticated USING (true);
CREATE POLICY "permissions: admin manage" ON public.permissions FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));
CREATE POLICY "role_permissions: read" ON public.role_permissions FOR SELECT TO authenticated USING (true);
CREATE POLICY "role_permissions: admin manage" ON public.role_permissions FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));

-- restaurants
CREATE POLICY "restaurants: public read active" ON public.restaurants FOR SELECT TO anon, authenticated
  USING (status = 'active' OR owner_id = auth.uid() OR public.is_super_admin(auth.uid()));
CREATE POLICY "restaurants: owner insert" ON public.restaurants FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());
CREATE POLICY "restaurants: owner update" ON public.restaurants FOR UPDATE TO authenticated
  USING (owner_id = auth.uid() OR public.is_super_admin(auth.uid()))
  WITH CHECK (owner_id = auth.uid() OR public.is_super_admin(auth.uid()));
CREATE POLICY "restaurants: owner delete" ON public.restaurants FOR DELETE TO authenticated
  USING (owner_id = auth.uid() OR public.is_super_admin(auth.uid()));

-- branches
CREATE POLICY "branches: public read" ON public.branches FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "branches: owner manage" ON public.branches FOR ALL TO authenticated
  USING (public.owns_restaurant(auth.uid(), restaurant_id) OR public.is_super_admin(auth.uid()))
  WITH CHECK (public.owns_restaurant(auth.uid(), restaurant_id) OR public.is_super_admin(auth.uid()));

-- categories
CREATE POLICY "categories: public read" ON public.categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "categories: owner manage" ON public.categories FOR ALL TO authenticated
  USING (public.owns_restaurant(auth.uid(), restaurant_id) OR public.is_super_admin(auth.uid()))
  WITH CHECK (public.owns_restaurant(auth.uid(), restaurant_id) OR public.is_super_admin(auth.uid()));

-- food_items
CREATE POLICY "food_items: public read" ON public.food_items FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "food_items: owner manage" ON public.food_items FOR ALL TO authenticated
  USING (public.owns_restaurant(auth.uid(), restaurant_id) OR public.is_super_admin(auth.uid()))
  WITH CHECK (public.owns_restaurant(auth.uid(), restaurant_id) OR public.is_super_admin(auth.uid()));

-- food_images
CREATE POLICY "food_images: public read" ON public.food_images FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "food_images: owner manage" ON public.food_images FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.food_items fi WHERE fi.id = food_images.food_item_id
    AND (public.owns_restaurant(auth.uid(), fi.restaurant_id) OR public.is_super_admin(auth.uid()))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.food_items fi WHERE fi.id = food_images.food_item_id
    AND (public.owns_restaurant(auth.uid(), fi.restaurant_id) OR public.is_super_admin(auth.uid()))));

-- menu_versions
CREATE POLICY "menu_versions: owner manage" ON public.menu_versions FOR ALL TO authenticated
  USING (public.owns_restaurant(auth.uid(), restaurant_id) OR public.is_super_admin(auth.uid()))
  WITH CHECK (public.owns_restaurant(auth.uid(), restaurant_id) OR public.is_super_admin(auth.uid()));

-- qr_codes
CREATE POLICY "qr_codes: public read active" ON public.qr_codes FOR SELECT TO anon, authenticated
  USING (is_active = true OR public.owns_restaurant(auth.uid(), restaurant_id) OR public.is_super_admin(auth.uid()));
CREATE POLICY "qr_codes: owner manage" ON public.qr_codes FOR ALL TO authenticated
  USING (public.owns_restaurant(auth.uid(), restaurant_id) OR public.is_super_admin(auth.uid()))
  WITH CHECK (public.owns_restaurant(auth.uid(), restaurant_id) OR public.is_super_admin(auth.uid()));

-- orders
CREATE POLICY "orders: customer or owner read" ON public.orders FOR SELECT TO authenticated
  USING (customer_id = auth.uid() OR public.owns_restaurant(auth.uid(), restaurant_id) OR public.is_super_admin(auth.uid()));
CREATE POLICY "orders: anyone insert" ON public.orders FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "orders: owner update" ON public.orders FOR UPDATE TO authenticated
  USING (public.owns_restaurant(auth.uid(), restaurant_id) OR public.is_super_admin(auth.uid()))
  WITH CHECK (public.owns_restaurant(auth.uid(), restaurant_id) OR public.is_super_admin(auth.uid()));
CREATE POLICY "orders: owner delete" ON public.orders FOR DELETE TO authenticated
  USING (public.owns_restaurant(auth.uid(), restaurant_id) OR public.is_super_admin(auth.uid()));

-- order_items
CREATE POLICY "order_items: read via order" ON public.order_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_items.order_id
    AND (o.customer_id = auth.uid() OR public.owns_restaurant(auth.uid(), o.restaurant_id) OR public.is_super_admin(auth.uid()))));
CREATE POLICY "order_items: anyone insert" ON public.order_items FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "order_items: owner update" ON public.order_items FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_items.order_id
    AND (public.owns_restaurant(auth.uid(), o.restaurant_id) OR public.is_super_admin(auth.uid()))))
  WITH CHECK (true);
CREATE POLICY "order_items: owner delete" ON public.order_items FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_items.order_id
    AND (public.owns_restaurant(auth.uid(), o.restaurant_id) OR public.is_super_admin(auth.uid()))));

-- feedback
CREATE POLICY "feedback: owner read" ON public.feedback FOR SELECT TO authenticated
  USING (public.owns_restaurant(auth.uid(), restaurant_id) OR customer_id = auth.uid() OR public.is_super_admin(auth.uid()));
CREATE POLICY "feedback: anyone insert" ON public.feedback FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "feedback: owner delete" ON public.feedback FOR DELETE TO authenticated
  USING (public.owns_restaurant(auth.uid(), restaurant_id) OR public.is_super_admin(auth.uid()));

-- favorites
CREATE POLICY "favorites: self manage" ON public.favorites FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- subscriptions
CREATE POLICY "subscriptions: owner read" ON public.subscriptions FOR SELECT TO authenticated
  USING (public.owns_restaurant(auth.uid(), restaurant_id) OR public.is_super_admin(auth.uid()));
CREATE POLICY "subscriptions: owner manage" ON public.subscriptions FOR ALL TO authenticated
  USING (public.owns_restaurant(auth.uid(), restaurant_id) OR public.is_super_admin(auth.uid()))
  WITH CHECK (public.owns_restaurant(auth.uid(), restaurant_id) OR public.is_super_admin(auth.uid()));

-- payments
CREATE POLICY "payments: owner read" ON public.payments FOR SELECT TO authenticated
  USING (public.owns_restaurant(auth.uid(), restaurant_id) OR public.is_super_admin(auth.uid()));
CREATE POLICY "payments: admin manage" ON public.payments FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));

-- notifications
CREATE POLICY "notifications: self read" ON public.notifications FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_super_admin(auth.uid()));
CREATE POLICY "notifications: self update" ON public.notifications FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "notifications: self delete" ON public.notifications FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- design_requests
CREATE POLICY "design_requests: owner manage" ON public.design_requests FOR ALL TO authenticated
  USING (public.owns_restaurant(auth.uid(), restaurant_id) OR public.is_super_admin(auth.uid()))
  WITH CHECK (public.owns_restaurant(auth.uid(), restaurant_id) OR public.is_super_admin(auth.uid()));

-- analytics_events
CREATE POLICY "analytics_events: owner read" ON public.analytics_events FOR SELECT TO authenticated
  USING (restaurant_id IS NULL OR public.owns_restaurant(auth.uid(), restaurant_id) OR public.is_super_admin(auth.uid()));
CREATE POLICY "analytics_events: anyone insert" ON public.analytics_events FOR INSERT TO anon, authenticated WITH CHECK (true);

-- activity_logs
CREATE POLICY "activity_logs: owner read" ON public.activity_logs FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR (restaurant_id IS NOT NULL AND public.owns_restaurant(auth.uid(), restaurant_id)) OR public.is_super_admin(auth.uid()));
CREATE POLICY "activity_logs: authenticated insert" ON public.activity_logs FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR public.is_super_admin(auth.uid()));

-- settings
CREATE POLICY "settings: public read" ON public.settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "settings: owner manage" ON public.settings FOR ALL TO authenticated
  USING (public.owns_restaurant(auth.uid(), restaurant_id) OR public.is_super_admin(auth.uid()))
  WITH CHECK (public.owns_restaurant(auth.uid(), restaurant_id) OR public.is_super_admin(auth.uid()));

-- =========================================================
-- Helpful indexes
-- =========================================================
CREATE INDEX idx_branches_restaurant ON public.branches(restaurant_id);
CREATE INDEX idx_categories_restaurant ON public.categories(restaurant_id);
CREATE INDEX idx_food_items_restaurant ON public.food_items(restaurant_id);
CREATE INDEX idx_food_items_category ON public.food_items(category_id);
CREATE INDEX idx_food_images_item ON public.food_images(food_item_id);
CREATE INDEX idx_orders_restaurant ON public.orders(restaurant_id);
CREATE INDEX idx_orders_customer ON public.orders(customer_id);
CREATE INDEX idx_order_items_order ON public.order_items(order_id);
CREATE INDEX idx_feedback_restaurant ON public.feedback(restaurant_id);
CREATE INDEX idx_favorites_user ON public.favorites(user_id);
CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_analytics_restaurant ON public.analytics_events(restaurant_id);
CREATE INDEX idx_analytics_created ON public.analytics_events(created_at);
CREATE INDEX idx_activity_logs_restaurant ON public.activity_logs(restaurant_id);
CREATE INDEX idx_qr_codes_restaurant ON public.qr_codes(restaurant_id);
CREATE INDEX idx_subscriptions_restaurant ON public.subscriptions(restaurant_id);
CREATE INDEX idx_payments_restaurant ON public.payments(restaurant_id);
CREATE INDEX idx_user_roles_user ON public.user_roles(user_id);
