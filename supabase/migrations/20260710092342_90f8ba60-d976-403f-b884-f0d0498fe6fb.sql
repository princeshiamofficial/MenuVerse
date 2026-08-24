
DROP POLICY IF EXISTS "orders: anyone insert" ON public.orders;
CREATE POLICY "orders: anyone insert" ON public.orders
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.restaurants r WHERE r.id = orders.restaurant_id AND r.status = 'active')
    AND (branch_id IS NULL OR EXISTS (
      SELECT 1 FROM public.branches b WHERE b.id = orders.branch_id AND b.restaurant_id = orders.restaurant_id
    ))
    AND subtotal >= 0 AND tax >= 0 AND service_charge >= 0 AND delivery_charge >= 0 AND total >= 0
  );

DROP POLICY IF EXISTS "order_items: anyone insert" ON public.order_items;
CREATE POLICY "order_items: anyone insert" ON public.order_items
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_items.order_id)
    AND quantity > 0 AND unit_price >= 0 AND total_price >= 0
  );

DROP POLICY IF EXISTS "feedback: anyone insert" ON public.feedback;
CREATE POLICY "feedback: anyone insert" ON public.feedback
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.restaurants r WHERE r.id = feedback.restaurant_id AND r.status = 'active')
    AND (branch_id IS NULL OR EXISTS (
      SELECT 1 FROM public.branches b WHERE b.id = feedback.branch_id AND b.restaurant_id = feedback.restaurant_id
    ))
    AND (order_id IS NULL OR EXISTS (
      SELECT 1 FROM public.orders o WHERE o.id = feedback.order_id AND o.restaurant_id = feedback.restaurant_id
    ))
    AND rating BETWEEN 1 AND 5
  );

DROP POLICY IF EXISTS "analytics_events: anyone insert" ON public.analytics_events;
CREATE POLICY "analytics_events: anyone insert" ON public.analytics_events
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.restaurants r WHERE r.id = analytics_events.restaurant_id AND r.status = 'active')
    AND (branch_id IS NULL OR EXISTS (
      SELECT 1 FROM public.branches b WHERE b.id = analytics_events.branch_id AND b.restaurant_id = analytics_events.restaurant_id
    ))
  );

DROP POLICY IF EXISTS "settings: public read" ON public.settings;
REVOKE SELECT ON public.settings FROM anon;
