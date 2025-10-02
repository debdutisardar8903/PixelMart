import { Header } from '@/components/Header';
import { Banner } from '@/components/Banner';
import ProductCatalogClient from '@/components/ProductCatalog/ProductCatalogClient';
import { FAQ } from '@/components/FAQ';
import { Testimonials } from '@/components/Testimonials';
import { FooterBanner } from '@/components/FooterBanner';
import { WhyChooseUs } from '@/components/WhyChooseUs';
import { Footer } from '@/components/Footer';
import { RecentPurchases } from '@/components/RecentPurchases';

export default function Home() {
  return (
    <div>
      <Header />
      
      {/* Home Page Header */}
      <section className="pt-32 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="mb-8">
            <div className="inline-flex items-center bg-gradient-to-r from-gray-900 via-black to-gray-900 bg-[length:200%_100%] animate-pulse rounded-full px-4 py-2 hover:animate-none hover:bg-gradient-to-r hover:from-black hover:to-gray-800 transition-all duration-200">
              <a href="/pricing" rel="noopener noreferrer" className="flex items-center space-x-2 text-white hover:text-gray-200 font-medium text-sm">
                <span className="text-base">🎉</span>
                <span>Limited Time Offer – Flat 50% Off</span>
              </a>
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Welcome! Get What You Need, Instantly
          </h1>
          <p className="text-lg md:text-xl text-gray-600 leading-relaxed mb-8">
            Shop templates, courses, eBooks, music, and more — all delivered right after purchase.
          </p>
        </div>
      </section>

      {/* Footer Offer Banner */}
      <FooterBanner />

      {/* Product Banner */}
      <Banner />

      {/* Featured Products Section */}
      <section className="pt-16 pb-4 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured Products
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover our curated collection of premium digital products, templates, and resources
            </p>
          </div>
        </div>
      </section>

      {/* Product Catalog */}
      <ProductCatalogClient />

      {/* FAQ Section */}
      <FAQ />

      {/* Testimonials Section */}
      <Testimonials />

      {/* Why Choose Us Section */}
      <WhyChooseUs />

      {/* Footer */}
      <Footer />

      {/* Recent Purchases Notifications */}
      <RecentPurchases />
    </div>
  );
}
