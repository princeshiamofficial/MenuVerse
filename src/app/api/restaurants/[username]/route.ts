import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCachedTenant, setCachedTenant } from '@/lib/redis';

interface RouteParams {
  params: Promise<{ username: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { username } = await params;

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    const cleanUsername = username.toLowerCase().trim();

    // 1. Try to read from Redis cache
    const cachedData = await getCachedTenant(cleanUsername);
    if (cachedData) {
      console.log(`Redis Cache Hit for tenant: ${cleanUsername}`);
      return NextResponse.json(cachedData);
    }

    console.log(`Redis Cache Miss for tenant: ${cleanUsername}. Querying MySQL...`);

    // 2. Query Restaurant details
    const restaurants = await query<any[]>(
      `SELECT * FROM restaurants WHERE username = ?`,
      [cleanUsername]
    );

    if (restaurants.length === 0) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
    }

    const restaurant = restaurants[0];

    // 3. Query Branches
    const branches = await query<any[]>(
      `SELECT * FROM branches WHERE restaurant_id = ?`,
      [restaurant.id]
    );

    // 4. Query Tables for each branch
    const branchesWithTables = [];
    for (const b of branches) {
      const tables = await query<any[]>(
        `SELECT name, location, status FROM branch_tables WHERE branch_id = ?`,
        [b.id]
      );
      branchesWithTables.push({
        id: b.id,
        name: b.name,
        location: b.location,
        phone: b.phone,
        operatingHours: b.operating_hours,
        tables: tables.map((t: any) => ({
          name: t.name,
          location: t.location,
          status: t.status,
        })),
      });
    }

    // 5. Query Menu Items
    const menuItems = await query<any[]>(
      `SELECT id, name, description, price, image, category, popular FROM menu_items WHERE restaurant_id = ?`,
      [restaurant.id]
    );

    const formattedMenuItems = menuItems.map((item: any) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      price: parseFloat(item.price),
      image: item.image,
      category: item.category,
      popular: item.popular === 1,
    }));

    let parsedOfferSlides = [];
    try {
      let slidesVal = restaurant.offer_slides;
      while (slidesVal && typeof slidesVal === 'string') {
        slidesVal = JSON.parse(slidesVal);
      }
      parsedOfferSlides = Array.isArray(slidesVal) ? slidesVal : [];
    } catch (e) {
      console.error('Failed to parse offer_slides JSON:', e);
    }

    // 6. Structure response data matching public Restaurant format
    const fullRestaurantData = {
      id: restaurant.id,
      name: restaurant.name,
      cuisine: restaurant.cuisine,
      rating: restaurant.rating,
      reviews: restaurant.reviews,
      price: restaurant.price,
      time: restaurant.time,
      location: restaurant.location,
      logo: restaurant.logo,
      logoBg: restaurant.logo_bg,
      image: restaurant.image,
      logoImage: restaurant.logo_image,
      username: restaurant.username,
      phone: restaurant.phone,
      operatingHours: restaurant.operating_hours,
      facilities: restaurant.facilities,
      introText: restaurant.intro_text,
      descriptionText: restaurant.description_text,
      primaryColor: restaurant.primary_color || '#ff7a00',
      fontFamily: restaurant.font_family || 'Outfit',
      layoutType: restaurant.layout_type || 'grid',
      offerSlides: parsedOfferSlides,
      branches: branchesWithTables,
      menuItems: formattedMenuItems,
    };


    // 7. Store in Redis cache for 1 hour
    await setCachedTenant(cleanUsername, fullRestaurantData, 3600);

    return NextResponse.json(fullRestaurantData);
  } catch (err: any) {
    console.error('Public restaurant GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
