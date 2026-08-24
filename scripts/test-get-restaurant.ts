import { getRestaurantData } from "../src/lib/db-queries.server";

async function test() {
  try {
    const res = await getRestaurantData({ data: "burgercraft" });
    if (!res) {
      console.log("No restaurant data found for 'burgercraft'.");
      return;
    }
    console.log("=== GET RESTAURANT DATA PROMOTIONS ===");
    console.log(JSON.stringify(res.promotions, null, 2));

    console.log("=== GET RESTAURANT DATA FIRST MENU ITEM ===");
    console.log(JSON.stringify(res.menuItems?.[0], null, 2));
  } catch (e) {
    console.error("Test error:", e);
  }
}

test();
