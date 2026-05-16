import prisma from "../lib/prisma";

// ─── 1. CREATE CATEGORY ────────────────────────────
export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const category = await prisma.category.create({ data: { name } });
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── 2. GET ALL CATEGORIES ─────────────────────────
export const getAllCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
    });
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── 3. GET CATEGORY BY ID ─────────────────────────
export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category)
      return res
        .status(404)
        .json({ success: false, error: "Category not found" });
    res.json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── 4. UPDATE CATEGORY ────────────────────────────
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!id)
      return res
        .status(400)
        .json({ success: false, error: "Category ID required" });
    if (!name || name.trim() === "")
      return res
        .status(400)
        .json({ success: false, error: "Name cannot be empty" });

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing)
      return res
        .status(404)
        .json({ success: false, error: "Category not found" });

    const category = await prisma.category.update({
      where: { id },
      data: { name: name.trim() },
    });
    res.json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── 5. DELETE CATEGORY ────────────────────────────
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id)
      return res
        .status(400)
        .json({ success: false, error: "Category ID required" });

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing)
      return res
        .status(404)
        .json({ success: false, error: "Category not found" });

    await prisma.category.delete({ where: { id } });
    res.json({ success: true, message: "Category deleted" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── 6. GET CATEGORY WITH PRODUCTS ─────────────────
export const getCategoryWithProducts = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        products: {
          include: {
            product: {
              include: {
                menu: { include: { restaurant: { select: { name: true } } } },
              },
            },
          },
        },
      },
    });
    if (!category)
      return res
        .status(404)
        .json({ success: false, error: "Category not found" });
    res.json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
