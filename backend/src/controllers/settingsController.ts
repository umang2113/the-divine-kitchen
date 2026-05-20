import { Request, Response } from 'express';
import { db } from '../config/firebase';

// @desc    Get Kitchen Settings
// @route   GET /api/settings
// @access  Public
export const getSettings = async (req: Request, res: Response) => {
  try {
    const doc = await db.collection('settings').doc('restaurant').get();
    
    if (!doc.exists) {
      // Return default settings if none exist
      const defaultSettings = {
        openingHours: {
          monThu: "5:00 PM - 11:00 PM",
          friSat: "5:00 PM - 1:00 AM",
          sunday: "4:00 PM - 10:00 PM"
        }
      };
      return res.json(defaultSettings);
    }

    res.json(doc.data());
  } catch (error) {
    console.error("Get Settings Error:", error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update Kitchen Settings
// @route   PUT /api/settings
// @access  Private/Admin
export const updateSettings = async (req: Request, res: Response) => {
  try {
    const { openingHours } = req.body;

    await db.collection('settings').doc('restaurant').set({
      openingHours,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    res.json({ message: 'Settings updated successfully' });
  } catch (error) {
    console.error("Update Settings Error:", error);
    res.status(500).json({ message: 'Server error' });
  }
};
