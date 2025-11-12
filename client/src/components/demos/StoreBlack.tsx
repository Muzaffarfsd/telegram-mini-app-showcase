import { useState } from "react";
import { motion } from "framer-motion";
import { Grid, Minus, Plus, ShoppingCart } from "lucide-react";

interface StoreBlackProps {
  activeTab: 'home' | 'catalog' | 'cart' | 'profile';
}

interface Product {
  id: number;
  name: string;
  category: 'Apparel' | 'Accessories';
  price: number;
  image: string;
}

const products: Product[] = [
  { id: 1, name: 'Ludens M1 Helmet', category: 'Accessories', price: 374.49, image: '/attached_assets/stock_images/cyberpunk_fashion_ho_8df162c4.jpg' },
  { id: 2, name: 'Ludens M2 Helmet', category: 'Accessories', price: 429.99, image: '/attached_assets/stock_images/cyberpunk_fashion_ho_663ed3c4.jpg' },
  { id: 3, name: 'Tech Watch Pro', category: 'Accessories', price: 299.00, image: '/attached_assets/stock_images/cyberpunk_fashion_ho_8df162c4.jpg' },
  { id: 4, name: 'Carbon Carabiner', category: 'Accessories', price: 89.99, image: '/attached_assets/stock_images/cyberpunk_fashion_ho_663ed3c4.jpg' },
  { id: 5, name: 'Urban Jacket', category: 'Apparel', price: 549.00, image: '/attached_assets/stock_images/cyberpunk_fashion_ho_8df162c4.jpg' },
  { id: 6, name: 'Tech Pants', category: 'Apparel', price: 349.00, image: '/attached_assets/stock_images/cyberpunk_fashion_ho_663ed3c4.jpg' },
];

function StoreBlack({ activeTab }: StoreBlackProps) {
  const [selectedCategory, setSelectedCategory] = useState<'All Products' | 'Apparel' | 'Accessories'>('All Products');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);

  const filteredProducts = selectedCategory === 'All Products' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  if (selectedProduct) {
    return (
      <div className="h-full bg-black text-white p-8 overflow-auto">
        <button
          onClick={() => setSelectedProduct(null)}
          className="mb-6 text-white/60 hover:text-white transition-colors"
        >
          ← Back to Store
        </button>

        <div className="flex gap-8">
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-24 h-24 bg-white/5 rounded-xl border border-white/10 overflow-hidden cursor-pointer hover:border-[#FFD700] transition-all">
                <img src={selectedProduct.image} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>

          <div className="flex-1">
            <div className="relative w-full h-[500px] bg-white/5 rounded-3xl border border-white/10 overflow-hidden mb-8">
              <img
                src={selectedProduct.image}
                alt={selectedProduct.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-6">
              <div>
                <h1 className="text-4xl font-bold mb-2">{selectedProduct.name}</h1>
                <p className="text-white/60">{selectedProduct.category}</p>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-4 bg-white/5 rounded-full px-6 py-3 border border-white/10">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="text-white/60 hover:text-white transition-colors"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="text-xl font-bold w-12 text-center">
                    {quantity.toString().padStart(2, '0')}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="text-white/60 hover:text-white transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1">
                  <p className="text-5xl font-bold" style={{ color: '#FFD700' }}>
                    ${selectedProduct.price.toFixed(2)}
                  </p>
                </div>
              </div>

              <button className="w-full bg-white text-black font-bold py-5 rounded-full hover:bg-[#FFD700] transition-all text-lg flex items-center justify-center gap-3">
                <ShoppingCart className="w-6 h-6" />
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-black text-white p-8 overflow-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Grid className="w-8 h-8" style={{ color: '#FFD700' }} />
          <h1 className="text-5xl font-black tracking-tighter">STORE</h1>
        </div>
      </div>

      <div className="flex gap-6 mb-8">
        {(['All Products', 'Apparel', 'Accessories'] as const).map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`text-lg font-medium transition-colors ${
              selectedCategory === category
                ? 'text-[#FFD700] border-b-2 border-[#FFD700]'
                : 'text-white/40 hover:text-white/70'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => setSelectedProduct(product)}
            className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden cursor-pointer hover:border-[#FFD700] transition-all group"
          >
            <div className="relative h-80 overflow-hidden">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2">{product.name}</h3>
              <p className="text-white/40 text-sm mb-4">{product.category}</p>
              <p className="text-2xl font-bold" style={{ color: '#FFD700' }}>
                ${product.price.toFixed(2)}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default StoreBlack;
