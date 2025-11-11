import { memo } from 'react';
import { Heart, ShoppingCart } from 'lucide-react';
import { LazyImage } from '../LazyImage';

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category?: string;
  description?: string;
  discount?: number;
  rating?: number;
  inStock?: boolean;
}

interface ProductCardProps {
  product: Product;
  isFavorite?: boolean;
  onToggleFavorite?: (productId: string) => void;
  onAddToCart?: (product: Product) => void;
  onClick?: () => void;
  showAddToCart?: boolean;
  className?: string;
}

export const ProductCard = memo(({ 
  product,
  isFavorite = false,
  onToggleFavorite,
  onAddToCart,
  onClick,
  showAddToCart = true,
  className = ''
}: ProductCardProps) => {
  const finalPrice = product.discount 
    ? product.price * (1 - product.discount / 100) 
    : product.price;
  
  const hasDiscount = product.discount && product.discount > 0;

  return (
    <div 
      className={`bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow ${className}`}
      onClick={onClick}
    >
      <div className="relative aspect-square">
        <LazyImage
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover"
        />
        
        {hasDiscount && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
            -{product.discount}%
          </div>
        )}
        
        {product.inStock === false && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-bold">Нет в наличии</span>
          </div>
        )}

        {onToggleFavorite && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(product.id);
            }}
            className="absolute top-2 right-2 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
            aria-label={isFavorite ? "Удалить из избранного" : "Добавить в избранное"}
          >
            <Heart 
              className={`w-5 h-5 transition-colors ${
                isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'
              }`}
            />
          </button>
        )}
      </div>

      <div className="p-4">
        {product.category && (
          <p className="text-xs text-gray-500 mb-1">{product.category}</p>
        )}
        
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
          {product.name}
        </h3>

        {product.description && (
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
            {product.description}
          </p>
        )}

        {product.rating && (
          <div className="flex items-center gap-1 mb-2">
            <span className="text-yellow-500">★</span>
            <span className="text-sm text-gray-600">{product.rating.toFixed(1)}</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900">
              {finalPrice.toLocaleString()}₽
            </span>
            {hasDiscount && (
              <span className="text-sm text-gray-400 line-through">
                {product.price.toLocaleString()}₽
              </span>
            )}
          </div>

          {showAddToCart && onAddToCart && product.inStock !== false && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(product);
              }}
              className="p-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              aria-label="Добавить в корзину"
            >
              <ShoppingCart className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';
