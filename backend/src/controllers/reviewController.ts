import { Request, Response } from 'express';
import { db } from '../config/firebase';

// @desc    Add a new review
// @route   POST /api/reviews
// @access  Private
export const addReview = async (req: Request, res: Response) => {
  try {
    const { menuItemId, rating, comment } = req.body;
    const userId = (req as any).user?.id;
    const userName = (req as any).user?.name || "Verified Customer";

    if (!menuItemId || !rating) {
      return res.status(400).json({ message: 'Menu Item ID and rating are required' });
    }

    const review = {
      menuItemId,
      userId,
      userName,
      rating: Number(rating),
      comment: comment || "",
      createdAt: new Date().toISOString()
    };

    await db.collection('reviews').add(review);

    // Update the average rating on the menu item
    const reviewsSnapshot = await db.collection('reviews').where('menuItemId', '==', menuItemId).get();
    let totalRating = 0;
    reviewsSnapshot.forEach(doc => {
      totalRating += doc.data().rating;
    });
    const avgRating = totalRating / reviewsSnapshot.size;

    await db.collection('menu').doc(menuItemId).update({
      averageRating: avgRating,
      reviewsCount: reviewsSnapshot.size
    });

    res.status(201).json({ message: 'Review added successfully' });
  } catch (error) {
    console.error("Add Review Error:", error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get reviews for a menu item
// @route   GET /api/reviews/:menuItemId
// @access  Public
export const getReviews = async (req: Request, res: Response) => {
  try {
    const { menuItemId } = req.params;
    const snapshot = await db.collection('reviews')
      .where('menuItemId', '==', menuItemId)
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get();
      
    const reviews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(reviews);
  } catch (error) {
    console.error("Get Reviews Error:", error);
    res.status(500).json({ message: 'Server error' });
  }
};
