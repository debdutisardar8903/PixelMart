'use client';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import ProductCatalog from '@/components/ProductCatalog/ProductCatalog';

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            All Products
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
            Explore our complete collection of premium digital products, templates, and creative resources. 
            Find everything you need to bring your projects to life.
          </p>
        </div>
      </section>

      {/* Product Catalog Component */}
      <ProductCatalog />

      <Footer />
    </div>
  );
}
