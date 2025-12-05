import { memo, useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, ShoppingCart, Share2, ChevronLeft, ChevronRight, Star, X, Minus, Plus } from 'lucide-react';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

interface QuickViewProduct {
  id: string | number;
  name: string;
  price: number;
  oldPrice?: number;
  description?: string;
  images: string[];
  category?: string;
  brand?: string;
  rating?: number;
  inStock?: number | boolean;
  isNew?: boolean;
  isSale?: boolean;
  sizes?: string[];
  colors?: { name: string; value: string }[];
  specs?: string[];
}

interface QuickViewModalProps {
  product: QuickViewProduct | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: QuickViewProduct, quantity: number, size?: string, color?: string) => void;
  onToggleFavorite?: (productId: string | number) => void;
  onShare?: (product: QuickViewProduct) => void;
  isFavorite?: (productId: string | number) => boolean;
  currency?: string;
  accentColor?: string;
  theme?: 'dark' | 'light';
}

export const QuickViewModal = memo(function QuickViewModal({
  product,
  isOpen,
  onClose,
  onAddToCart,
  onToggleFavorite,
  onShare,
  isFavorite,
  currency = '₽',
  accentColor = '#00D4FF',
  theme = 'dark',
}: QuickViewModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | undefined>();
  const [selectedColor, setSelectedColor] = useState<string | undefined>();

  const bgColor = theme === 'dark' ? 'bg-[#0A0A0A]' : 'bg-white';
  const textColor = theme === 'dark' ? 'text-white' : 'text-black';
  const mutedColor = theme === 'dark' ? 'text-white/60' : 'text-black/60';
  const borderColor = theme === 'dark' ? 'border-white/10' : 'border-black/10';

  const formatPrice = useCallback((price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price) + ` ${currency}`;
  }, [currency]);

  const handlePrevImage = useCallback(() => {
    if (!product) return;
    setCurrentImageIndex(prev => 
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  }, [product]);

  const handleNextImage = useCallback(() => {
    if (!product) return;
    setCurrentImageIndex(prev => 
      prev === product.images.length - 1 ? 0 : prev + 1
    );
  }, [product]);

  const handleAddToCart = useCallback(() => {
    if (!product) return;
    onAddToCart(product, quantity, selectedSize, selectedColor);
    onClose();
    setQuantity(1);
    setSelectedSize(undefined);
    setSelectedColor(undefined);
  }, [product, quantity, selectedSize, selectedColor, onAddToCart, onClose]);

  const handleShare = useCallback(() => {
    if (!product || !onShare) return;
    onShare(product);
  }, [product, onShare]);

  if (!product) return null;

  const productIsFavorite = isFavorite ? isFavorite(product.id) : false;
  const isInStock = typeof product.inStock === 'boolean' ? product.inStock : (product.inStock && product.inStock > 0);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className={`${bgColor} ${textColor} max-w-md sm:max-w-lg p-0 overflow-hidden border-0 rounded-2xl max-h-[90vh] overflow-y-auto`}
        aria-describedby="quick-view-description"
      >
        <VisuallyHidden>
          <DialogTitle>{product.name}</DialogTitle>
          <DialogDescription id="quick-view-description">
            Быстрый просмотр товара {product.name}
          </DialogDescription>
        </VisuallyHidden>

        <div className="relative">
          <div className="relative aspect-square overflow-hidden bg-black/5">
            <img
              src={product.images[currentImageIndex]}
              alt={product.name}
              className="w-full h-full object-cover"
              loading="eager"
            />
            
            {product.images.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center"
                  aria-label="Предыдущее изображение"
                  data-testid="button-prev-image"
                >
                  <ChevronLeft className="w-5 h-5 text-white" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center"
                  aria-label="Следующее изображение"
                  data-testid="button-next-image"
                >
                  <ChevronRight className="w-5 h-5 text-white" />
                </button>
              </>
            )}

            {product.images.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {product.images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === currentImageIndex 
                        ? 'bg-white w-4' 
                        : 'bg-white/50'
                    }`}
                    aria-label={`Изображение ${idx + 1}`}
                  />
                ))}
              </div>
            )}

            <div className="absolute top-3 left-3 flex gap-2">
              {product.isNew && (
                <Badge className="bg-white text-black font-semibold">NEW</Badge>
              )}
              {product.isSale && product.oldPrice && (
                <Badge className="bg-red-500 text-white font-semibold">SALE</Badge>
              )}
            </div>

            <div className="absolute top-3 right-3 flex gap-2">
              {onToggleFavorite && (
                <button
                  onClick={() => onToggleFavorite(product.id)}
                  className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center"
                  aria-label={productIsFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}
                  data-testid="button-favorite"
                >
                  <Heart 
                    className={`w-5 h-5 ${productIsFavorite ? 'fill-red-500 text-red-500' : 'text-white'}`} 
                  />
                </button>
              )}
              {onShare && (
                <button
                  onClick={handleShare}
                  className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center"
                  aria-label="Поделиться"
                  data-testid="button-share"
                >
                  <Share2 className="w-5 h-5 text-white" />
                </button>
              )}
            </div>
          </div>

          <div className="p-5 space-y-4">
            <div>
              {product.brand && (
                <p className={`text-xs ${mutedColor} mb-1`}>{product.brand}</p>
              )}
              <h2 className="text-xl font-bold mb-2">{product.name}</h2>
              
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl font-bold" style={{ color: accentColor }}>
                  {formatPrice(product.price)}
                </span>
                {product.oldPrice && (
                  <span className={`text-lg ${mutedColor} line-through`}>
                    {formatPrice(product.oldPrice)}
                  </span>
                )}
              </div>

              {product.rating && (
                <div className="flex items-center gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= Math.round(product.rating || 0)
                          ? 'fill-yellow-400 text-yellow-400'
                          : `${mutedColor}`
                      }`}
                    />
                  ))}
                  <span className={`text-sm ${mutedColor} ml-1`}>
                    {product.rating.toFixed(1)}
                  </span>
                </div>
              )}

              {product.description && (
                <p className={`text-sm ${mutedColor} leading-relaxed`}>
                  {product.description}
                </p>
              )}
            </div>

            {product.sizes && product.sizes.length > 0 && (
              <div>
                <p className="text-sm font-semibold mb-2">Размер</p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-3 py-1.5 rounded-lg border transition-all ${
                        selectedSize === size
                          ? `border-[${accentColor}] bg-[${accentColor}]/10`
                          : `${borderColor}`
                      }`}
                      style={selectedSize === size ? { borderColor: accentColor, backgroundColor: `${accentColor}20` } : {}}
                      data-testid={`button-size-${size}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.colors && product.colors.length > 0 && (
              <div>
                <p className="text-sm font-semibold mb-2">Цвет</p>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color.name)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        selectedColor === color.name 
                          ? 'ring-2 ring-offset-2 ring-current' 
                          : ''
                      }`}
                      style={{ 
                        backgroundColor: color.value,
                        color: selectedColor === color.name ? accentColor : undefined,
                      }}
                      aria-label={`Цвет ${color.name}`}
                      data-testid={`button-color-${color.name}`}
                    />
                  ))}
                </div>
              </div>
            )}

            {product.specs && product.specs.length > 0 && (
              <div>
                <p className="text-sm font-semibold mb-2">Характеристики</p>
                <div className="flex flex-wrap gap-2">
                  {product.specs.slice(0, 4).map((spec, idx) => (
                    <Badge 
                      key={idx} 
                      variant="secondary"
                      className={`${theme === 'dark' ? 'bg-white/10' : 'bg-black/5'}`}
                    >
                      {spec}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-2 ${theme === 'dark' ? 'bg-white/10' : 'bg-black/5'} rounded-full px-3`}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 flex items-center justify-center"
                  aria-label="Уменьшить количество"
                  data-testid="button-decrease-quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 flex items-center justify-center"
                  aria-label="Увеличить количество"
                  data-testid="button-increase-quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <Button
                onClick={handleAddToCart}
                disabled={!isInStock}
                className="flex-1 min-h-[48px] rounded-full font-bold"
                style={{ backgroundColor: accentColor, color: theme === 'dark' ? '#000' : '#fff' }}
                data-testid="button-add-to-cart-modal"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                {isInStock ? 'В корзину' : 'Нет в наличии'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});
