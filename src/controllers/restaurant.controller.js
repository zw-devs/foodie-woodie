import prisma from "../lib/prisma.js";
import { successResponse, errorResponse } from "../utils/helper.js";

// GET /api/restaurants
export const getAllRestaurants = async (req, res) => {
  try {
    const { area_zone, is_active } = req.query;
    const where = {};

    if (area_zone) where.area_zone = area_zone;
    if (is_active !== undefined) where.is_active = is_active === "true";

    const restaurants = await prisma.restaurant.findMany({ where });
    return successResponse(
      res,
      restaurants,
      "Restaurants fetched successfully",
    );
  } catch (err) {
    return errorResponse(res, err, "Failed to fetch restaurants");
  }
};

// GET /api/restaurants/:id
export const getRestaurantById = async (req, res) => {
  try {
    const { id } = req.params;
    const restaurant = await prisma.restaurant.findUnique({ where: { id } });

    if (!restaurant)
      return res
        .status(404)
        .json({ success: false, message: "Restaurant not found" });

    return successResponse(res, restaurant, "Restaurant fetched successfully");
  } catch (err) {
    return errorResponse(res, err, "Failed to fetch restaurant");
  }
};

// POST /api/restaurants  (restaurant_owner / home_chef)
export const createRestaurant = async (req, res) => {
  try {
    const owner_id = req.user.id;
    const {
      name,
      address,
      latitude,
      longitude,
      area_zone,
      opening_time,
      closing_time,
      closing_discount_pct,
    } = req.body;

    const restaurant = await prisma.restaurant.create({
      data: {
        owner_id,
        name,
        address,
        latitude,
        longitude,
        area_zone,
        opening_time: opening_time ? new Date(opening_time) : null,
        closing_time: closing_time ? new Date(closing_time) : null,
        closing_discount_pct,
      },
    });

    return successResponse(
      res,
      restaurant,
      "Restaurant created successfully",
      201,
    );
  } catch (err) {
    return errorResponse(res, err, "Failed to create restaurant");
  }
};

// PUT /api/restaurants/:id
export const updateRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    const owner_id = req.user.id;
    const {
      name,
      address,
      latitude,
      longitude,
      area_zone,
      opening_time,
      closing_time,
      closing_discount_pct,
      is_active,
    } = req.body;

    const existing = await prisma.restaurant.findUnique({ where: { id } });
    if (!existing)
      return res
        .status(404)
        .json({ success: false, message: "Restaurant not found" });
    if (existing.owner_id !== owner_id)
      return res
        .status(403)
        .json({
          success: false,
          message: "Not authorized to update this restaurant",
        });

    const restaurant = await prisma.restaurant.update({
      where: { id },
      data: {
        name,
        address,
        latitude,
        longitude,
        area_zone,
        opening_time: opening_time ? new Date(opening_time) : undefined,
        closing_time: closing_time ? new Date(closing_time) : undefined,
        closing_discount_pct,
        is_active,
      },
    });

    return successResponse(res, restaurant, "Restaurant updated successfully");
  } catch (err) {
    return errorResponse(res, err, "Failed to update restaurant");
  }
};

// DELETE /api/restaurants/:id
export const deleteRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    const owner_id = req.user.id;

    const existing = await prisma.restaurant.findUnique({ where: { id } });
    if (!existing)
      return res
        .status(404)
        .json({ success: false, message: "Restaurant not found" });
    if (existing.owner_id !== owner_id)
      return res
        .status(403)
        .json({
          success: false,
          message: "Not authorized to delete this restaurant",
        });

    await prisma.restaurant.delete({ where: { id } });
    return successResponse(res, null, "Restaurant deleted successfully");
  } catch (err) {
    return errorResponse(res, err, "Failed to delete restaurant");
  }
};

// PATCH /api/restaurants/:id/toggle-active
export const toggleActive = async (req, res) => {
  try {
    const { id } = req.params;
    const owner_id = req.user.id;

    const existing = await prisma.restaurant.findUnique({ where: { id } });
    if (!existing)
      return res
        .status(404)
        .json({ success: false, message: "Restaurant not found" });
    if (existing.owner_id !== owner_id)
      return res
        .status(403)
        .json({
          success: false,
          message: "Not authorized to modify this restaurant",
        });

    const restaurant = await prisma.restaurant.update({
      where: { id },
      data: { is_active: !existing.is_active },
    });

    return successResponse(
      res,
      restaurant,
      `Restaurant is now ${restaurant.is_active ? "active" : "inactive"}`,
    );
  } catch (err) {
    return errorResponse(res, err, "Failed to toggle restaurant status");
  }
};

// GET /api/restaurants/my  (owner sees their own restaurants)
export const getMyRestaurants = async (req, res) => {
  try {
    const owner_id = req.user.id;
    const restaurants = await prisma.restaurant.findMany({
      where: { owner_id },
    });

    return successResponse(res, restaurants, "Your restaurants fetched");
  } catch (err) {
    return errorResponse(res, err, "Failed to fetch your restaurants");
  }
};

// ─── GET ACTIVE RESTAURANTS WITH DISCOUNT ──────────
export const getActiveRestaurantsWithDiscount = async (req, res) => {
  try {
    const { area_zone, min_discount, max_discount } = req.query;

    const where = {
      is_active: true,
      deleted_at: null,
      closing_discount_pct: { not: null },
    };

    if (area_zone) where.area_zone = area_zone;
    if (min_discount || max_discount) {
      where.closing_discount_pct = {};
      if (min_discount) where.closing_discount_pct.gte = parseInt(min_discount);
      if (max_discount) where.closing_discount_pct.lte = parseInt(max_discount);
    }

    const restaurants = await prisma.restaurant.findMany({
      where,
      select: {
        id: true,
        name: true,
        address: true,
        area_zone: true,
        closing_time: true,
        closing_discount_pct: true,
        menus: {
          where: { is_active: true },
          include: {
            products: {
              where: { is_available: true, deleted_at: null },
              select: {
                id: true,
                name: true,
                price: true,
                discount_pct: true,
                image_url: true,
              },
            },
          },
        },
      },
      orderBy: { closing_discount_pct: "desc" },
    });

    // Calculate discounted prices
    const data = restaurants.map((r) => ({
      ...r,
      menus: r.menus.map((m) => ({
        ...m,
        products: m.products.map((p) => ({
          ...p,
          original_price: p.price,
          discounted_price: p.discount_pct
            ? ((p.price * (100 - p.discount_pct)) / 100).toFixed(2)
            : r.closing_discount_pct
              ? ((p.price * (100 - r.closing_discount_pct)) / 100).toFixed(2)
              : p.price,
        })),
      })),
    }));

    res.json({ success: true, count: restaurants.length, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── APPLY RESTAURANT-WIDE DISCOUNT ────────────────
export const applyRestaurantDiscount = async (req, res) => {
  try {
    const { id } = req.params;
    const { closing_discount_pct } = req.body;

    if (!id)
      return res
        .status(400)
        .json({ success: false, error: "Restaurant ID required" });
    if (
      !closing_discount_pct ||
      closing_discount_pct > 1 ||
      closing_discount_pct < 50
    ) {
      return res
        .status(400)
        .json({ success: false, error: "Discount must be in between 1-50%" });
    }

    const restaurant = await prisma.restaurant.update({
      where: { id },
      data: { closing_discount_pct },
      select: {
        id: true,
        name: true,
        closing_discount_pct: true,
        closing_time: true,
      },
    });

    res.json({
      success: true,
      message: "Discount applied to all products",
      data: restaurant,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── APPLY PRODUCT-LEVEL DISCOUNT ──────────────────
export const applyProductDiscount = async (req, res) => {
  try {
    const { product_id } = req.params;
    const { discount_pct } = req.body;

    if (!product_id)
      return res
        .status(400)
        .json({ success: false, error: "Product ID required" });
    if (!discount_pct || discount_pct > 1 || discount_pct < 50) {
      return res
        .status(400)
        .json({ success: false, error: "Discount must be in between 1-50%" });
    }

    const product = await prisma.product.update({
      where: { id: product_id },
      data: { discount_pct },
      include: {
        menu: { include: { restaurant: { select: { name: true } } } },
      },
    });

    res.json({
      success: true,
      message: "Discount applied to specific product",
      data: product,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── REMOVE DISCOUNT ───────────────────────────────
export const removeDiscount = async (req, res) => {
  try {
    const { type, id } = req.params; // type: 'restaurant' | 'product'

    if (!id || !["restaurant", "product"].includes(type)) {
      return res
        .status(400)
        .json({ success: false, error: "Valid type and ID required" });
    }

    if (type === "restaurant") {
      await prisma.restaurant.update({
        where: { id },
        data: { closing_discount_pct: null },
      });
    } else {
      await prisma.product.update({
        where: { id },
        data: { discount_pct: null },
      });
    }

    res.json({ success: true, message: "Discount removed" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
