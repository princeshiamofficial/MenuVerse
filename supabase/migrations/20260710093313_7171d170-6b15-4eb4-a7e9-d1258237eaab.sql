
DROP POLICY IF EXISTS "order_items: anyone insert" ON public.order_items;
CREATE POLICY "order_items: anyone insert"
ON public.order_items
FOR INSERT
TO anon, authenticated
WITH CHECK (
  quantity > 0
  AND unit_price >= 0
  AND total_price >= 0
  AND EXISTS (
    SELECT 1
    FROM public.orders o
    JOIN public.restaurants r ON r.id = o.restaurant_id
    JOIN public.food_items f ON f.id = order_items.food_item_id
    WHERE o.id = order_items.order_id
      AND r.status = 'active'
      AND f.restaurant_id = o.restaurant_id
  )
);

DROP POLICY IF EXISTS "order_items: owner update" ON public.order_items;
CREATE POLICY "order_items: owner update"
ON public.order_items
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_items.order_id
      AND (public.owns_restaurant(auth.uid(), o.restaurant_id) OR public.is_super_admin(auth.uid()))
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_items.order_id
      AND (public.owns_restaurant(auth.uid(), o.restaurant_id) OR public.is_super_admin(auth.uid()))
  )
);

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
