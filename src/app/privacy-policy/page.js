'use client';

import { useRouter } from 'next/navigation';

export default function PrivacyPolicyPage() {
  const router = useRouter();

  return (
    <div className="font-sans min-h-screen bg-white pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Privacy Policy
          </h1>
          
          {/* Who We Are */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Who We Are</h2>
            <p className="text-gray-700 mb-2">
              Our website address is: <a href="https://wallineex.store" className="text-blue-600 hover:text-blue-800">https://wallineex.store</a>
            </p>
            <p className="text-gray-700">
              Thank you for visiting Wallineex. We provide digital products, design tools, and creative resources. Please read this Privacy Policy carefully and provide your consent before using our services.
            </p>
          </div>
        </div>

        {/* Privacy Policy Content */}
        <div className="prose prose-lg max-w-none">
          
          {/* Section 1 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. What Personal Data We Collect and Why We Collect It</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Comments</h3>
            <p className="text-gray-700 mb-4">
              When visitors leave comments on the site, we collect the data shown in the comments form, as well as the visitor's IP address and browser user agent string to help detect spam.
            </p>
            <p className="text-gray-700 mb-4">
              An anonymized string created from your email address (a hash) may be provided to the Gravatar service to see if you are using it. 
              The Gravatar service privacy policy is available here: <a href="https://automattic.com/privacy/" className="text-blue-600 hover:text-blue-800">https://automattic.com/privacy/</a>.
            </p>
            <p className="text-gray-700">
              After approval of your comment, your profile picture is visible to the public in the context of your comment.
            </p>
          </section>

          {/* Section 2 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Collection of Information</h2>
            <p className="text-gray-700 mb-4">
              The information collected by Wallineex may include Personal Information and Non-Personal Information.
            </p>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Personal Information</h3>
            <p className="text-gray-700 mb-2">This may include, but is not limited to:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-1 mb-4">
              <li>Your username and password</li>
              <li>Your full name</li>
              <li>Address and contact details</li>
              <li>Telephone number</li>
              <li>Email address</li>
              <li>Date of birth and gender</li>
              <li>Transaction information (purchase or sales history)</li>
              <li>Financial information such as bank or card details, UPI, or payment gateway data</li>
              <li>IP address and device identification</li>
              <li>Any additional information you provide during registration or checkout</li>
            </ul>
            
            <p className="text-gray-700 mb-2">Personal information may be collected when:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-1 mb-4">
              <li>You register an account on the website</li>
              <li>Make a purchase</li>
              <li>Contact customer support</li>
              <li>Participate in surveys or promotions</li>
              <li>Post reviews or comments</li>
            </ul>
            <p className="text-gray-700 mb-4">
              We may also receive information from third parties, including social media platforms or other business partners.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">Non-Personal Information</h3>
            <p className="text-gray-700 mb-2">Our website may automatically collect certain non-identifiable data, such as:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-1 mb-4">
              <li>Browser type and version</li>
              <li>Operating system</li>
              <li>Internet service provider</li>
              <li>Geographic location</li>
              <li>Referring website</li>
              <li>Date and time of access</li>
              <li>Duration of site visit</li>
            </ul>
            <p className="text-gray-700">
              This information helps us analyze user behavior, manage the website, and improve user experience.
            </p>
          </section>

          {/* Section 3 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Purpose of Collecting Personal Information</h2>
            <p className="text-gray-700 mb-2">Your personal data may be used for the following purposes:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-1 mb-4">
              <li>To provide and improve our website and services</li>
              <li>To personalize your user experience</li>
              <li>To process orders and payments securely</li>
              <li>To respond to customer inquiries and provide support</li>
              <li>To send updates, newsletters, or promotional offers (with your consent)</li>
              <li>To communicate important policy changes or updates</li>
              <li>To verify identity and prevent fraud</li>
              <li>To comply with legal obligations and enforce our policies</li>
            </ul>
            <p className="text-gray-700">
              Your information will always be kept confidential and used only as outlined in this policy.
            </p>
          </section>

          {/* Section 4 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Media</h2>
            <p className="text-gray-700">
              If you upload images to our website, please avoid uploading images with embedded location data (EXIF GPS). Visitors may be able to extract such information from images.
            </p>
          </section>

          {/* Section 5 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Cookies</h2>
            <p className="text-gray-700 mb-4">
              When you leave a comment on our site, you may opt-in to saving your name, email, and website in cookies. These cookies last for one year for your convenience.
            </p>
            <p className="text-gray-700 mb-4">
              If you log in to your account, temporary cookies may be set to verify browser compatibility. Login cookies last two days, and display preference cookies last one year. If you choose "Remember Me", your login will persist for two weeks.
            </p>
            <p className="text-gray-700">
              If you edit or publish an article, an additional cookie will be saved in your browser, which expires after one day.
            </p>
          </section>

          {/* Section 6 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Embedded Content from Other Websites</h2>
            <p className="text-gray-700 mb-4">
              Articles on this site may include embedded content (e.g., videos, images, or other media). Embedded content behaves exactly as if the visitor has visited the originating website.
            </p>
            <p className="text-gray-700">
              These websites may collect data about you, use cookies, or track your interaction with the embedded content if you are logged in to their platform.
            </p>
          </section>

          {/* Section 7 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. How Long We Retain Your Data</h2>
            <p className="text-gray-700 mb-4">
              If you leave a comment, the comment and its metadata are retained indefinitely for moderation and spam prevention.
            </p>
            <p className="text-gray-700">
              For registered users, we store the personal information provided in their profile. All users can view, edit, or delete their personal information at any time (except usernames). Website administrators can also access and edit this data.
            </p>
          </section>

          {/* Section 8 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. What Rights You Have Over Your Data</h2>
            <p className="text-gray-700 mb-2">If you have an account or have left comments, you may request:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-1 mb-4">
              <li>A copy of the personal data we hold about you</li>
              <li>Correction or deletion of your data</li>
            </ul>
            <p className="text-gray-700 mb-4">
              This excludes data we are required to retain for administrative, legal, or security purposes.
            </p>
            <p className="text-gray-700">
              Requests can be sent to <a href="mailto:privacy@wallineex.store" className="text-blue-600 hover:text-blue-800">privacy@wallineex.store</a>.
            </p>
          </section>

          {/* Section 9 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Where We Send Your Data</h2>
            <p className="text-gray-700">
              Visitor comments and form submissions may be checked through an automated spam detection service to prevent malicious activity.
            </p>
          </section>

          {/* Section 10 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Data Protection</h2>
            <p className="text-gray-700 mb-4">
              We use secure servers, encrypted connections (HTTPS), and trusted third-party payment gateways to safeguard all personal and transactional data.
            </p>
            <p className="text-gray-700">
              However, no system is 100% secure, and we cannot guarantee absolute data security.
            </p>
          </section>

          {/* Section 11 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Consent</h2>
            <p className="text-gray-700">
              By using our website, you consent to our Privacy Policy and agree to its terms.
            </p>
          </section>

          {/* Section 12 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contact Information</h2>
            <p className="text-gray-700 mb-4">
              If you have any questions about this Privacy Policy, please contact us:
            </p>
            <div className="space-y-2 text-gray-700">
              <p>📧 Email: <a href="mailto:privacy@wallineex.store" className="text-blue-600 hover:text-blue-800">privacy@wallineex.store</a></p>
              <p>🌐 Website: <a href="https://wallineex.store" className="text-blue-600 hover:text-blue-800">https://wallineex.store</a></p>
            </div>
          </section>

        </div>

        {/* Footer Info */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Policy Information</h3>
            <div className="space-y-2 text-gray-700">
              <p><strong>Last Updated:</strong> October 2025</p>
              <p><strong>Company Name:</strong> Wallineex</p>
              <p><strong>Domain:</strong> <a href="https://wallineex.store" className="text-blue-600 hover:text-blue-800">https://wallineex.store</a></p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
