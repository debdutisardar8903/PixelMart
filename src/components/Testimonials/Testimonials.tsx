'use client';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  location: string;
  rating: number;
  review: string;
  avatar: string;
  productPurchased: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Rajesh Kumar",
    role: "Web Developer",
    company: "Tech Solutions",
    location: "Mumbai, India",
    rating: 5,
    review: "Amazing quality templates! Saved me weeks of development time. The designs are modern and the code is clean. Highly recommend Wallineex for any developer.",
    avatar: "RK",
    productPurchased: "Modern Website Template"
  },
  {
    id: 2,
    name: "Sarah Johnson",
    role: "UX Designer",
    company: "Creative Agency",
    location: "New York, USA",
    rating: 5,
    review: "The UI/UX course was incredibly detailed and practical. I learned so much about modern design principles. The instructor's approach was perfect for beginners and experts alike.",
    avatar: "SJ",
    productPurchased: "UI/UX Design Course"
  },
  {
    id: 3,
    name: "Priya Sharma",
    role: "Graphic Designer",
    company: "Freelancer",
    location: "Delhi, India",
    rating: 5,
    review: "Fantastic icon pack! The variety and quality exceeded my expectations. Perfect for all my client projects. The different formats provided made it so convenient to use.",
    avatar: "PS",
    productPurchased: "Icon Pack Bundle"
  },
  {
    id: 4,
    name: "Michael Chen",
    role: "Content Creator",
    company: "YouTube Channel",
    location: "Toronto, Canada",
    rating: 4,
    review: "Great background music collection. The tracks are royalty-free and high quality. Perfect for my videos and podcasts. Good value for money!",
    avatar: "MC",
    productPurchased: "Background Music Pack"
  },
  {
    id: 5,
    name: "Ankit Patel",
    role: "Entrepreneur",
    company: "E-commerce Startup",
    location: "Bangalore, India",
    rating: 5,
    review: "The e-commerce template was exactly what I needed. Clean design, mobile responsive, and easy to customize. Launched my store in just 2 days!",
    avatar: "AP",
    productPurchased: "E-commerce Template"
  },
  {
    id: 6,
    name: "Emma Wilson",
    role: "Photographer",
    company: "Wilson Photography",
    location: "London, UK",
    rating: 5,
    review: "Excellent photography eBook! Learned advanced techniques that improved my work significantly. The examples and exercises were very helpful.",
    avatar: "EW",
    productPurchased: "Photography eBook"
  },
  {
    id: 7,
    name: "David Rodriguez",
    role: "Frontend Developer",
    company: "Tech Startup",
    location: "Madrid, Spain",
    rating: 5,
    review: "The React course was comprehensive and up-to-date. Covered everything from basics to advanced concepts. The projects were practical and engaging.",
    avatar: "DR",
    productPurchased: "React Development Course"
  },
  {
    id: 8,
    name: "Sneha Gupta",
    role: "App Developer",
    company: "Mobile Solutions",
    location: "Chennai, India",
    rating: 4,
    review: "Great mobile app template! Well-structured code and beautiful design. Saved me a lot of time in development. Will definitely buy more templates.",
    avatar: "SG",
    productPurchased: "Mobile App Template"
  }
];

interface TestimonialCardProps {
  testimonial: Testimonial;
}

function TestimonialCard({ testimonial }: TestimonialCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 h-full flex flex-col">
      {/* Rating Stars */}
      <div className="flex items-center mb-4">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`w-5 h-5 ${i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        ))}
        <span className="ml-2 text-sm text-gray-600">({testimonial.rating}.0)</span>
      </div>

      {/* Review Text */}
      <blockquote className="text-gray-700 mb-6 flex-grow leading-relaxed">
        "{testimonial.review}"
      </blockquote>

      {/* Product Purchased */}
      <div className="mb-4">
        <span className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
          Purchased: {testimonial.productPurchased}
        </span>
      </div>

      {/* Customer Info */}
      <div className="flex items-center">
        {/* Avatar */}
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-4">
          {testimonial.avatar}
        </div>

        {/* Details */}
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 text-sm">
            {testimonial.name}
          </h4>
          <p className="text-gray-600 text-xs">
            {testimonial.role} at {testimonial.company}
          </p>
          <p className="text-gray-500 text-xs">
            {testimonial.location}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Testimonials() {
  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            What People Say About Us
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Don't just take our word for it. Here's what our customers have to say about their experience with Wallineex.
          </p>
        </div>

        {/* Testimonials Grid - 3 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
}
