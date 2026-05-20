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
    const { name, description, price, category, isSpecial, imageUrl } = req.body;

    const menuItem = {
      name,
      description,
      price,
      category,
      isSpecial,
      imageUrl,
      isAvailable: true,
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
    const { name, description, price, category, isSpecial, imageUrl, isAvailable } = req.body;
    await db.collection('menu').doc(req.params.id).update({
      name, description, price, category, isSpecial, imageUrl, isAvailable,
      updatedAt: new Date().toISOString()
    });
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
