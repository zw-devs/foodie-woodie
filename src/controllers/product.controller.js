// src/controllers/product.controller.js
import prisma from "../lib/prisma";

// ─── 1. CREATE PRODUCT ─────────────────────────────
export const createProduct = async (req, res) => {
  try {
    const {
      menu_id,
      name,
      description,
      price,
      image_url,
      calories,
      category_ids,
    } = req.body;

    const product = await prisma.product.create({
      data: {
        menu_id,
        name,
        description,
        price: parseFloat(price),
        image_url,
        calories: calories ? parseInt(calories) : null,
        is_available: true,
        categories: {
          create: category_ids?.map((id) => ({ category_id: id })) || [],
        },
      },
      include: { categories: { include: { category: true } } },
    });

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── 2. GET ALL PRODUCTS ───────────────────────────
export const getAllProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, available, menu_id, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = { deleted_at: null };
    if (available !== undefined) where.is_available = available === "true";
    if (menu_id) where.menu_id = menu_id;
    if (search) where.name = { contains: search, mode: "insensitive" };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          menu: true,
          categories: { include: { category: true } },
          _count: { select: { comments: true } },
        },
        orderBy: { created_at: "desc" },
      }),
      prisma.product.count({ where }),
    ]);

    res.json({
      success: true,
      data: products,
      meta: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── 3. GET PRODUCT BY ID ──────────────────────────
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id, deleted_at: null },
      include: {
        menu: { include: { restaurant: true } },
        categories: { include: { category: true } },
        comments: {
          include: { user: { select: { username: true } } },
          orderBy: { created_at: "desc" },
        },
        _count: { select: { order_items: true } },
      },
    });

    if (!product)
      return res
        .status(404)
        .json({ success: false, error: "Product not found" });

    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── 4. UPDATE PRODUCT ─────────────────────────────
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, image_url, calories, is_available } =
      req.body;

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(price && { price: parseFloat(price) }),
        ...(image_url !== undefined && { image_url }),
        ...(calories !== undefined && {
          calories: calories ? parseInt(calories) : null,
        }),
        ...(is_available !== undefined && { is_available }),
      },
      include: { categories: { include: { category: true } } },
    });

    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── 5. DELETE PRODUCT (SOFT) ────────────────────────
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.product.update({
      where: { id },
      data: { deleted_at: new Date(), is_available: false },
    });

    res.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── 6. GET PRODUCTS BY MENU ─────────────────────────
export const getProductsByMenu = async (req, res) => {
  try {
    const { menu_id } = req.params;
    const { available } = req.query;

    const where = { menu_id, deleted_at: null };
    if (available === "true") where.is_available = true;

    const products = await prisma.product.findMany({
      where,
      include: { categories: { include: { category: true } } },
      orderBy: { created_at: "desc" },
    });

    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── 7. GET PRODUCTS BY CATEGORY ─────────────────────
export const getProductsByCategory = async (req, res) => {
  try {
    const { category_id } = req.params;

    const products = await prisma.product.findMany({
      where: { deleted_at: null, categories: { some: { category_id } } },
      include: { categories: { include: { category: true } }, menu: true },
      orderBy: { created_at: "desc" },
    });

    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── 8. TOGGLE AVAILABILITY ────────────────────────
export const toggleAvailability = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      select: { is_available: true },
    });
    if (!product)
      return res
        .status(404)
        .json({ success: false, error: "Product not found" });

    const updated = await prisma.product.update({
      where: { id },
      data: { is_available: !product.is_available },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── 9. GET AVAILABLE PRODUCTS ─────────────────────
export const getAvailableProducts = async (req, res) => {
  try {
    const { restaurant_id, menu_id } = req.query;

    const where = { is_available: true, deleted_at: null };

    const products = await prisma.product.findMany({
      where,
      include: {
        menu: {
          where: menu_id ? { id: menu_id } : undefined,
          include: {
            restaurant: {
              where: restaurant_id ? { id: restaurant_id } : undefined,
            },
          },
        },
        categories: { include: { category: true } },
      },
    });

    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const searchProducts = async (req, res) => {
  //example endpoint: GET /api/products/search?category=fastfood&q=burger

  try {
    const { q, min_price, max_price, category } = req.query;

    const where = { deleted_at: null, is_available: true };

    if (q)
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ];

    if (min_price) where.price = { ...where.price, gte: parseFloat(min_price) };
    if (max_price) where.price = { ...where.price, lte: parseFloat(max_price) };

    if (category)
      where.categories = {
        some: {
          category: { name: { equals: category, mode: "insensitive" } },
        },
      };

    const products = await prisma.product.findMany({
      where,
      include: {
        categories: { include: { category: true } },
        menu: {
          include: { restaurant: { select: { name: true, area_zone: true } } },
        },
      },
      orderBy: { created_at: "desc" },
    });

    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── 11. GET PRODUCTS BY RESTAURANT ────────────────
export const getProductsByRestaurant = async (req, res) => {
  try {
    const { restaurant_id } = req.params;

    const products = await prisma.product.findMany({
      where: { deleted_at: null, menu: { restaurant_id } },
      include: { menu: true, categories: { include: { category: true } } },
      orderBy: { created_at: "desc" },
    });

    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── 12. UPDATE PRODUCT CATEGORIES ─────────────────
export const updateProductCategories = async (req, res) => {
  try {
    const { id } = req.params;
    const { category_ids } = req.body;

    await prisma.product_category.deleteMany({ where: { product_id: id } });

    if (category_ids?.length > 0) {
      await prisma.product_category.createMany({
        data: category_ids.map((cid) => ({ product_id: id, category_id: cid })),
        skipDuplicates: true,
      });
    }

    const product = await prisma.product.findUnique({
      where: { id },
      include: { categories: { include: { category: true } } },
    });

    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── 13. GET PRODUCT WITH REVIEWS ──────────────────
export const getProductWithReviews = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id, deleted_at: null },
      include: {
        comments: {
          include: { user: { select: { username: true, id: true } } },
          orderBy: { created_at: "desc" },
        },
        _count: { select: { comments: true } },
      },
    });

    if (!product)
      return res
        .status(404)
        .json({ success: false, error: "Product not found" });

    const avgRating =
      product.comments.length > 0
        ? product.comments.reduce((sum, c) => sum + c.rating, 0) /
          product.comments.length
        : 0;

    res.json({
      success: true,
      data: { ...product, average_rating: parseFloat(avgRating.toFixed(1)) },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── 14. GET TOP RATED PRODUCTS ────────────────────
export const getTopRatedProducts = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const products = await prisma.product.findMany({
      where: { deleted_at: null, is_available: true },
      include: {
        comments: { select: { rating: true } },
        categories: { include: { category: true } },
      },
    });

    const rated = products
      .map((p) => ({
        ...p,
        avg_rating:
          p.comments.length > 0
            ? p.comments.reduce((s, c) => s + c.rating, 0) / p.comments.length
            : 0,
        review_count: p.comments.length,
      }))
      .sort((a, b) => b.avg_rating - a.avg_rating)
      .slice(0, parseInt(limit));

    res.json({ success: true, data: rated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
