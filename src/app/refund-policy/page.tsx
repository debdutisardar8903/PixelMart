'use client';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Refund Policy
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            We want you to be completely satisfied with your purchase. Here's our refund policy.
          </p>
          <p className="text-sm text-gray-500 mt-4">Last updated: January 2024</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto prose prose-gray max-w-none">
          <div className="space-y-8">
            
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Digital Product Policy</h2>
              <div className="text-gray-600 space-y-4">
                <p>Due to the digital nature of our products, all sales are generally final once the download has been accessed. However, we understand that sometimes issues may arise, and we're committed to resolving them fairly.</p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Eligible Refund Scenarios</h2>
              <div className="text-gray-600 space-y-4">
                <p>We may consider refunds in the following situations:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Technical Issues:</strong> If you're unable to download or access your purchased product due to technical problems on our end</li>
                  <li><strong>Duplicate Purchase:</strong> If you accidentally purchased the same product multiple times</li>
                  <li><strong>Significant Product Defects:</strong> If the product has major flaws that make it unusable for its intended purpose</li>
                  <li><strong>Misrepresentation:</strong> If the product significantly differs from its description or preview</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Refund Request Process</h2>
              <div className="text-gray-600 space-y-4">
                <p>To request a refund, please follow these steps:</p>
                <ol className="list-decimal pl-6 space-y-2">
                  <li>Contact our support team at <strong>support@wallineex.com</strong> within 7 days of purchase</li>
                  <li>Include your order number and detailed reason for the refund request</li>
                  <li>Provide screenshots or evidence if applicable</li>
                  <li>Our team will review your request within 2-3 business days</li>
                  <li>If approved, refunds will be processed within 5-7 business days</li>
                </ol>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Non-Refundable Situations</h2>
              <div className="text-gray-600 space-y-4">
                <p>Refunds will not be provided in the following cases:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Change of mind after successful download</li>
                  <li>Lack of technical skills to use the product</li>
                  <li>Compatibility issues with your specific software or system</li>
                  <li>Requests made more than 7 days after purchase</li>
                  <li>Products that have been modified or customized</li>
                  <li>Violation of license terms or unauthorized distribution</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Refund Methods</h2>
              <div className="text-gray-600 space-y-4">
                <p>Approved refunds will be processed using the same payment method used for the original purchase:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Credit/Debit Cards:</strong> 5-7 business days</li>
                  <li><strong>Digital Wallets:</strong> 3-5 business days</li>
                  <li><strong>Bank Transfers:</strong> 7-10 business days</li>
                </ul>
                <p>Processing times may vary depending on your bank or payment provider.</p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Partial Refunds</h2>
              <div className="text-gray-600 space-y-4">
                <p>In some cases, we may offer partial refunds:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>When only part of a bundle product has issues</li>
                  <li>For products that are partially usable despite minor defects</li>
                  <li>As a goodwill gesture for customer satisfaction</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Alternative Solutions</h2>
              <div className="text-gray-600 space-y-4">
                <p>Before requesting a refund, consider these alternatives:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Technical Support:</strong> Our team can help resolve download or usage issues</li>
                  <li><strong>Product Exchange:</strong> We may offer a different product of equal value</li>
                  <li><strong>Store Credit:</strong> Credit for future purchases on Wallineex</li>
                  <li><strong>Extended Support:</strong> Additional help with product implementation</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Subscription Services</h2>
              <div className="text-gray-600 space-y-4">
                <p>For subscription-based services (if applicable):</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>You can cancel your subscription at any time</li>
                  <li>Cancellation takes effect at the end of the current billing period</li>
                  <li>No refunds for partial subscription periods</li>
                  <li>Access continues until the subscription expires</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Chargeback Policy</h2>
              <div className="text-gray-600 space-y-4">
                <p>If you initiate a chargeback without first contacting us:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Your account may be suspended pending resolution</li>
                  <li>Access to purchased products may be revoked</li>
                  <li>We will provide evidence of legitimate transaction to your bank</li>
                  <li>Please contact us first to resolve any issues amicably</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Contact for Refunds</h2>
              <div className="text-gray-600 space-y-4">
                <p>For refund requests or questions about this policy:</p>
                <div className="bg-gray-50 rounded-lg p-6 mt-4">
                  <p><strong>Email:</strong> support@wallineex.com</p>
                  <p><strong>Subject Line:</strong> Refund Request - Order #[Your Order Number]</p>
                  <p><strong>Response Time:</strong> Within 24-48 hours</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Policy Updates</h2>
              <div className="text-gray-600 space-y-4">
                <p>We may update this refund policy from time to time. Changes will be posted on this page with an updated revision date. Continued use of our services after changes constitutes acceptance of the new policy.</p>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-6 mt-8">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Need Help?</h3>
              <p className="text-blue-800">
                Before requesting a refund, please contact our support team. We're here to help resolve any issues 
                and ensure you have a great experience with our products.
              </p>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
