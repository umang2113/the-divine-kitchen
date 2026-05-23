import { Request, Response } from 'express';
import { db } from '../config/firebase';

// @desc    Fetch all menu items
// @route   GET /api/menu
// @access  Public
export const getMenuItems = async (req: Request, res: Response) => {
  try {
    const menuRef = db.collection('menu');
    const snapshot = await menuRef.get();
    
    const menuItems = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.json(menuItems);
  } catch (error) {
    console.error("Fetch Menu Error:", error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a new menu item
// @route   POST /api/menu
// @access  Private/Admin
export const createMenuItem = async (req: Request, res: Response) => {
  try {
    const { 
      category_name, subcategory_name, catalogue_id, catalogue_name, 
      variant_id, variant_name, current_price, description, image_url,
      // Fallbacks in case old admin UI is briefly cached
      name, price, category, imageUrl, isSpecial 
    } = req.body;

    const menuItem = {
      category_name: category_name || category || "",
      subcategory_name: subcategory_name || "",
      catalogue_id: catalogue_id || "",
      catalogue_name: catalogue_name || name || "",
      variant_id: variant_id || "",
      variant_name: variant_name || "",
      current_price: current_price !== undefined ? current_price : (price || 0),
      description: description || "",
      image_url: image_url || imageUrl || "",
      isAvailable: true,
      isSpecial: isSpecial || false, // Keeping for backward compatibility flag
      createdAt: new Date().toISOString()
    };

    const docRef = await db.collection('menu').add(menuItem);
    res.status(201).json({ id: docRef.id, ...menuItem });
  } catch (error) {
    console.error("Create Menu Item Error:", error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update menu item
// @route   PUT /api/menu/:id
// @access  Private/Admin
export const updateMenuItem = async (req: Request, res: Response) => {
  try {
    const { 
      category_name, subcategory_name, catalogue_id, catalogue_name, 
      variant_id, variant_name, current_price, description, image_url,
      isAvailable, isSpecial,
      name, price, category, imageUrl
    } = req.body;

    const updateData: any = {
      category_name: category_name || category || "",
      subcategory_name: subcategory_name || "",
      catalogue_id: catalogue_id || "",
      catalogue_name: catalogue_name || name || "",
      variant_id: variant_id || "",
      variant_name: variant_name || "",
      current_price: current_price !== undefined ? current_price : (price || 0),
      description: description || "",
      image_url: image_url || imageUrl || "",
      updatedAt: new Date().toISOString()
    };

    if (isAvailable !== undefined) updateData.isAvailable = isAvailable;
    if (isSpecial !== undefined) updateData.isSpecial = isSpecial;

    await db.collection('menu').doc(req.params.id).update(updateData);
    res.json({ message: 'Menu item updated successfully' });
  } catch (error) {
    console.error("Update Menu Item Error:", error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete menu item
// @route   DELETE /api/menu/:id
// @access  Private/Admin
export const deleteMenuItem = async (req: Request, res: Response) => {
  try {
    await db.collection('menu').doc(req.params.id).delete();
    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    console.error("Delete Menu Item Error:", error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Toggle menu item availability
// @route   PATCH /api/menu/:id/availability
// @access  Private/Staff/Admin
export const toggleMenuAvailability = async (req: Request, res: Response) => {
  try {
    const { isAvailable } = req.body;
    if (isAvailable === undefined) {
      return res.status(400).json({ message: 'isAvailable is required' });
    }
    
    await db.collection('menu').doc(req.params.id).update({ 
      isAvailable,
      updatedAt: new Date().toISOString()
    });
    
    res.json({ message: 'Menu availability updated successfully' });
  } catch (error) {
    console.error("Toggle Menu Availability Error:", error);
    res.status(500).json({ message: 'Server error' });
  }
};
