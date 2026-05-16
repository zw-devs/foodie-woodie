import prisma from "../lib/prisma";
// ─── 1. CREATE MENU ────────────────────────────────
export const createMenu = async (req, res) => {
  try {
    const { restaurant_id, menu_type } = req.body;

    if (!restaurant_id || restaurant_id.trim() === "")
      return res
        .status(400)
        .json({ success: false, error: "Restaurant ID is required" });
    if (!menu_type || !["breakfast", "lunch_dinner"].includes(menu_type))
      return res
        .status(400)
        .json({
          success: false,
          error: "Valid menu type is required (breakfast or lunch_dinner)",
        });

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurant_id },
    });
    if (!restaurant)
      return res
        .status(404)
        .json({ success: false, error: "Restaurant not found" });

    const menu = await prisma.menu.create({
      data: { restaurant_id, menu_type },
      include: { restaurant: { select: { name: true } } },
    });

    res.status(201).json({ success: true, data: menu });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── 2. GET ALL MENUS ──────────────────────────────
export const getAllMenus = async (req, res) => {
  try {
    const { restaurant_id, menu_type } = req.query;
    const where = {};
    if (restaurant_id) where.restaurant_id = restaurant_id;
    if (menu_type) where.menu_type = menu_type;

    const menus = await prisma.menu.findMany({
      where,
      include: {
        restaurant: { select: { name: true } },
        products: { where: { deleted_at: null } },
      },
      orderBy: { created_at: "desc" },
    });

    res.json({ success: true, data: menus });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── 3. GET MENU BY ID ─────────────────────────────
export const getMenuById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || id.trim() === "")
      return res
        .status(400)
        .json({ success: false, error: "Menu ID is required" });

    const menu = await prisma.menu.findUnique({
      where: { id },
      include: {
        restaurant: { select: { name: true } },
        products: { where: { deleted_at: null, is_available: true } },
      },
    });

    if (!menu)
      return res.status(404).json({ success: false, error: "Menu not found" });
    res.json({ success: true, data: menu });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── 4. GET MENUS BY RESTAURANT ────────────────────
export const getMenusByRestaurant = async (req, res) => {
  try {
    const { restaurant_id } = req.params;

    if (!restaurant_id || restaurant_id.trim() === "")
      return res
        .status(400)
        .json({ success: false, error: "Restaurant ID is required" });

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurant_id },
    });
    if (!restaurant)
      return res
        .status(404)
        .json({ success: false, error: "Restaurant not found" });

    const menus = await prisma.menu.findMany({
      where: { restaurant_id },
      include: { products: { where: { deleted_at: null } } },
      orderBy: { created_at: "desc" },
    });

    res.json({ success: true, data: menus });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── 5. UPDATE MENU ────────────────────────────────
export const updateMenu = async (req, res) => {
  try {
    const { id } = req.params;
    const { menu_type, is_active } = req.body;

    if (!id || id.trim() === "")
      return res
        .status(400)
        .json({ success: false, error: "Menu ID is required" });
    if (!menu_type && is_active === undefined)
      return res
        .status(400)
        .json({
          success: false,
          error: "At least one field (menu_type or is_active) is required",
        });
    if (menu_type && !["breakfast", "lunch_dinner"].includes(menu_type))
      return res
        .status(400)
        .json({
          success: false,
          error: "Valid menu type is required (breakfast or lunch_dinner)",
        });

    const existing = await prisma.menu.findUnique({ where: { id } });
    if (!existing)
      return res.status(404).json({ success: false, error: "Menu not found" });

    const updateData = {};
    if (menu_type) updateData.menu_type = menu_type;
    if (is_active !== undefined) updateData.is_active = is_active;

    const menu = await prisma.menu.update({
      where: { id },
      data: updateData,
      include: { restaurant: { select: { name: true } } },
    });

    res.json({ success: true, data: menu });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── 6. TOGGLE MENU STATUS ─────────────────────────
export const toggleMenuStatus = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || id.trim() === "")
      return res
        .status(400)
        .json({ success: false, error: "Menu ID is required" });

    const existing = await prisma.menu.findUnique({ where: { id } });
    if (!existing)
      return res.status(404).json({ success: false, error: "Menu not found" });

    const menu = await prisma.menu.update({
      where: { id },
      data: { is_active: !existing.is_active },
      include: { restaurant: { select: { name: true } } },
    });

    res.json({
      success: true,
      data: menu,
      message: `Menu is now ${menu.is_active ? "active" : "inactive"}`,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── 7. DELETE MENU ────────────────────────────────
export const deleteMenu = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || id.trim() === "")
      return res
        .status(400)
        .json({ success: false, error: "Menu ID is required" });

    const existing = await prisma.menu.findUnique({ where: { id } });
    if (!existing)
      return res.status(404).json({ success: false, error: "Menu not found" });

    await prisma.menu.delete({ where: { id } });
    res.json({ success: true, message: "Menu deleted" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── 8. GET ACTIVE MENUS ───────────────────────────
export const getActiveMenus = async (req, res) => {
  try {
    const { restaurant_id } = req.query;
    const where = { is_active: true };
    if (restaurant_id) where.restaurant_id = restaurant_id;

    const menus = await prisma.menu.findMany({
      where,
      include: {
        restaurant: { select: { name: true } },
        products: { where: { is_available: true, deleted_at: null } },
      },
      orderBy: { created_at: "desc" },
    });

    res.json({ success: true, data: menus });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
