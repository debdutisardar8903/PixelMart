'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { ref, get } from 'firebase/database';
import { database } from '@/lib/firebase';
import { useAuth } from '@/components/contexts/AuthContext';

export default function InvoicePage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading: authLoading } = useAuth();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const invoiceRef = useRef(null);

  // Fetch specific order from database for invoice
  useEffect(() => {
    const fetchOrderForInvoice = async () => {
      try {
        setIsLoading(true);
        setError('');
        
        // Only fetch order if user is authenticated (as per database rules)
        if (!user) {
          setError('Authentication required');
          setIsLoading(false);
          return;
        }

        if (!params.id) {
          setError('Order ID not provided');
          setIsLoading(false);
          return;
        }

        console.log('Fetching order for invoice:', params.id);
        
        // Fetch specific order from database
        const orderRef = ref(database, `orders/${params.id}`);
        const snapshot = await get(orderRef);
        
        if (snapshot.exists()) {
          const orderData = snapshot.val();
          
          // Verify that this order belongs to the current user
          if (orderData.userId !== user.uid) {
            setError('Unauthorized access to this order');
            setOrder(null);
          } else {
            // Only show invoice for successful orders
            if (orderData.paymentStatus?.toLowerCase() !== 'success') {
              setError('Invoice is only available for completed orders');
              setOrder(null);
            } else {
              const orderWithId = {
                id: params.id,
                ...orderData
              };
              setOrder(orderWithId);
              console.log('Order for invoice fetched:', orderWithId);
            }
          }
        } else {
          console.log('Order not found in database');
          setError('Order not found');
          setOrder(null);
        }
      } catch (error) {
        console.error('Error fetching order for invoice:', error);
        setError('Failed to load order for invoice');
        setOrder(null);
      } finally {
        setIsLoading(false);
      }
    };

    // Don't fetch if auth is still loading
    if (!authLoading) {
      fetchOrderForInvoice();
    }
  }, [user, authLoading, params.id]);

  // Removed auto-download functionality - user will manually trigger download

  // Format date for display
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Generate invoice number from order ID
  const generateInvoiceNumber = (orderId) => {
    return `INV-${orderId}`;
  };

  // Calculate totals
  const calculateTotals = () => {
    if (!order?.products) return { subtotal: 0, discount: 0, total: 0 };
    
    const subtotal = order.products.reduce((sum, product) => 
      sum + ((product.price || 0) * (product.quantity || 1)), 0
    );
    
    const discount = order.couponUsed?.discount || 0;
    const total = order.totalAmount || subtotal - discount;
    
    return { subtotal, discount, total };
  };

  // Handle invoice download as PDF
  const handleDownloadInvoice = () => {
    if (typeof window !== 'undefined') {
      // Get the invoice HTML content
      const invoiceContent = invoiceRef.current?.innerHTML || '';
      
      // Create a new window for PDF generation
      const pdfWindow = window.open('', '_blank');
      
      if (pdfWindow) {
        // Create the PDF document with same styling
        pdfWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Invoice - ${generateInvoiceNumber(order?.id)}</title>
              <meta charset="utf-8">
              <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { 
                  font-family: Arial, sans-serif; 
                  line-height: 1.6; 
                  color: #333; 
                  background: white;
                  padding: 20px;
                }
                .invoice-container { 
                  max-width: 800px; 
                  margin: 0 auto; 
                  background: white;
                  border: 2px solid #6b7280;
                  padding: 48px;
                }
                
                /* Header Styles */
                .flex { display: flex; }
                .justify-between { justify-content: space-between; }
                .items-start { align-items: flex-start; }
                .mb-10 { margin-bottom: 40px; }
                .pb-6 { padding-bottom: 24px; }
                .border-b { border-bottom: 1px solid #111827; }
                .mb-3 { margin-bottom: 12px; }
                .mr-3 { margin-right: 12px; }
                .text-2xl { font-size: 24px; }
                .text-5xl { font-size: 48px; }
                .font-bold { font-weight: bold; }
                .text-gray-900 { color: #111827; }
                .text-gray-700 { color: #374151; }
                .text-gray-600 { color: #4b5563; }
                .font-medium { font-weight: 500; }
                .text-sm { font-size: 14px; }
                .text-lg { font-size: 18px; }
                .text-right { text-align: right; }
                .bg-gray-900 { background-color: #111827; }
                .text-white { color: white; }
                .px-4 { padding-left: 16px; padding-right: 16px; }
                .py-2 { padding-top: 8px; padding-bottom: 8px; }
                .inline-block { display: inline-block; }
                
                /* Grid Styles */
                .grid { display: grid; }
                .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
                .gap-12 { gap: 48px; }
                .mb-4 { margin-bottom: 16px; }
                .border-gray-300 { border-color: #d1d5db; }
                .pb-2 { padding-bottom: 8px; }
                .space-y-2 > * + * { margin-top: 8px; }
                .space-y-3 > * + * { margin-top: 12px; }
                
                /* Table Styles */
                .w-full { width: 100%; }
                .border-collapse { border-collapse: collapse; }
                .border-2 { border-width: 2px; }
                .border-gray-900 { border-color: #111827; }
                .bg-gray-500 { background-color: #6b7280; }
                .border { border-width: 1px; }
                .px-4 { padding-left: 16px; padding-right: 16px; }
                .py-3 { padding-top: 12px; padding-bottom: 12px; }
                .py-4 { padding-top: 16px; padding-bottom: 16px; }
                .text-left { text-align: left; }
                .text-center { text-align: center; }
                .border-b { border-bottom-width: 1px; }
                
                /* Footer Styles */
                .border-t-2 { border-top-width: 2px; }
                .pt-6 { padding-top: 24px; }
                .mt-8 { margin-top: 32px; }
                .mb-6 { margin-bottom: 24px; }
                .text-xl { font-size: 20px; }
                .bg-gray-100 { background-color: #f3f4f6; }
                .p-4 { padding: 16px; }
                .space-y-1 > * + * { margin-top: 4px; }
                
                @media (min-width: 768px) {
                  .grid-cols-1 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
                }
                
                @media print {
                  body { margin: 0; padding: 0; }
                  .no-print { display: none !important; }
                }
              </style>
            </head>
            <body>
              <div class="invoice-container">
                ${invoiceContent}
              </div>
              <script>
                window.onload = function() {
                  // Automatically trigger download as PDF
                  setTimeout(function() {
                    window.print();
                  }, 500);
                };
              </script>
            </body>
          </html>
        `);
        
        pdfWindow.document.close();
      }
    }
  };

  // Loading state
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading invoice...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !order) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Invoice Not Available</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/orders')}
            className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 font-medium"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  const totals = calculateTotals();

  return (
    <div className="min-h-screen bg-white py-4 sm:py-8">
      <div className="max-w-4xl mx-auto px-2 sm:px-4">
        {/* Action Buttons */}
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 no-print">
          <button
            onClick={() => router.push(`/orders/${order.id}`)}
            className="flex items-center justify-center sm:justify-start px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 text-sm sm:text-base"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Order
          </button>
          <button
            onClick={handleDownloadInvoice}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 font-medium flex items-center justify-center text-sm sm:text-base"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-4-4m4 4l4-4m-4-4V3" />
            </svg>
            Download PDF
          </button>
        </div>

        {/* Invoice Content */}
        <div ref={invoiceRef} className="invoice-container bg-white border-2 border-gray-300 p-4 sm:p-8 md:p-12">
          {/* Invoice Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6 sm:mb-10 pb-4 sm:pb-6 border-b border-gray-900">
            <div className="company-info mb-4 sm:mb-0">
              <div className="flex items-center mb-3">
                <Image
                  src="/next.svg"
                  alt="Wallineex"
                  width={100}
                  height={32}
                  className="mr-2 sm:mr-3 sm:w-[120px] sm:h-[40px]"
                />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">WALLINEEX STORE</h1>
              <p className="text-gray-700 font-medium text-sm sm:text-base">Digital Products & Services</p>
              <p className="text-gray-600 text-xs sm:text-sm">Email: wallineex@gmail.com</p>
              <p className="text-gray-600 text-xs sm:text-sm">Website: wallineex.com</p>
            </div>
            <div className="text-left sm:text-right">
              <h2 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-2 sm:mb-3">INVOICE</h2>
              <div className="bg-gray-900 text-white px-3 py-1 sm:px-4 sm:py-2 inline-block">
                <p className="text-sm sm:text-lg font-bold">{generateInvoiceNumber(order.id)}</p>
              </div>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-12 mb-6 sm:mb-8 md:mb-10">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 border-b border-gray-300 pb-2">BILL TO:</h3>
              <div className="space-y-2">
                <p className="font-bold text-gray-900 text-base sm:text-lg">{order.customerInfo?.name}</p>
                <p className="text-gray-700 text-sm sm:text-base">{order.customerInfo?.email}</p>
                <p className="text-gray-700 text-sm sm:text-base">{order.customerInfo?.phone}</p>
              </div>
            </div>
            <div className="mt-4 md:mt-0">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 border-b border-gray-300 pb-2">INVOICE DETAILS:</h3>
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:justify-between">
                  <span className="text-gray-700 font-medium text-sm sm:text-base">Invoice Date:</span>
                  <span className="font-bold text-gray-900 text-sm sm:text-base">{formatDate(order.paymentDate)}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between">
                  <span className="text-gray-700 font-medium text-sm sm:text-base">Order ID:</span>
                  <span className="font-bold text-gray-900 text-sm sm:text-base break-all">{order.orderId || order.id}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                  <span className="text-gray-700 font-medium text-sm sm:text-base">Payment Status:</span>
                  <span className="bg-gray-900 text-white px-2 py-1 text-xs sm:text-sm font-bold inline-block mt-1 sm:mt-0">PAID</span>
                </div>
              </div>
            </div>
          </div>

          {/* Products Table */}
          <div className="mb-6 sm:mb-8 md:mb-10">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 border-b border-gray-300 pb-2">ITEMS</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border-2 border-gray-900 min-w-[500px]">
                <thead>
                  <tr className="bg-gray-500 text-white">
                    <th className="border border-gray-900 px-2 sm:px-4 py-2 sm:py-3 text-left font-bold text-xs sm:text-sm">DESCRIPTION</th>
                    <th className="border border-gray-900 px-2 sm:px-4 py-2 sm:py-3 text-center font-bold text-xs sm:text-sm">QTY</th>
                    <th className="border border-gray-900 px-2 sm:px-4 py-2 sm:py-3 text-right font-bold text-xs sm:text-sm">UNIT PRICE</th>
                    <th className="border border-gray-900 px-2 sm:px-4 py-2 sm:py-3 text-right font-bold text-xs sm:text-sm">TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  {order.products?.map((product, index) => (
                    <tr key={index} className="border-b border-gray-300">
                      <td className="border border-gray-300 px-2 sm:px-4 py-3 sm:py-4">
                        <div className="font-bold text-gray-900 text-sm sm:text-base">{product.name}</div>
                        <div className="text-xs sm:text-sm text-gray-600">Digital Product</div>
                      </td>
                      <td className="border border-gray-300 px-2 sm:px-4 py-3 sm:py-4 text-center font-bold text-sm sm:text-base">{product.quantity || 1}</td>
                      <td className="border border-gray-300 px-2 sm:px-4 py-3 sm:py-4 text-right font-bold text-sm sm:text-base">₹{product.price?.toLocaleString()}</td>
                      <td className="border border-gray-300 px-2 sm:px-4 py-3 sm:py-4 text-right font-bold text-gray-900 text-sm sm:text-base">₹{((product.price || 0) * (product.quantity || 1)).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>


          {/* Footer */}
          <div className="border-t-2 border-gray-900 pt-4 sm:pt-6 mt-6 sm:mt-8">
            <div className="text-center mb-4 sm:mb-6">
              <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">THANK YOU FOR YOUR BUSINESS!</h4>
              <p className="text-gray-700 font-medium text-sm sm:text-base">We appreciate your trust in Wallineex Store</p>
            </div>
            <div className="bg-gray-100 p-3 sm:p-4 text-center">
              <div className="text-xs sm:text-sm text-gray-700 space-y-1">
                <p className="font-bold">This is a computer-generated invoice. No signature required.</p>
                <p>For support and queries, contact us at <span className="font-bold text-gray-900">wallineex@gmail.com</span></p>
                <p className="font-bold text-gray-900">WALLINEEX STORE - YOUR DIGITAL PRODUCTS PARTNER</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
