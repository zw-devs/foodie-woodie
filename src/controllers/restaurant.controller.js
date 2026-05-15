import prisma from "../lib/prisma.js";
import { successResponse, errorResponse } from "../utils/helper.js";

// GET /api/restaurants
export const getAllRestaurants = async (req, res) => {
  try {
    const { area_zone, is_active } = req.query;
    const where = {};
    
    if (area_zone) where.area_zone = area_zone;
    if (is_active !== undefined) where.is_active = is_active === 'true';

    const restaurants = await prisma.restaurant.findMany({ where });
    return successResponse(res, restaurants, 'Restaurants fetched successfully');
  } catch (err) {
    return errorResponse(res, err, 'Failed to fetch restaurants');
  }
};

// GET /api/restaurants/:id
export const getRestaurantById = async (req, res) => {
  try {
    const { id } = req.params;
    const restaurant = await prisma.restaurant.findUnique({ where: { id } });
    
    if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found' });
    
    return successResponse(res, restaurant, 'Restaurant fetched successfully');
  } catch (err) {
    return errorResponse(res, err, 'Failed to fetch restaurant');
  }
};

// POST /api/restaurants  (restaurant_owner / home_chef)
export const createRestaurant = async (req, res) => {
  try {
    const owner_id = req.user.userId;
    const { name, address, latitude, longitude, area_zone, opening_time, closing_time, closing_discount_pct } = req.body;

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
        closing_discount_pct
      }
    });
    
    return successResponse(res, restaurant, 'Restaurant created successfully', 201);
  } catch (err) {
    return errorResponse(res, err, 'Failed to create restaurant');
  }
};

// PUT /api/restaurants/:id
export const updateRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    const owner_id = req.user.userId;
    const { name, address, latitude, longitude, area_zone, opening_time, closing_time, closing_discount_pct, is_active } = req.body;

    const existing = await prisma.restaurant.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ success: false, message: 'Restaurant not found' });
    if (existing.owner_id !== owner_id) return res.status(403).json({ success: false, message: 'Not authorized to update this restaurant' });

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
        is_active
      }
    });
    
    return successResponse(res, restaurant, 'Restaurant updated successfully');
  } catch (err) {
    return errorResponse(res, err, 'Failed to update restaurant');
  }
};

// DELETE /api/restaurants/:id
export const deleteRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    const owner_id = req.user.userId;

    const existing = await prisma.restaurant.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ success: false, message: 'Restaurant not found' });
    if (existing.owner_id !== owner_id) return res.status(403).json({ success: false, message: 'Not authorized to delete this restaurant' });

    await prisma.restaurant.delete({ where: { id } });
    return successResponse(res, null, 'Restaurant deleted successfully');
  } catch (err) {
    return errorResponse(res, err, 'Failed to delete restaurant');
  }
};

// PATCH /api/restaurants/:id/toggle-active
export const toggleActive = async (req, res) => {
  try {
    const { id } = req.params;
    const owner_id = req.user.userId;

    const existing = await prisma.restaurant.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ success: false, message: 'Restaurant not found' });
    if (existing.owner_id !== owner_id) return res.status(403).json({ success: false, message: 'Not authorized to modify this restaurant' });

    const restaurant = await prisma.restaurant.update({
      where: { id },
      data: { is_active: !existing.is_active }
    });
    
    return successResponse(res, restaurant, `Restaurant is now ${restaurant.is_active ? 'active' : 'inactive'}`);
  } catch (err) {
    return errorResponse(res, err, 'Failed to toggle restaurant status');
  }
};

// GET /api/restaurants/my  (owner sees their own restaurants)
export const getMyRestaurants = async (req, res) => {
  try {
    const owner_id = req.user.userId;
    const restaurants = await prisma.restaurant.findMany({ where: { owner_id } });
    
    return successResponse(res, restaurants, 'Your restaurants fetched');
  } catch (err) {
    return errorResponse(res, err, 'Failed to fetch your restaurants');
  }
};
