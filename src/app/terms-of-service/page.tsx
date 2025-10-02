'use client';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Terms of Service
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Please read these terms carefully before using our services.
          </p>
          <p className="text-sm text-gray-500 mt-4">Last updated: January 2024</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto prose prose-gray max-w-none">
          <div className="space-y-8">
            
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <div className="text-gray-600 space-y-4">
                <p>By accessing and using Wallineex, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.</p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Description of Service</h2>
              <div className="text-gray-600 space-y-4">
                <p>Wallineex is a digital marketplace that provides:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Digital products including templates, graphics, and design assets</li>
                  <li>Secure payment processing and instant downloads</li>
                  <li>Customer support and account management</li>
                  <li>Regular updates and new product releases</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Accounts</h2>
              <div className="text-gray-600 space-y-4">
                <p>To access certain features, you must create an account. You agree to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide accurate and complete information</li>
                  <li>Maintain the security of your password</li>
                  <li>Accept responsibility for all activities under your account</li>
                  <li>Notify us immediately of unauthorized use</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Purchases and Payments</h2>
              <div className="text-gray-600 space-y-4">
                <p>When making purchases on Wallineex:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>All prices are in Indian Rupees (INR) unless otherwise stated</li>
                  <li>Payment is required before product delivery</li>
                  <li>We accept major credit cards and digital payment methods</li>
                  <li>You will receive a receipt and download links via email</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. License and Usage Rights</h2>
              <div className="text-gray-600 space-y-4">
                <p>Upon purchase, you receive a license to use the digital products according to the following terms:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Personal Use:</strong> Use for personal, non-commercial projects</li>
                  <li><strong>Commercial Use:</strong> Use in commercial projects with proper attribution</li>
                  <li><strong>Restrictions:</strong> No redistribution, resale, or sharing of original files</li>
                  <li><strong>Modifications:</strong> You may modify products for your own use</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Prohibited Uses</h2>
              <div className="text-gray-600 space-y-4">
                <p>You may not use our service:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>For any unlawful purpose or to solicit others to unlawful acts</li>
                  <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
                  <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
                  <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
                  <li>To submit false or misleading information</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Intellectual Property</h2>
              <div className="text-gray-600 space-y-4">
                <p>The service and its original content, features, and functionality are and will remain the exclusive property of Wallineex and its licensors. The service is protected by copyright, trademark, and other laws.</p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Refunds and Returns</h2>
              <div className="text-gray-600 space-y-4">
                <p>Due to the digital nature of our products:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>All sales are final once the download link is accessed</li>
                  <li>Refunds may be considered for technical issues preventing download</li>
                  <li>Refund requests must be made within 7 days of purchase</li>
                  <li>See our Refund Policy for detailed information</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Disclaimer</h2>
              <div className="text-gray-600 space-y-4">
                <p>The information on this website is provided on an "as is" basis. To the fullest extent permitted by law, this Company:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Excludes all representations and warranties relating to this website and its contents</li>
                  <li>Does not guarantee the accuracy, completeness, or timeliness of information</li>
                  <li>Makes no warranties about the availability or functionality of the service</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Limitation of Liability</h2>
              <div className="text-gray-600 space-y-4">
                <p>In no event shall Wallineex, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.</p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Termination</h2>
              <div className="text-gray-600 space-y-4">
                <p>We may terminate or suspend your account and bar access to the service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.</p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Changes to Terms</h2>
              <div className="text-gray-600 space-y-4">
                <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect.</p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Contact Information</h2>
              <div className="text-gray-600 space-y-4">
                <p>If you have any questions about these Terms of Service, please contact us:</p>
                <div className="bg-gray-50 rounded-lg p-6 mt-4">
                  <p><strong>Email:</strong> legal@wallineex.com</p>
                  <p><strong>Address:</strong> Wallineex Legal Team, Mumbai, Maharashtra, India</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
