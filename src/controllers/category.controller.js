import * as categoryService from "../services/category/category.service.js";
import { successResponse, errorResponse } from "../utils/helper.js";

// GET /api/categories
export const getAllCategories = async (req, res) => {
  try {
    const categories = await categoryService.getAllCategories();
    return successResponse(res, categories, "Categories fetched successfully");
  } catch (err) {
    return errorResponse(res, err, "Failed to fetch categories");
  }
};

// GET /api/categories/:id
export const getCategoryById = async (req, res) => {
  try {
    const category = await categoryService.getCategoryById(req.params.id);
    return successResponse(res, category, "Category fetched successfully");
  } catch (err) {
    return errorResponse(res, err, "Failed to fetch category");
  }
};

// POST /api/categories  (admin only)
// Body: { name }
export const createCategory = async (req, res) => {
  try {
    const category = await categoryService.createCategory(req.body);
    return successResponse(res, category, "Category created successfully", 201);
  } catch (err) {
    return errorResponse(res, err, "Failed to create category");
  }
};

// PUT /api/categories/:id  (admin only)
// Body: { name }
export const updateCategory = async (req, res) => {
  try {
    const category = await categoryService.updateCategory(
      req.params.id,
      req.body,
    );
    return successResponse(res, category, "Category updated successfully");
  } catch (err) {
    return errorResponse(res, err, "Failed to update category");
  }
};

// DELETE /api/categories/:id  (admin only)
export const deleteCategory = async (req, res) => {
  try {
    await categoryService.deleteCategory(req.params.id);
    return successResponse(res, null, "Category deleted successfully");
  } catch (err) {
    return errorResponse(res, err, "Failed to delete category");
  }
};
