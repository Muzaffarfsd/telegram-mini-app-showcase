import { useState, useEffect, memo } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { CreditCard, Lock, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTelegram } from "@/hooks/useTelegram";
import { BackHeader } from "./BackHeader";
import { useLanguage } from "../contexts/LanguageContext";

const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY 
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
  : null;

interface CheckoutPageProps {
  selectedFeatures: any[];
  projectName: string;
  totalAmount: number;
  onBack: () => void;
  onSuccess: () => void;
}

const CheckoutForm = ({ totalAmount, projectName, selectedFeatures, onSuccess }: { 
  totalAmount: number; 
  projectName: string; 
  selectedFeatures: any[];
  onSuccess: () => void 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const { user } = useTelegram();
  const { t } = useLanguage();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/success`,
        },
        redirect: 'if_required'
      });

      if (error) {
        toast({
          title: t('checkout.paymentError'),
          description: error.message,
          variant: "destructive",
        });
      } else {
        // Create project after successful payment
        try {
          const createProjectResponse = await fetch('/api/create-project', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              telegramId: user?.id?.toString(),
              projectName: projectName,
              projectType: 'custom',
              features: selectedFeatures.map(f => f.id),
              paymentIntentId: 'stripe_payment_' + Date.now()
            })
          });
          
          if (createProjectResponse.ok) {
            console.log('Project created successfully');
            toast({
              title: t('checkout.paymentSuccess'),
              description: t('checkout.projectCreated'),
            });
          } else {
            throw new Error('Failed to create project');
          }
        } catch (error) {
          console.error('Error creating project:', error);
          toast({
            title: t('checkout.paymentSuccess'),
            description: t('checkout.thankYouOrder'),
          });
        }
        
        onSuccess();
      }
    } catch (err) {
      toast({
        title: t('common.error'),
        description: t('checkout.paymentProcessError'),
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="liquid-glass-card rounded-2xl p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Lock className="w-4 h-4 text-system-green" />
          <span className="ios-footnote text-system-green font-medium">{t('checkout.securePayment')}</span>
        </div>
        <PaymentElement />
      </div>
      
      <button 
        type="submit" 
        disabled={!stripe || isProcessing}
        className="w-full ios-button-filled h-12 flex items-center justify-center"
        data-testid="button-pay"
      >
        <CreditCard className="w-4 h-4 mr-2" />
        {isProcessing ? t('checkout.processing') : `${t('checkout.pay')} ${totalAmount.toLocaleString()} ₽`}
      </button>
    </form>
  );
};

const CheckoutPage = memo(function CheckoutPage({ selectedFeatures, projectName, totalAmount, onBack, onSuccess }: CheckoutPageProps) {
  const [clientSecret, setClientSecret] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    // Create PaymentIntent when component mounts
    if (totalAmount > 0) {
      fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: totalAmount,
          project_name: projectName,
          features: selectedFeatures.map(f => f.id)
        }),
      })
      .then(res => res.json())
      .then(data => {
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          toast({
            title: t('common.error'),
            description: t('checkout.initPaymentError'),
            variant: "destructive",
          });
        }
        setIsLoading(false);
      })
      .catch(() => {
        toast({
          title: t('common.error'),
          description: t('checkout.connectionError'),
          variant: "destructive",
        });
        setIsLoading(false);
      });
    }
  }, [totalAmount, projectName, selectedFeatures, toast, t]);

  if (!stripePromise) {
    return (
      <div className="min-h-screen bg-black text-white p-4 flex items-center justify-center">
        <div className="liquid-glass-card rounded-2xl max-w-md w-full">
          <div className="pt-6 px-6 pb-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
              <CreditCard className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold mb-2 text-white">{t('checkout.paymentsUnavailable')}</h2>
            <p className="text-white/70">
              {t('checkout.paymentsUnavailableDesc')}
            </p>
            <button className="w-full mt-4 ios-button-filled h-12" onClick={onBack} data-testid="button-back-error">
              {t('checkout.goBack')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white p-4 flex items-center justify-center">
        <div className="liquid-glass-card rounded-2xl max-w-md w-full">
          <div className="pt-6 px-6 pb-6 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-system-blue border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-white/70">{t('checkout.preparingPayment')}</p>
          </div>
        </div>
      </div>
    );
  }

  const appearance = {
    theme: 'night' as const,
    variables: {
      colorPrimary: '#6366f1',
      colorBackground: 'rgba(15, 15, 15, 0.8)',
      colorText: '#ffffff',
      borderRadius: '12px',
    }
  };

  return (
    <div className="checkout-page min-h-screen bg-black text-white pb-80 smooth-scroll-page">
      <BackHeader onBack={onBack} title={t('checkout.title')} />
      
      <div className="max-w-md mx-auto p-4">
        {/* Payment Form */}
        {clientSecret && (
          <Elements 
            stripe={stripePromise} 
            options={{ 
              clientSecret,
              appearance 
            }}
          >
            <CheckoutForm 
              totalAmount={totalAmount}
              projectName={projectName}
              selectedFeatures={selectedFeatures}
              onSuccess={onSuccess}
            />
          </Elements>
        )}
      </div>

      {/* Order Summary - Fixed at Bottom */}
      <div className="liquid-glass-card-elevated rounded-2xl fixed bottom-24 left-4 right-4 max-w-md mx-auto z-50" data-testid="order-summary">
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <CheckCircle className="w-5 h-5 text-system-green" />
              <span className="ios-title3 text-white">{t('checkout.yourOrder')}</span>
            </div>
          </div>
          <div className="px-6 pb-6 space-y-4">
            <div>
              <h3 className="ios-body font-bold text-white">{projectName}</h3>
              <p className="ios-footnote text-white/70">
                {selectedFeatures.length} {selectedFeatures.length === 1 ? t('checkout.feature') : t('checkout.features')}
              </p>
            </div>
            
            <div className="space-y-2">
              {selectedFeatures.map((feature) => (
                <div key={feature.id} className="flex justify-between ios-footnote">
                  <span className="text-white/70">{feature.name}</span>
                  <span className="text-system-blue font-semibold">{feature.price.toLocaleString()} ₽</span>
                </div>
              ))}
            </div>
            
            <div className="border-t border-white/10 pt-2">
              <div className="flex justify-between ios-body font-bold">
                <span className="text-white">{t('checkout.total')}</span>
                <span className="text-system-blue">{totalAmount.toLocaleString()} ₽</span>
              </div>
              <p className="ios-caption2 text-white/70 mt-1">
                {t('checkout.developmentTime')}
              </p>
            </div>
          </div>
        </div>
    </div>
  );
});

export default CheckoutPage;