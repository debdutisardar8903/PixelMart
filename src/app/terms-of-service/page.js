'use client';

import { useRouter } from 'next/navigation';

export default function TermsOfServicePage() {
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
            Terms and Conditions
          </h1>
          <p className="text-lg text-gray-600">
            Welcome to Wallineex!
          </p>
          <p className="text-gray-600 mt-2">
            These Terms and Conditions outline the rules and regulations for the use of Wallineex's Website, located at https://wallineex.store.
          </p>
          <p className="text-gray-600 mt-2">
            By accessing this website, we assume you accept these Terms and Conditions. Do not continue to use Wallineex if you do not agree to all of the terms and conditions stated on this page.
          </p>
        </div>

        {/* Terms Content */}
        <div className="prose prose-lg max-w-none">
          
          {/* Section 1 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Terminology</h2>
            <p className="text-gray-700 mb-4">
              The following terminology applies to these Terms and Conditions, Privacy Policy, and Disclaimer Notice, and all Agreements:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>"Client", "You", and "Your" refer to you, the person accessing this website and accepting the Company's terms and conditions.</li>
              <li>"The Company", "Ourselves", "We", "Our", and "Us" refer to Wallineex.</li>
              <li>"Party", "Parties", or "Us" refer to both the Client and ourselves.</li>
            </ul>
            <p className="text-gray-700 mt-4">
              All terms refer to the offer, acceptance, and consideration of payment necessary to undertake the process of our assistance to the Client in the most appropriate manner, for the express purpose of meeting the Client's needs in respect of the provision of Wallineex's stated products and services, in accordance with and subject to applicable law.
            </p>
          </section>

          {/* Section 2 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Cookies</h2>
            <p className="text-gray-700 mb-4">
              We employ the use of cookies. By accessing Wallineex, you agree to use cookies in accordance with our Privacy Policy.
            </p>
            <p className="text-gray-700">
              Cookies help us enhance user experience and allow certain areas of our website to function properly. Some of our affiliate or advertising partners may also use cookies.
            </p>
          </section>

          {/* Section 3 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. License</h2>
            <p className="text-gray-700 mb-4">
              Unless otherwise stated, Wallineex and/or its licensors own the intellectual property rights for all material on this website. All intellectual property rights are reserved. You may access this website for your own personal use, subject to the restrictions set forth in these Terms and Conditions.
            </p>
            <p className="text-gray-700 mb-2">You must not:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-1">
              <li>Republish material from wallineex.store</li>
              <li>Sell, rent, or sub-license material from wallineex.store</li>
              <li>Reproduce, duplicate, or copy material from Wallineex</li>
              <li>Redistribute content from Wallineex</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. User Comments</h2>
            <p className="text-gray-700 mb-4">
              Parts of this website may allow users to post comments or share opinions. Wallineex does not filter, edit, or review comments prior to publication. Comments reflect the views and opinions of the person who posts them.
            </p>
            <p className="text-gray-700 mb-4">
              To the extent permitted by applicable law, Wallineex shall not be liable for any comments or any liability, damages, or expenses caused as a result of any use or appearance of the comments on this website.
            </p>
            <p className="text-gray-700 mb-2">You warrant and represent that:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-1 mb-4">
              <li>You have the right to post the comments and all necessary permissions to do so.</li>
              <li>The comments do not infringe any intellectual property rights of a third party.</li>
              <li>The comments do not contain defamatory, offensive, or unlawful material.</li>
              <li>The comments will not be used to promote unlawful or commercial activities.</li>
            </ul>
            <p className="text-gray-700">
              You hereby grant Wallineex a non-exclusive license to use, reproduce, and edit your comments in any form or media.
            </p>
          </section>

          {/* Section 5 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Hyperlinking to Our Content</h2>
            <p className="text-gray-700 mb-2">The following organizations may link to our website without prior written approval:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-1 mb-4">
              <li>Government agencies</li>
              <li>Search engines</li>
              <li>News organizations</li>
              <li>Online directory distributors</li>
              <li>System-wide Accredited Businesses</li>
            </ul>
            <p className="text-gray-700 mb-2">These organizations may link to our homepage or other pages as long as the link:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-1 mb-4">
              <li>(a) is not deceptive,</li>
              <li>(b) does not falsely imply sponsorship or endorsement, and</li>
              <li>(c) fits within the context of the linking party's site.</li>
            </ul>
            <p className="text-gray-700">
              If you wish to link to our website, please email us at contact@wallineex.store with your site details and intended link URLs.
            </p>
          </section>

          {/* Section 6 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. iFrames</h2>
            <p className="text-gray-700">
              Without prior written permission, you may not create frames around our webpages that alter the visual presentation or appearance of our website.
            </p>
          </section>

          {/* Section 7 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Content Liability</h2>
            <p className="text-gray-700">
              We are not responsible for any content that appears on your website. You agree to defend and protect us against all claims arising from your website. No link(s) should appear on any website that may be interpreted as libelous, obscene, criminal, or that infringes any third-party rights.
            </p>
          </section>

          {/* Section 8 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Privacy</h2>
            <p className="text-gray-700">
              Please read our Privacy Policy to understand how we collect and protect your information.
            </p>
          </section>

          {/* Section 9 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Reservation of Rights</h2>
            <p className="text-gray-700 mb-4">
              We reserve the right to request the removal of all links or any particular link to our website at any time. You agree to remove all links to our website upon such request.
            </p>
            <p className="text-gray-700 mb-4">
              We also reserve the right to amend these Terms and Conditions at any time.
            </p>
            <p className="text-gray-700">
              By continuing to link to or use our website, you agree to be bound by the latest version of these Terms and Conditions.
            </p>
          </section>

          {/* Section 10 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Removal of Links</h2>
            <p className="text-gray-700">
              If you find any link on our website offensive for any reason, you may contact us at support@wallineex.store. We will consider requests to remove links but are not obligated to respond directly or take action unless deemed necessary.
            </p>
          </section>

          {/* Section 11 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Disclaimer</h2>
            <p className="text-gray-700 mb-4">
              To the maximum extent permitted by applicable law, we exclude all representations, warranties, and conditions relating to our website and its use.
            </p>
            <p className="text-gray-700 mb-2">Nothing in this disclaimer will:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-1 mb-4">
              <li>Limit or exclude liability for death or personal injury;</li>
              <li>Limit or exclude liability for fraud or fraudulent misrepresentation;</li>
              <li>Limit any liabilities not permitted under applicable law; or</li>
              <li>Exclude any liabilities that may not be excluded under applicable law.</li>
            </ul>
            <p className="text-gray-700">
              As long as the website and the information and services are provided free of charge, Wallineex will not be liable for any loss or damage of any nature.
            </p>
          </section>

        </div>

        {/* Footer Info */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
            <div className="space-y-2 text-gray-700">
              <p><strong>Last Updated:</strong> October 2025</p>
              <p><strong>Website:</strong> <a href="https://wallineex.store" className="text-blue-600 hover:text-blue-800">https://wallineex.store</a></p>
              <p><strong>Email:</strong> <a href="mailto:support@wallineex.store" className="text-blue-600 hover:text-blue-800">support@wallineex.store</a></p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
