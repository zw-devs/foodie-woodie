import * as menuService from "../services/menu/menu.service.js";
import { successResponse, errorResponse } from "../utils/helper.js";

// GET /api/restaurants/:restaurantId/menus
export const getMenusByRestaurant = async (req, res) => {
  try {
    const menus = await menuService.getMenusByRestaurant(
      req.params.restaurantId,
    );
    return successResponse(res, menus, "Menus fetched successfully");
  } catch (err) {
    return errorResponse(res, err, "Failed to fetch menus");
  }
};

// GET /api/menus/:id
export const getMenuById = async (req, res) => {
  try {
    const menu = await menuService.getMenuById(req.params.id);
    return successResponse(res, menu, "Menu fetched successfully");
  } catch (err) {
    return errorResponse(res, err, "Failed to fetch menu");
  }
};

// POST /api/restaurants/:restaurantId/menus
// Body: { menu_type: 'breakfast' | 'lunch_dinner' }
export const createMenu = async (req, res) => {
  try {
    const menu = await menuService.createMenu(
      req.params.restaurantId,
      req.user.userId,
      req.body,
    );
    return successResponse(res, menu, "Menu created successfully", 201);
  } catch (err) {
    return errorResponse(res, err, "Failed to create menu");
  }
};

// PUT /api/menus/:id
// Body: { menu_type, is_active }
export const updateMenu = async (req, res) => {
  try {
    const menu = await menuService.updateMenu(
      req.params.id,
      req.user.userId,
      req.body,
    );
    return successResponse(res, menu, "Menu updated successfully");
  } catch (err) {
    return errorResponse(res, err, "Failed to update menu");
  }
};

// DELETE /api/menus/:id
export const deleteMenu = async (req, res) => {
  try {
    await menuService.deleteMenu(req.params.id, req.user.userId);
    return successResponse(res, null, "Menu deleted successfully");
  } catch (err) {
    return errorResponse(res, err, "Failed to delete menu");
  }
};

// POST /api/menus/:id/categories
// Body: { category_id }
// Links a Category to a Menu via MenuCategory junction table
export const assignCategory = async (req, res) => {
  try {
    const result = await menuService.assignCategory(
      req.params.id,
      req.body.category_id,
    );
    return successResponse(res, result, "Category assigned to menu");
  } catch (err) {
    return errorResponse(res, err, "Failed to assign category");
  }
};

// DELETE /api/menus/:id/categories/:categoryId
export const removeCategory = async (req, res) => {
  try {
    await menuService.removeCategory(req.params.id, req.params.categoryId);
    return successResponse(res, null, "Category removed from menu");
  } catch (err) {
    return errorResponse(res, err, "Failed to remove category");
  }
};
