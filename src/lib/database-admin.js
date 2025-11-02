import { database } from './firebase-admin';

// Get user purchases from orders database
export async function getUserPurchasesAdmin(userId) {
  try {
    console.log('Fetching purchases for user:', userId);
    
    // Get all orders from Firebase Realtime Database
    const ordersRef = database.ref('orders');
    const snapshot = await ordersRef.once('value');
    
    if (!snapshot.exists()) {
      console.log('No orders found in database');
      return [];
    }
    
    const ordersData = snapshot.val();
    const userPurchases = [];
    
    // Filter orders by userId and extract product purchases
    Object.keys(ordersData).forEach(orderId => {
      const order = ordersData[orderId];
      
      // Check if this order belongs to the user and is successful
      if (order.userId === userId && order.paymentStatus?.toLowerCase() === 'success') {
        // Add each product from this order as a purchase
        if (order.products && Array.isArray(order.products)) {
          order.products.forEach(product => {
            userPurchases.push({
              orderId: orderId,
              productId: product.id,
              productName: product.name,
              downloadUrl: product.downloadUrl,
              status: 'completed', // Since payment is successful
              purchaseDate: order.paymentDate,
              price: product.price,
              quantity: product.quantity || 1
            });
          });
        }
      }
    });
    
    console.log(`Found ${userPurchases.length} purchases for user ${userId}`);
    return userPurchases;
    
  } catch (error) {
    console.error('Error fetching user purchases:', error);
    throw error;
  }
}
