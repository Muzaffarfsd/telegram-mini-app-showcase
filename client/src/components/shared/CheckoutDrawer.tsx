import { memo, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { 
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from '@/components/ui/drawer';
import { 
  CreditCard, 
  Wallet, 
  Truck, 
  MapPin, 
  Check,
  Loader2,
  Package
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  image?: string;
}

interface CheckoutDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  total: number;
  currency?: string;
  onOrderComplete?: (orderId: string) => void;
  storeName?: string;
}

type Step = 'address' | 'payment' | 'confirm' | 'success';

const paymentMethods = [
  { id: 'card', label: 'Банковская карта', icon: CreditCard },
  { id: 'wallet', label: 'Электронный кошелёк', icon: Wallet },
  { id: 'cash', label: 'Наличными при получении', icon: Truck },
];

const deliveryOptions = [
  { id: 'courier', label: 'Курьером', price: 300, time: '1-2 дня' },
  { id: 'pickup', label: 'Самовывоз', price: 0, time: 'Сегодня' },
  { id: 'post', label: 'Почта России', price: 200, time: '5-7 дней' },
];

export const CheckoutDrawer = memo(function CheckoutDrawer({
  isOpen,
  onClose,
  items,
  total,
  currency = '₽',
  onOrderComplete,
  storeName = 'Магазин',
}: CheckoutDrawerProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>('address');
  const [isLoading, setIsLoading] = useState(false);
  const [orderId, setOrderId] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    delivery: 'courier',
    payment: 'card',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const deliveryPrice = deliveryOptions.find(d => d.id === formData.delivery)?.price || 0;
  const finalTotal = total + deliveryPrice;

  const validateAddress = useCallback(() => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = 'Введите имя';
    if (!formData.phone.trim()) newErrors.phone = 'Введите телефон';
    else if (!/^[\d\s\+\-\(\)]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Неверный формат телефона';
    }
    if (!formData.address.trim()) newErrors.address = 'Введите адрес';
    if (!formData.city.trim()) newErrors.city = 'Введите город';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleNext = useCallback(() => {
    if (step === 'address') {
      if (validateAddress()) {
        setStep('payment');
      }
    } else if (step === 'payment') {
      setStep('confirm');
    } else if (step === 'confirm') {
      setIsLoading(true);
      
      setTimeout(() => {
        const newOrderId = `ORD-${Date.now().toString(36).toUpperCase()}`;
        setOrderId(newOrderId);
        setStep('success');
        setIsLoading(false);
        
        toast({
          title: 'Заказ оформлен!',
          description: `Номер заказа: ${newOrderId}`,
        });
        
        onOrderComplete?.(newOrderId);
      }, 1500);
    }
  }, [step, validateAddress, onOrderComplete, toast]);

  const handleClose = useCallback(() => {
    if (step === 'success') {
      setStep('address');
      setFormData({
        name: '',
        phone: '',
        address: '',
        city: '',
        delivery: 'courier',
        payment: 'card',
      });
      setErrors({});
    }
    onClose();
  }, [step, onClose]);

  const updateField = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  const renderStep = () => {
    switch (step) {
      case 'address':
        return (
          <div className="space-y-4 px-4">
            <div className="space-y-2">
              <Label htmlFor="name">Имя получателя *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="Иван Иванов"
                className={`min-h-[44px] ${errors.name ? 'border-destructive' : ''}`}
                aria-invalid={!!errors.name}
                data-testid="input-checkout-name"
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Телефон *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                placeholder="+7 (999) 123-45-67"
                className={`min-h-[44px] ${errors.phone ? 'border-destructive' : ''}`}
                aria-invalid={!!errors.phone}
                data-testid="input-checkout-phone"
              />
              {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Город *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => updateField('city', e.target.value)}
                placeholder="Москва"
                className={`min-h-[44px] ${errors.city ? 'border-destructive' : ''}`}
                aria-invalid={!!errors.city}
                data-testid="input-checkout-city"
              />
              {errors.city && <p className="text-xs text-destructive">{errors.city}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Адрес доставки *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => updateField('address', e.target.value)}
                placeholder="ул. Примерная, д. 1, кв. 1"
                className={`min-h-[44px] ${errors.address ? 'border-destructive' : ''}`}
                aria-invalid={!!errors.address}
                data-testid="input-checkout-address"
              />
              {errors.address && <p className="text-xs text-destructive">{errors.address}</p>}
            </div>

            <Separator className="my-4" />

            <div className="space-y-3">
              <Label>Способ доставки</Label>
              <RadioGroup
                value={formData.delivery}
                onValueChange={(value) => updateField('delivery', value)}
                className="space-y-2"
              >
                {deliveryOptions.map((option) => (
                  <label
                    key={option.id}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer min-h-[56px] ${
                      formData.delivery === option.id ? 'border-primary bg-primary/5' : 'border-border'
                    }`}
                    data-testid={`radio-delivery-${option.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value={option.id} id={option.id} />
                      <div>
                        <p className="font-medium text-sm">{option.label}</p>
                        <p className="text-xs text-muted-foreground">{option.time}</p>
                      </div>
                    </div>
                    <span className="font-medium text-sm">
                      {option.price === 0 ? 'Бесплатно' : `${option.price} ${currency}`}
                    </span>
                  </label>
                ))}
              </RadioGroup>
            </div>
          </div>
        );

      case 'payment':
        return (
          <div className="space-y-4 px-4">
            <div className="space-y-3">
              <Label>Способ оплаты</Label>
              <RadioGroup
                value={formData.payment}
                onValueChange={(value) => updateField('payment', value)}
                className="space-y-2"
              >
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  return (
                    <label
                      key={method.id}
                      className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer min-h-[56px] ${
                        formData.payment === method.id ? 'border-primary bg-primary/5' : 'border-border'
                      }`}
                      data-testid={`radio-payment-${method.id}`}
                    >
                      <RadioGroupItem value={method.id} id={method.id} />
                      <Icon className="w-5 h-5 text-muted-foreground" />
                      <span className="font-medium text-sm">{method.label}</span>
                    </label>
                  );
                })}
              </RadioGroup>
            </div>

            {formData.payment === 'card' && (
              <div className="space-y-4 mt-6 p-4 bg-muted/50 rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Номер карты</Label>
                  <Input
                    id="cardNumber"
                    placeholder="0000 0000 0000 0000"
                    className="min-h-[44px]"
                    data-testid="input-card-number"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiry">Срок</Label>
                    <Input
                      id="expiry"
                      placeholder="MM/YY"
                      className="min-h-[44px]"
                      data-testid="input-card-expiry"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      type="password"
                      placeholder="***"
                      className="min-h-[44px]"
                      data-testid="input-card-cvv"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'confirm':
        const selectedDelivery = deliveryOptions.find(d => d.id === formData.delivery);
        const selectedPayment = paymentMethods.find(p => p.id === formData.payment);

        return (
          <div className="space-y-4 px-4">
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Товары</h3>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm py-2 border-b last:border-0">
                    <div className="flex-1">
                      <p className="font-medium line-clamp-1">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.size && `${item.size}`}
                        {item.size && item.color && ' / '}
                        {item.color && `${item.color}`}
                        {' x '}{item.quantity}
                      </p>
                    </div>
                    <span className="font-medium ml-2">
                      {(item.price * item.quantity).toLocaleString()} {currency}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Доставка
              </h3>
              <div className="text-sm text-muted-foreground">
                <p>{formData.name}</p>
                <p>{formData.phone}</p>
                <p>{formData.city}, {formData.address}</p>
                <p className="mt-1">{selectedDelivery?.label} ({selectedDelivery?.time})</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <CreditCard className="w-4 h-4" /> Оплата
              </h3>
              <p className="text-sm text-muted-foreground">{selectedPayment?.label}</p>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Товары ({items.length})</span>
                <span>{total.toLocaleString()} {currency}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Доставка</span>
                <span>{deliveryPrice === 0 ? 'Бесплатно' : `${deliveryPrice} ${currency}`}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                <span>Итого</span>
                <span>{finalTotal.toLocaleString()} {currency}</span>
              </div>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
              <Check className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Заказ оформлен!</h3>
            <p className="text-muted-foreground mb-4">
              Номер заказа: <span className="font-mono font-semibold">{orderId}</span>
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-4 py-3 rounded-lg">
              <Package className="w-4 h-4" />
              <span>Мы отправим вам уведомление о статусе</span>
            </div>
          </div>
        );
    }
  };

  const getButtonLabel = () => {
    switch (step) {
      case 'address': return 'Продолжить';
      case 'payment': return 'Подтвердить';
      case 'confirm': return `Оплатить ${finalTotal.toLocaleString()} ${currency}`;
      case 'success': return 'Закрыть';
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 'address': return 'Доставка';
      case 'payment': return 'Оплата';
      case 'confirm': return 'Подтверждение';
      case 'success': return storeName;
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={handleClose}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="border-b">
          <DrawerTitle>{getStepTitle()}</DrawerTitle>
          {step !== 'success' && (
            <div className="flex gap-1 mt-2">
              {['address', 'payment', 'confirm'].map((s, i) => (
                <div
                  key={s}
                  className={`h-1 flex-1 rounded-full ${
                    ['address', 'payment', 'confirm'].indexOf(step) >= i
                      ? 'bg-primary'
                      : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          )}
        </DrawerHeader>

        <div className="overflow-y-auto max-h-[60vh] py-4">
          {renderStep()}
        </div>

        <DrawerFooter className="border-t">
          {step !== 'address' && step !== 'success' && (
            <Button
              variant="outline"
              onClick={() => setStep(step === 'confirm' ? 'payment' : 'address')}
              className="min-h-[44px]"
              data-testid="button-checkout-back"
            >
              Назад
            </Button>
          )}
          <Button
            onClick={step === 'success' ? handleClose : handleNext}
            disabled={isLoading}
            className="min-h-[44px]"
            data-testid="button-checkout-next"
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {getButtonLabel()}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
});

export default CheckoutDrawer;
