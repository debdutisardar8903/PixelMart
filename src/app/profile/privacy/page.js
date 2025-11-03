'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/header/Header';
import Footer from '@/components/footer/Footer';
import BottomNav from '@/components/bottomnav/BottomNav';
import { useAuth } from '@/components/contexts/AuthContext';

function PrivacyCenterPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  // Privacy Center options
  const privacyOptions = [
    {
      id: 'privacy-policy',
      title: 'Privacy Policy',
      description: 'How we collect, use, and protect your personal information',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      color: 'from-blue-500 to-blue-600',
      content: `
        <h2 class="text-2xl font-bold mb-6">Privacy Policy</h2>
        <div class="space-y-6 text-gray-700">
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p class="text-sm text-blue-800"><strong>Effective Date:</strong> November 1, 2025</p>
            <p class="text-sm text-blue-800"><strong>Website:</strong> <a href="https://wallineex.store" class="underline hover:text-blue-900">https://wallineex.store</a></p>
          </div>
          
          <div class="text-center py-4">
            <p class="text-lg text-gray-800 font-medium">Welcome to Wallineex — your trusted digital product marketplace.</p>
          </div>
          
          <p class="text-gray-700 leading-relaxed">
            At Wallineex, accessible from <a href="https://wallineex.store" class="text-blue-600 underline hover:text-blue-800">https://wallineex.store</a>, we value your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and protect your data when you visit or make a purchase from our website.
          </p>
          
          <div class="space-y-6">
            <div>
              <h3 class="text-xl font-semibold text-gray-900 mb-3">1. Information We Collect</h3>
              <p class="mb-3">We may collect the following types of information when you interact with our website:</p>
              <ul class="list-disc pl-6 space-y-2">
                <li><strong>Personal Information:</strong> Name, email address, billing address, and phone number (for account setup or order confirmation).</li>
                <li><strong>Payment Information:</strong> Processed securely through trusted third-party payment gateways — we do not store or access your full card or UPI details.</li>
                <li><strong>Technical Data:</strong> IP address, browser type, device information, and usage activity to improve our website performance and security.</li>
              </ul>
            </div>
            
            <div>
              <h3 class="text-xl font-semibold text-gray-900 mb-3">2. How We Use Your Information</h3>
              <p class="mb-3">Your information is used for:</p>
              <ul class="list-disc pl-6 space-y-2">
                <li>Processing and completing your digital product purchases.</li>
                <li>Sending confirmation emails, receipts, or product access links.</li>
                <li>Providing customer support and resolving account issues.</li>
                <li>Improving website functionality and user experience.</li>
                <li>Ensuring fraud prevention and transaction security.</li>
              </ul>
            </div>
            
            <div>
              <h3 class="text-xl font-semibold text-gray-900 mb-3">3. Data Protection & Security</h3>
              <ul class="list-disc pl-6 space-y-2">
                <li>We use industry-standard security measures to protect your personal data from unauthorized access, alteration, or disclosure.</li>
                <li>All payments are processed using encrypted and verified payment systems.</li>
              </ul>
            </div>
            
            <div>
              <h3 class="text-xl font-semibold text-gray-900 mb-3">4. Cookies</h3>
              <p>Our website uses cookies to enhance your browsing experience and analyze website traffic. You can disable cookies in your browser settings, but some features of our site may not function properly without them.</p>
            </div>
            
            <div>
              <h3 class="text-xl font-semibold text-gray-900 mb-3">5. Data Sharing</h3>
              <p class="mb-3">We do not sell, trade, or rent your personal information to third parties.</p>
              <p class="mb-3">We may share minimal necessary data only with:</p>
              <ul class="list-disc pl-6 space-y-2">
                <li>Trusted payment processors.</li>
                <li>Hosting and security service providers.</li>
                <li>Legal authorities (only if required by law).</li>
              </ul>
            </div>
            
            <div>
              <h3 class="text-xl font-semibold text-gray-900 mb-3">6. Your Rights</h3>
              <p class="mb-3">You have the right to:</p>
              <ul class="list-disc pl-6 space-y-2">
                <li>Request access to your stored data.</li>
                <li>Request correction or deletion of your data.</li>
                <li>Withdraw consent for marketing communications at any time.</li>
              </ul>
              <p class="mt-3">To exercise your data rights, please contact us via our official support email provided below.</p>
            </div>
            
            <div>
              <h3 class="text-xl font-semibold text-gray-900 mb-3">7. No Refund Policy</h3>
              <p>As Wallineex sells digital products, once a purchase is completed, no refunds or cancellations are permitted. Please review product details carefully before purchase.</p>
            </div>
            
            <div>
              <h3 class="text-xl font-semibold text-gray-900 mb-3">8. Third-Party Links</h3>
              <p>Our website may contain links to other websites. We are not responsible for the privacy practices or content of those external sites.</p>
            </div>
            
            <div>
              <h3 class="text-xl font-semibold text-gray-900 mb-3">9. Updates to This Policy</h3>
              <p>Wallineex may update this Privacy Policy periodically. All updates will be posted on this page with a new effective date.</p>
            </div>
            
            <div class="bg-gray-50 border border-gray-200 rounded-lg p-6 mt-8">
              <h3 class="text-xl font-semibold text-gray-900 mb-4">📩 Contact Us</h3>
              <p class="mb-3">If you have any questions about this Privacy Policy or wish to exercise your privacy rights, please contact us:</p>
              <div class="space-y-2">
                <p><strong>Wallineex</strong></p>
                <p>🌐 <strong>Website:</strong> <a href="https://wallineex.store" class="text-blue-600 underline hover:text-blue-800">https://wallineex.store</a></p>
                <p>📧 <strong>Email:</strong> <a href="mailto:support@wallineex.store" class="text-blue-600 underline hover:text-blue-800">support@wallineex.store</a></p>
              </div>
            </div>
          </div>
        </div>
      `
    },
    {
      id: 'terms-conditions',
      title: 'Terms & Conditions',
      description: 'Terms of service and user agreement for using our platform',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: 'from-green-500 to-green-600',
      content: `
        <h2 class="text-2xl font-bold mb-6">Terms & Conditions</h2>
        <div class="space-y-6 text-gray-700">
          <div class="bg-green-50 border border-green-200 rounded-lg p-4">
            <p class="text-sm text-green-800"><strong>Effective Date:</strong> November 1, 2025</p>
            <p class="text-sm text-green-800"><strong>Website:</strong> <a href="https://wallineex.store" class="underline hover:text-green-900">https://wallineex.store</a></p>
          </div>
          
          <div class="text-center py-4">
            <p class="text-lg text-gray-800 font-medium">Welcome to Wallineex, a digital product marketplace operated through https://wallineex.store.</p>
          </div>
          
          <p class="text-gray-700 leading-relaxed">
            By accessing or making a purchase from our website, you agree to comply with and be bound by the following Terms & Conditions. Please read them carefully before using our services.
          </p>
          
          <div class="space-y-6">
            <div>
              <h3 class="text-xl font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h3>
              <p class="mb-3">By visiting or purchasing from Wallineex, you agree that you have read, understood, and accepted all the terms outlined here.</p>
              <p>If you do not agree with these terms, please do not use our website or make any purchase.</p>
            </div>
            
            <div>
              <h3 class="text-xl font-semibold text-gray-900 mb-3">2. Nature of Service</h3>
              <ul class="list-disc pl-6 space-y-2">
                <li>Wallineex provides digital products (such as downloadable files, online assets, or software).</li>
                <li>All products are delivered digitally, and no physical items will be shipped.</li>
              </ul>
            </div>
            
            <div>
              <h3 class="text-xl font-semibold text-gray-900 mb-3">3. Account Responsibility</h3>
              <ul class="list-disc pl-6 space-y-2">
                <li>You must provide accurate and complete information when creating an account or making a purchase.</li>
                <li>You are solely responsible for maintaining the confidentiality of your account credentials.</li>
                <li>Any unauthorized use of your account must be reported immediately to <a href="mailto:support@wallineex.store" class="text-blue-600 underline hover:text-blue-800">support@wallineex.store</a>.</li>
              </ul>
            </div>
            
            <div>
              <h3 class="text-xl font-semibold text-gray-900 mb-3">4. Pricing & Payment</h3>
              <ul class="list-disc pl-6 space-y-2">
                <li>All prices listed on Wallineex are in INR (₹) unless otherwise stated.</li>
                <li>Payments must be made using the payment methods provided on our website.</li>
                <li>We reserve the right to change prices at any time without prior notice.</li>
                <li>Orders are confirmed only after successful payment.</li>
              </ul>
            </div>
            
            <div>
              <h3 class="text-xl font-semibold text-gray-900 mb-3">5. Digital Product Delivery</h3>
              <ul class="list-disc pl-6 space-y-2">
                <li>Once payment is confirmed, the purchased digital product will be delivered instantly via download link or email.</li>
                <li>Ensure that your email address is correct at the time of purchase.</li>
                <li>If you experience issues accessing your purchased item, contact <a href="mailto:support@wallineex.store" class="text-blue-600 underline hover:text-blue-800">support@wallineex.store</a> within 24 hours.</li>
              </ul>
            </div>
            
            <div>
              <h3 class="text-xl font-semibold text-gray-900 mb-3">6. No Refund Policy</h3>
              <ul class="list-disc pl-6 space-y-2">
                <li>As Wallineex sells digital goods, all purchases are final and non-refundable.</li>
                <li>Once a product has been delivered or downloaded, no refund, replacement, or cancellation will be issued under any circumstances.</li>
                <li>Please review all product information carefully before making a purchase.</li>
              </ul>
            </div>
            
            <div>
              <h3 class="text-xl font-semibold text-gray-900 mb-3">7. Intellectual Property</h3>
              <ul class="list-disc pl-6 space-y-2">
                <li>All content, designs, digital products, and materials on Wallineex are protected by copyright and intellectual property laws.</li>
                <li>You may not resell, redistribute, modify, or reproduce any product or content purchased from our site without prior written permission.</li>
              </ul>
            </div>
            
            <div>
              <h3 class="text-xl font-semibold text-gray-900 mb-3">8. Prohibited Activities</h3>
              <p class="mb-3">You agree not to:</p>
              <ul class="list-disc pl-6 space-y-2">
                <li>Use the website for unlawful or fraudulent purposes.</li>
                <li>Attempt to gain unauthorized access to our systems or interfere with site operations.</li>
                <li>Copy, share, or distribute any digital product without authorization.</li>
              </ul>
              <p class="mt-3">Violation of these terms may result in legal action.</p>
            </div>
            
            <div>
              <h3 class="text-xl font-semibold text-gray-900 mb-3">9. Limitation of Liability</h3>
              <p class="mb-3">Wallineex and its owners will not be held responsible for any:</p>
              <ul class="list-disc pl-6 space-y-2">
                <li>Technical issues, interruptions, or loss of data.</li>
                <li>Errors in product content or third-party integrations.</li>
                <li>Damages arising from the use or inability to use our digital products.</li>
              </ul>
              <p class="mt-3">All services are provided "as is" without warranties of any kind.</p>
            </div>
            
            <div>
              <h3 class="text-xl font-semibold text-gray-900 mb-3">10. Modifications to Terms</h3>
              <ul class="list-disc pl-6 space-y-2">
                <li>Wallineex reserves the right to update or modify these Terms & Conditions at any time.</li>
                <li>All changes will take effect immediately upon posting on this page.</li>
                <li>You are encouraged to review this page periodically.</li>
              </ul>
            </div>
            
            <div>
              <h3 class="text-xl font-semibold text-gray-900 mb-3">11. Governing Law</h3>
              <ul class="list-disc pl-6 space-y-2">
                <li>These Terms & Conditions are governed by the laws of India.</li>
                <li>Any disputes shall be subject to the exclusive jurisdiction of the courts in Kolkata, West Bengal, India.</li>
              </ul>
            </div>
            
            <div class="bg-gray-50 border border-gray-200 rounded-lg p-6 mt-8">
              <h3 class="text-xl font-semibold text-gray-900 mb-4">📩 Contact Us</h3>
              <p class="mb-3">If you have questions regarding these Terms & Conditions, please contact us:</p>
              <div class="space-y-2">
                <p><strong>Wallineex</strong></p>
                <p>🌐 <strong>Website:</strong> <a href="https://wallineex.store" class="text-blue-600 underline hover:text-blue-800">https://wallineex.store</a></p>
                <p>📧 <strong>Email:</strong> <a href="mailto:support@wallineex.store" class="text-blue-600 underline hover:text-blue-800">support@wallineex.store</a></p>
              </div>
            </div>
          </div>
        </div>
      `
    },
    {
      id: 'refund-policy',
      title: 'Refund Policy',
      description: 'No refund policy for digital products',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
      color: 'from-red-500 to-red-600',
      content: `
        <h2 class="text-2xl font-bold mb-6">Refund Policy (No Refund Policy)</h2>
        <div class="space-y-6 text-gray-700">
          <div class="bg-red-50 border border-red-200 rounded-lg p-4">
            <p class="text-sm text-red-800"><strong>Effective Date:</strong> November 1, 2025</p>
            <p class="text-sm text-red-800"><strong>Website:</strong> <a href="https://wallineex.store" class="underline hover:text-red-900">https://wallineex.store</a></p>
          </div>
          
          <div class="text-center py-4">
            <p class="text-lg text-gray-800 font-medium">Thank you for shopping at Wallineex.</p>
          </div>
          
          <p class="text-gray-700 leading-relaxed">
            We specialize in digital products that are delivered instantly after successful payment. Please read this Refund Policy carefully before making a purchase.
          </p>
          
          <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 class="text-lg font-semibold text-red-800 mb-2">⚠️ Important Notice</h3>
            <p class="text-red-700 font-medium">All sales are final. We do not offer refunds for digital products.</p>
          </div>
          
          <div class="space-y-6">
            <div>
              <h3 class="text-xl font-semibold text-gray-900 mb-3">1. Digital Product Nature</h3>
              <ul class="list-disc pl-6 space-y-2">
                <li>All products available on Wallineex are digital downloads or digitally delivered goods.</li>
                <li>Once your purchase is completed and the product is made available to you (via download link or email), the sale is final and non-refundable.</li>
                <li>Digital products cannot be returned, revoked, or exchanged once accessed — hence, we do not offer refunds under any circumstances.</li>
              </ul>
            </div>
            
            <div>
              <h3 class="text-xl font-semibold text-gray-900 mb-3">2. No Refund Policy</h3>
              <p class="mb-3">By purchasing from Wallineex, you acknowledge and agree that:</p>
              <ul class="list-disc pl-6 space-y-2">
                <li><strong>All sales are final.</strong></li>
                <li><strong>No refunds, no exchanges, and no cancellations</strong> are permitted after purchase.</li>
                <li>You are responsible for ensuring that you have reviewed the product description and requirements before placing an order.</li>
              </ul>
            </div>
            
            <div>
              <h3 class="text-xl font-semibold text-gray-900 mb-3">3. Duplicate or Incorrect Transactions</h3>
              <ul class="list-disc pl-6 space-y-2">
                <li>If you believe you have been charged twice or made a duplicate payment, please contact our support team within 24 hours of purchase at <a href="mailto:support@wallineex.store" class="text-blue-600 underline hover:text-blue-800">support@wallineex.store</a>.</li>
                <li>We will review the transaction details and issue a refund only in cases of verified duplicate payments.</li>
              </ul>
            </div>
            
            <div>
              <h3 class="text-xl font-semibold text-gray-900 mb-3">4. Product Access Issues</h3>
              <p class="mb-3">If you experience technical issues accessing your purchased digital product (e.g., broken download link, delivery not received):</p>
              <ul class="list-disc pl-6 space-y-2">
                <li>Contact our support team immediately at <a href="mailto:support@wallineex.store" class="text-blue-600 underline hover:text-blue-800">support@wallineex.store</a>.</li>
                <li>We will verify your order and provide a new working link or access method as soon as possible.</li>
                <li>This does not qualify for a refund but ensures successful delivery of your purchase.</li>
              </ul>
            </div>
            
            <div>
              <h3 class="text-xl font-semibold text-gray-900 mb-3">5. Unauthorized Transactions</h3>
              <ul class="list-disc pl-6 space-y-2">
                <li>If you notice unauthorized activity on your payment method, please contact your bank or payment provider immediately.</li>
                <li>We are not responsible for purchases made without your consent but will cooperate fully in any investigation.</li>
              </ul>
            </div>
            
            <div>
              <h3 class="text-xl font-semibold text-gray-900 mb-3">6. Policy Agreement</h3>
              <ul class="list-disc pl-6 space-y-2">
                <li>By completing a purchase on <a href="https://wallineex.store" class="text-blue-600 underline hover:text-blue-800">https://wallineex.store</a>, you confirm that you have read and agreed to this No Refund Policy.</li>
                <li>Your continued use of our website signifies your acceptance of all our terms and policies.</li>
              </ul>
            </div>
            
            <div class="bg-gray-50 border border-gray-200 rounded-lg p-6 mt-8">
              <h3 class="text-xl font-semibold text-gray-900 mb-4">📩 Contact Us</h3>
              <p class="mb-3">For any concerns regarding your order, please contact:</p>
              <div class="space-y-2">
                <p><strong>Wallineex</strong></p>
                <p>🌐 <strong>Website:</strong> <a href="https://wallineex.store" class="text-blue-600 underline hover:text-blue-800">https://wallineex.store</a></p>
                <p>📧 <strong>Email:</strong> <a href="mailto:support@wallineex.store" class="text-blue-600 underline hover:text-blue-800">support@wallineex.store</a></p>
              </div>
            </div>
          </div>
        </div>
      `
    },
    {
      id: 'shipping-delivery',
      title: 'Shipping & Delivery Policy',
      description: 'Digital product delivery information',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      ),
      color: 'from-purple-500 to-purple-600',
      content: `
        <h2 class="text-2xl font-bold mb-6">Shipping & Delivery Policy (Digital Products)</h2>
        <div class="space-y-6 text-gray-700">
          <div class="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <p class="text-sm text-purple-800"><strong>Effective Date:</strong> November 1, 2025</p>
            <p class="text-sm text-purple-800"><strong>Website:</strong> <a href="https://wallineex.store" class="underline hover:text-purple-900">https://wallineex.store</a></p>
          </div>
          
          <div class="text-center py-4">
            <p class="text-lg text-gray-800 font-medium">Welcome to Wallineex — your trusted platform for digital products.</p>
          </div>
          
          <p class="text-gray-700 leading-relaxed">
            This Shipping & Delivery Policy explains how we process and deliver all digital purchases made through our website.
          </p>
          
          <div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <h3 class="text-lg font-semibold text-green-800 mb-2">📦 Instant Digital Delivery</h3>
            <p class="text-green-700 font-medium">All products are delivered digitally and instantly after successful payment.</p>
          </div>
          
          <div class="space-y-6">
            <div>
              <h3 class="text-xl font-semibold text-gray-900 mb-3">1. Digital Product Delivery</h3>
              <ul class="list-disc pl-6 space-y-2">
                <li>All products sold on Wallineex are digital goods.</li>
                <li>No physical shipping or postal delivery is involved.</li>
                <li>After successful payment, your digital product will be delivered instantly through:</li>
              </ul>
              <ul class="list-disc pl-12 space-y-2 mt-2">
                <li>A download link displayed on the order confirmation page, and/or</li>
                <li>A confirmation email containing your download link or product access details.</li>
              </ul>
              <p class="mt-3">If you do not receive your product within a few minutes after purchase, please check your email spam/junk folder or contact us directly.</p>
            </div>
            
            <div>
              <h3 class="text-xl font-semibold text-gray-900 mb-3">2. Order Processing Time</h3>
              <ul class="list-disc pl-6 space-y-2">
                <li>Orders are processed automatically once your payment is confirmed.</li>
                <li>In most cases, delivery is instant (within minutes).</li>
                <li>In rare cases, due to network delays or server verification, delivery may take up to 1–2 hours.</li>
              </ul>
            </div>
            
            <div>
              <h3 class="text-xl font-semibold text-gray-900 mb-3">3. Delivery Confirmation</h3>
              <p class="mb-3">Once your purchase is successfully processed, you will receive:</p>
              <ul class="list-disc pl-6 space-y-2">
                <li>An email confirmation with your order details.</li>
                <li>A download or access link to your digital product.</li>
              </ul>
              <p class="mt-3">Please ensure that the email address you provide during checkout is correct and accessible.</p>
            </div>
            
            <div>
              <h3 class="text-xl font-semibold text-gray-900 mb-3">4. Failed or Delayed Deliveries</h3>
              <p class="mb-3">If you face any issues such as:</p>
              <ul class="list-disc pl-6 space-y-2">
                <li>Product download link not received,</li>
                <li>Broken or expired link, or</li>
                <li>Access issues with your purchased item,</li>
              </ul>
              <p class="mt-3">Please contact our support team at <a href="mailto:support@wallineex.store" class="text-blue-600 underline hover:text-blue-800">support@wallineex.store</a> with your order number and payment details.</p>
              <p class="mt-2">We will verify your purchase and resend the digital product promptly.</p>
            </div>
            
            <div>
              <h3 class="text-xl font-semibold text-gray-900 mb-3">5. No Physical Shipping</h3>
              <p class="mb-3">Since Wallineex deals exclusively in digital products, we do not offer:</p>
              <ul class="list-disc pl-6 space-y-2">
                <li>Physical delivery,</li>
                <li>Postal shipping, or</li>
                <li>Cash-on-delivery (COD) options.</li>
              </ul>
              <p class="mt-3">All transactions and deliveries occur digitally through our website or via email.</p>
            </div>
            
            <div>
              <h3 class="text-xl font-semibold text-gray-900 mb-3">6. Responsibility After Delivery</h3>
              <p class="mb-3">Once the digital product has been successfully delivered to your email or account, Wallineex is not responsible for:</p>
              <ul class="list-disc pl-6 space-y-2">
                <li>Loss or deletion of the file by the user,</li>
                <li>Technical issues caused by the user's device,</li>
                <li>Misuse or unauthorized sharing of the purchased item.</li>
              </ul>
              <p class="mt-3">We recommend securely saving your digital file and backing it up for future access.</p>
            </div>
            
            <div class="bg-gray-50 border border-gray-200 rounded-lg p-6 mt-8">
              <h3 class="text-xl font-semibold text-gray-900 mb-4">📩 Contact Us</h3>
              <p class="mb-3">If you have any questions or need help with your delivery, please reach out to:</p>
              <div class="space-y-2">
                <p><strong>Wallineex</strong></p>
                <p>🌐 <strong>Website:</strong> <a href="https://wallineex.store" class="text-blue-600 underline hover:text-blue-800">https://wallineex.store</a></p>
                <p>📧 <strong>Email:</strong> <a href="mailto:support@wallineex.store" class="text-blue-600 underline hover:text-blue-800">support@wallineex.store</a></p>
              </div>
            </div>
          </div>
        </div>
      `
    },
    {
      id: 'cancellation-policy',
      title: 'Cancellation Policy',
      description: 'Order cancellation terms and conditions',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'from-orange-500 to-orange-600',
      content: `
        <h2 class="text-2xl font-bold mb-6">❌ Cancellation Policy</h2>
        <div class="space-y-6 text-gray-700">
          <div class="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p class="text-sm text-orange-800"><strong>Effective Date:</strong> November 1, 2025</p>
            <p class="text-sm text-orange-800"><strong>Website:</strong> <a href="https://wallineex.store" class="underline hover:text-orange-900">https://wallineex.store</a></p>
          </div>
          
          <div class="text-center py-4">
            <p class="text-lg text-gray-800 font-medium">Thank you for choosing Wallineex.</p>
          </div>
          
          <p class="text-gray-700 leading-relaxed">
            This Cancellation Policy outlines our rules regarding the cancellation of orders made through our website.
          </p>
          
          <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 class="text-lg font-semibold text-red-800 mb-2">⚠️ Important Notice</h3>
            <p class="text-red-700 font-medium">Order cancellations are not possible once payment is completed for digital products.</p>
          </div>
          
          <div class="space-y-6">
            <div>
              <h3 class="text-xl font-semibold text-gray-900 mb-3">1. Digital Product Orders</h3>
              <ul class="list-disc pl-6 space-y-2">
                <li>All products sold on Wallineex are digital products that are delivered instantly after payment.</li>
                <li>Since these products are downloadable or accessible immediately, order cancellations are not possible once payment is completed.</li>
                <li>Please review all product details carefully before finalizing your purchase.</li>
              </ul>
            </div>
            
            <div>
              <h3 class="text-xl font-semibold text-gray-900 mb-3">2. No Cancellation After Payment</h3>
              <p class="mb-3">Once an order has been successfully processed and the digital product has been made available for download or access, it cannot be canceled, refunded, or exchanged.</p>
              <p class="mb-3">This policy applies to:</p>
              <ul class="list-disc pl-6 space-y-2">
                <li>Accidental purchases</li>
                <li>Change of mind</li>
                <li>Wrong product selection</li>
                <li>Download or compatibility issues due to the user's device or internet</li>
              </ul>
            </div>
            
            <div>
              <h3 class="text-xl font-semibold text-gray-900 mb-3">3. Exceptions (Special Circumstances)</h3>
              <p class="mb-3">We may consider a cancellation request only in the following limited situations:</p>
              <ul class="list-disc pl-6 space-y-2">
                <li><strong>Duplicate Payment:</strong> You were charged twice for the same order.</li>
                <li><strong>Technical Error:</strong> Payment was made, but the product was not delivered within 24 hours.</li>
              </ul>
              <p class="mt-3">If your situation meets any of the above, please contact our support team immediately at <a href="mailto:support@wallineex.store" class="text-blue-600 underline hover:text-blue-800">support@wallineex.store</a> with your order ID, transaction details, and payment proof.</p>
            </div>
            
            <div>
              <h3 class="text-xl font-semibold text-gray-900 mb-3">4. Pre-Purchase Responsibility</h3>
              <p class="mb-3">Before placing any order, please ensure that:</p>
              <ul class="list-disc pl-6 space-y-2">
                <li>You have verified the product description and system requirements.</li>
                <li>You understand that all sales are final for digital items.</li>
                <li>You are using a valid and accessible email address to receive your product.</li>
              </ul>
            </div>
            
            <div class="bg-gray-50 border border-gray-200 rounded-lg p-6 mt-8">
              <h3 class="text-xl font-semibold text-gray-900 mb-4">📩 Contact Us</h3>
              <p class="mb-3">If you believe your cancellation request qualifies under the exception policy or if you have delivery issues, please contact our team:</p>
              <div class="space-y-2">
                <p><strong>Wallineex</strong></p>
                <p>🌐 <strong>Website:</strong> <a href="https://wallineex.store" class="text-blue-600 underline hover:text-blue-800">https://wallineex.store</a></p>
                <p>📧 <strong>Email:</strong> <a href="mailto:support@wallineex.store" class="text-blue-600 underline hover:text-blue-800">support@wallineex.store</a></p>
              </div>
            </div>
          </div>
        </div>
      `
    },
    {
      id: 'faq',
      title: 'FAQ',
      description: 'Frequently asked questions and answers',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'from-indigo-500 to-indigo-600',
      content: `
        <h2 class="text-2xl font-bold mb-6">💬 Frequently Asked Questions (FAQ)</h2>
        <div class="space-y-6 text-gray-700">
          <div class="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <p class="text-sm text-indigo-800"><strong>Effective Date:</strong> November 1, 2025</p>
            <p class="text-sm text-indigo-800"><strong>Website:</strong> <a href="https://wallineex.store" class="underline hover:text-indigo-900">https://wallineex.store</a></p>
          </div>
          
          <div class="text-center py-4">
            <p class="text-lg text-gray-800 font-medium">Welcome to the Wallineex FAQ section.</p>
          </div>
          
          <p class="text-gray-700 leading-relaxed">
            Below you'll find answers to the most common questions about our digital products, orders, delivery, and policies.
          </p>
          
          <div class="space-y-4" id="faq-accordion">
            <!-- FAQ items will be rendered by React component -->
          </div>
        </div>
      `
    }
  ];

  const handlePolicyClick = (policy) => {
    setSelectedPolicy(policy);
  };

  const handleBackToGrid = () => {
    setSelectedPolicy(null);
  };

  // Handle URL parameters to show specific sections
  useEffect(() => {
    const section = searchParams.get('section');
    if (section) {
      const policy = privacyOptions.find(option => option.id === section);
      if (policy) {
        setSelectedPolicy(policy);
      }
    }
  }, [searchParams]);

  // FAQ data
  const faqData = [
    {
      id: 'faq-1',
      question: '🛍️ 1. What type of products does Wallineex sell?',
      answer: 'Wallineex offers digital products that are delivered online — such as downloadable files, templates, digital assets, or software. No physical items are shipped.'
    },
    {
      id: 'faq-2',
      question: '⚡ 2. How will I receive my purchased product?',
      answer: (
        <div>
          <p className="mb-2">Once your payment is successfully processed, your digital product will be delivered instantly through:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>A download link displayed on your screen, and/or</li>
            <li>A confirmation email containing your access details.</li>
          </ul>
        </div>
      )
    },
    {
      id: 'faq-3',
      question: '⏱️ 3. How long does delivery take?',
      answer: (
        <ul className="list-disc pl-6 space-y-1">
          <li>Most orders are processed instantly after payment.</li>
          <li>In rare cases (due to network or payment gateway delays), delivery may take up to 1–2 hours.</li>
        </ul>
      )
    },
    {
      id: 'faq-4',
      question: '📧 4. I didn\'t receive my download link or product access. What should I do?',
      answer: (
        <ul className="list-disc pl-6 space-y-1">
          <li>Please check your spam/junk folder first.</li>
          <li>If you still haven't received it within 1–2 hours, contact our support team at <a href="mailto:support@wallineex.store" className="text-blue-600 underline hover:text-blue-800">support@wallineex.store</a> with your order number — we'll resend your product immediately.</li>
        </ul>
      )
    },
    {
      id: 'faq-5',
      question: '💰 5. Can I get a refund after purchase?',
      answer: (
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>No.</strong> Since all Wallineex products are digital downloads, once delivered, they cannot be refunded, replaced, or canceled.</li>
          <li>All sales are final as stated in our Refund Policy.</li>
        </ul>
      )
    },
    {
      id: 'faq-6',
      question: '🧾 6. Can I cancel my order after paying?',
      answer: (
        <ul className="list-disc pl-6 space-y-1">
          <li>Unfortunately, no cancellations are allowed once the payment is completed because delivery happens automatically.</li>
          <li>Please verify your product details before making any purchase.</li>
        </ul>
      )
    },
    {
      id: 'faq-7',
      question: '🔁 7. What if I was charged twice for the same order?',
      answer: (
        <ul className="list-disc pl-6 space-y-1">
          <li>If you notice a duplicate payment, contact <a href="mailto:support@wallineex.store" className="text-blue-600 underline hover:text-blue-800">support@wallineex.store</a> within 24 hours of purchase.</li>
          <li>After verification, we'll issue a refund for the duplicate charge only.</li>
        </ul>
      )
    },
    {
      id: 'faq-8',
      question: '🔒 8. Is my personal and payment information safe?',
      answer: (
        <ul className="list-disc pl-6 space-y-1">
          <li>Absolutely. We use secure, encrypted payment gateways and never store your full payment details.</li>
          <li>Your privacy and data protection are our top priorities — see our Privacy Policy for more info.</li>
        </ul>
      )
    },
    {
      id: 'faq-9',
      question: '🧠 9. Can I share or resell Wallineex products?',
      answer: (
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>No.</strong> All digital items are licensed for personal use only.</li>
          <li>Reselling, redistributing, or sharing our products without written permission is strictly prohibited.</li>
        </ul>
      )
    },
    {
      id: 'faq-10',
      question: '📩 10. How can I contact Wallineex support?',
      answer: (
        <div>
          <p className="mb-2">You can reach our team anytime via email:</p>
          <p className="mb-2">📧 <a href="mailto:support@wallineex.store" className="text-blue-600 underline hover:text-blue-800 font-medium">support@wallineex.store</a></p>
          <p>We aim to respond to all inquiries within 24 hours.</p>
        </div>
      )
    }
  ];

  const handleFAQToggle = (faqId) => {
    setExpandedFAQ(expandedFAQ === faqId ? null : faqId);
  };

  return (
    <div className="font-sans min-h-screen bg-white flex flex-col">
      <div className="hidden sm:block">
        <Header />
      </div>
      
      <div className="flex-1 pt-6 sm:pt-24 px-4">
        <div className="mx-auto max-w-6xl">
          {/* Back Button */}
          <div className="mb-4 sm:hidden">
            <button
              onClick={() => router.push('/profile')}
              className="flex items-center justify-center w-12 h-12 bg-gray-50 border-2 border-gray-300 rounded-full hover:bg-gray-100 transition-colors duration-200"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>

          {!selectedPolicy ? (
            <>
              {/* Page Header */}
              <div className="mb-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Privacy Center</h1>
                    <p className="text-sm text-gray-600">
                      Access our policies, terms, and frequently asked questions
                    </p>
                  </div>
                  
                  {/* Desktop Back Button */}
                  <div className="hidden sm:block">
                    <Link
                      href="/profile"
                      className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Back to Profile
                    </Link>
                  </div>
                </div>
              </div>

              {/* Privacy Options Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {privacyOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handlePolicyClick(option)}
                    className="group bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-gray-300 transition-all duration-300 text-left"
                  >
                    <div className={`w-16 h-16 bg-gradient-to-r ${option.color} rounded-lg flex items-center justify-center text-white mb-4 group-hover:scale-105 transition-transform duration-300`}>
                      {option.icon}
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors duration-200">
                      {option.title}
                    </h3>
                    
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {option.description}
                    </p>
                    
                    <div className="mt-4 flex items-center text-sm text-gray-500 group-hover:text-gray-700 transition-colors duration-200">
                      <span>Read more</span>
                      <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            </>
          ) : (
            /* Policy Detail View */
            <div className="max-w-4xl mx-auto">
              {/* Back to Grid Button */}
              <div className="mb-6">
                <button
                  onClick={handleBackToGrid}
                  className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Privacy Center
                </button>
              </div>

              {/* Policy Content */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                {selectedPolicy.id === 'faq' ? (
                  /* FAQ Dropdown Component */
                  <div>
                    <h2 className="text-2xl font-bold mb-6">💬 Frequently Asked Questions (FAQ)</h2>
                    <div className="space-y-6 text-gray-700">
                      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                        <p className="text-sm text-indigo-800"><strong>Effective Date:</strong> November 1, 2025</p>
                        <p className="text-sm text-indigo-800"><strong>Website:</strong> <a href="https://wallineex.store" className="underline hover:text-indigo-900">https://wallineex.store</a></p>
                      </div>
                      
                      <div className="text-center py-4">
                        <p className="text-lg text-gray-800 font-medium">Welcome to the Wallineex FAQ section.</p>
                      </div>
                      
                      <p className="text-gray-700 leading-relaxed">
                        Below you'll find answers to the most common questions about our digital products, orders, delivery, and policies.
                      </p>
                      
                      <div className="space-y-4">
                        {faqData.map((faq) => (
                          <div key={faq.id} className="border border-gray-200 rounded-lg overflow-hidden">
                            <button 
                              onClick={() => handleFAQToggle(faq.id)}
                              className="w-full px-6 py-4 text-left bg-white hover:bg-gray-50 transition-colors duration-200 flex items-center justify-between"
                            >
                              <h3 className="text-lg font-semibold text-gray-900">{faq.question}</h3>
                              <svg 
                                className={`w-5 h-5 text-gray-500 transform transition-transform duration-200 ${
                                  expandedFAQ === faq.id ? 'rotate-180' : ''
                                }`}
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                              </svg>
                            </button>
                            {expandedFAQ === faq.id && (
                              <div className="px-6 py-4 bg-indigo-50/30 border-t border-gray-200">
                                <div className="text-gray-700">
                                  {typeof faq.answer === 'string' ? faq.answer : faq.answer}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Regular Policy Content */
                  <div 
                    className="prose prose-lg max-w-none"
                    dangerouslySetInnerHTML={{ __html: selectedPolicy.content }}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer - Always at bottom */}
      <div className="mt-16">
        <Footer />
      </div>
      
      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}

// Loading component for Suspense fallback
function PrivacyCenterPageLoading() {
  return (
    <div className="font-sans min-h-screen bg-white flex flex-col">
      <div className="hidden sm:block">
        <Header />
      </div>
      
      <div className="flex-1 pt-6 sm:pt-24 px-4">
        <div className="mx-auto max-w-6xl">
          {/* Back Button - Mobile Only */}
          <div className="mb-4 sm:hidden">
            <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
          </div>

          {/* Page Header Loading */}
          <div className="mb-8 text-center">
            <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto animate-pulse"></div>
          </div>

          {/* Privacy Options Grid Loading */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                <div className="h-16 bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-16">
        <Footer />
      </div>
      <BottomNav />
    </div>
  );
}

export default function PrivacyCenterPage() {
  return (
    <Suspense fallback={<PrivacyCenterPageLoading />}>
      <PrivacyCenterPageContent />
    </Suspense>
  );
}
