'use client';

import { useState } from 'react';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    id: 1,
    question: "What types of products can I buy here?",
    answer: "We offer a wide range of digital products including templates, eBooks, courses, music, graphics, and software — all ready to download instantly after purchase."
  },
  {
    id: 2,
    question: "How do I pay for my purchase?",
    answer: "You can pay securely using credit/debit cards or UPI. All payments are processed safely through Stripe."
  },
  {
    id: 3,
    question: "When will I receive my product?",
    answer: "Immediately after a successful payment, you'll get instant access to download your product — no waiting, no delays."
  },
  {
    id: 4,
    question: "Can I get a refund if I'm not satisfied?",
    answer: "All purchases are final as these are digital products. If you need assistance, please contact our support team — we’re happy to help!"
  },
  {
    id: 5,
    question: "Do I need an account to purchase?",
    answer: "No account is required to buy products. However, signing up allows you to track your purchases and access them anytime."
  },
  {
    id: 6,
    question: "Is it safe to download digital products from your store?",
    answer: "Absolutely! All our files are checked and delivered securely. You can download them directly from our trusted platform."
  },
  {
    id: 7,
    question: "How can I get support if I face any issues?",
    answer: "You can reach out to our support team via the Contact page or email at support@wallineex.com. We aim to respond within 24 hours."
  },
  {
    id: 8,
    question: "Can I use the products commercially?",
    answer: "Licensing terms vary by product. Each product clearly states whether it's for personal or commercial use. Please check before purchasing."
  }
];

interface FAQItemProps {
  faq: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
}

function FAQItemComponent({ faq, isOpen, onToggle }: FAQItemProps) {
  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden transition-all duration-200 hover:border-gray-300">
      <button
        onClick={onToggle}
        className="w-full px-6 py-5 text-left flex items-center justify-between bg-white hover:bg-gray-50 transition-colors duration-200"
      >
        <span className="font-semibold text-gray-900 pr-4">
          {faq.question}
        </span>
        <div className={`flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
        isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="px-6 pb-5 pt-2">
          <p className="text-gray-600 leading-relaxed">
            {faq.answer}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function FAQ() {
  const [openItems, setOpenItems] = useState<number[]>([1]); // First item open by default

  const toggleItem = (id: number) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };


  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions (FAQs)
          </h2>
          <p className="text-lg text-gray-600">
            Find answers to common questions about our digital marketplace
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqData.map((faq) => (
            <FAQItemComponent
              key={faq.id}
              faq={faq}
              isOpen={openItems.includes(faq.id)}
              onToggle={() => toggleItem(faq.id)}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
