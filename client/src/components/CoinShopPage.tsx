import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTelegram } from '../hooks/useTelegram';
import { Coins, Gift, ChevronRight, Sparkles, Check, ArrowLeft } from 'lucide-react';

const SYNE = "'Syne', sans-serif";
const EMERALD = '#34d399';

interface DiscountTier {
  id: string;
  name: string;
  nameEn: string;
  coins: number;
  discount: number;
}

interface CoinShopPageProps {
  onNavigate: (section: string, data?: any) => void;
}

export default function CoinShopPage({ onNavigate }: CoinShopPageProps) {
  const { language } = useLanguage();
  const { hapticFeedback, user } = useTelegram();
  const [tiers, setTiers] = useState<DiscountTier[]>([]);
  const [balance, setBalance] = useState({ totalCoins: 0, availableCoins: 0, spentCoins: 0 });
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const [redeemed, setRedeemed] = useState<{ code: string; discount: number } | null>(null);

  useEffect(() => {
    fetch('/api/coinshop/tiers')
      .then(r => r.json())
      .then(d => setTiers(d.tiers || []))
      .catch(() => {});

    const initData = window.Telegram?.WebApp?.initData;
    if (initData) {
      fetch('/api/coinshop/balance', {
        headers: { 'x-telegram-init-data': initData },
      })
        .then(r => r.json())
        .then(d => {
          if (d.availableCoins !== undefined) setBalance(d);
        })
        .catch(() => {});
    }
  }, []);

  const handleRedeem = useCallback(async (tier: DiscountTier) => {
    const initData = window.Telegram?.WebApp?.initData;
    if (!initData) return;

    setRedeeming(tier.id);
    hapticFeedback.medium();

    try {
      const res = await fetch('/api/coinshop/redeem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-telegram-init-data': initData,
        },
        body: JSON.stringify({ tierId: tier.id }),
      });

      const data = await res.json();

      if (data.success) {
        hapticFeedback.heavy();
        setRedeemed({ code: data.discountCode, discount: data.discountPercent });
        setBalance(prev => ({
          ...prev,
          availableCoins: data.newBalance,
          spentCoins: prev.spentCoins + tier.coins,
        }));
      } else {
        hapticFeedback.error();
      }
    } catch {
      hapticFeedback.error();
    } finally {
      setRedeeming(null);
    }
  }, [hapticFeedback]);

  const isRu = language === 'ru';

  if (redeemed) {
    return (
      <div className="min-h-screen select-none" style={{ backgroundColor: '#050505', paddingTop: 120, paddingBottom: 160 }}>
        <div className="mx-auto w-full px-5" style={{ maxWidth: 540 }}>
          <div style={{
            textAlign: 'center',
            padding: '48px 24px',
            borderRadius: 24,
            background: 'linear-gradient(135deg, rgba(52,211,153,0.12), rgba(52,211,153,0.04))',
            border: '1px solid rgba(52,211,153,0.15)',
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'rgba(52,211,153,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <Check size={32} color={EMERALD} />
            </div>
            <h2 style={{ fontFamily: SYNE, fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginBottom: 8 }}>
              {isRu ? 'Скидка активирована!' : 'Discount Activated!'}
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginBottom: 24 }}>
              {isRu ? `Ваша скидка ${redeemed.discount}% готова` : `Your ${redeemed.discount}% discount is ready`}
            </p>
            <div style={{
              background: 'rgba(52,211,153,0.1)',
              border: '1px dashed rgba(52,211,153,0.3)',
              borderRadius: 12, padding: '16px 24px',
              marginBottom: 32,
            }}>
              <span style={{ fontFamily: 'monospace', fontSize: '1.1rem', color: EMERALD, fontWeight: 700, letterSpacing: '0.05em' }}>
                {redeemed.code}
              </span>
            </div>
            <button
              onClick={() => onNavigate('constructor', { discountCode: redeemed.code, discountPercent: redeemed.discount })}
              style={{
                width: '100%', padding: '14px 24px', borderRadius: 14,
                background: EMERALD, color: '#050505',
                fontFamily: SYNE, fontWeight: 700, fontSize: '0.95rem',
                border: 'none', cursor: 'pointer',
                marginBottom: 12,
              }}
            >
              {isRu ? 'Применить к заказу' : 'Apply to Order'}
            </button>
            <button
              onClick={() => setRedeemed(null)}
              style={{
                width: '100%', padding: '12px 24px', borderRadius: 14,
                background: 'transparent', color: 'rgba(255,255,255,0.5)',
                fontWeight: 600, fontSize: '0.85rem',
                border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer',
              }}
            >
              {isRu ? 'Вернуться в магазин' : 'Back to Shop'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen select-none overflow-x-hidden" style={{ backgroundColor: '#050505', paddingTop: 120, paddingBottom: 160 }}>
      <div className="mx-auto w-full px-5" style={{ maxWidth: 540 }}>

        <button
          onClick={() => onNavigate('earning')}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)',
            fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
            marginBottom: 24, padding: 0,
          }}
        >
          <ArrowLeft size={16} />
          {isRu ? 'Назад' : 'Back'}
        </button>

        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(52,211,153,0.2), rgba(52,211,153,0.06))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <Sparkles size={28} color={EMERALD} />
          </div>
          <h1 style={{ fontFamily: SYNE, fontSize: '1.6rem', fontWeight: 800, color: '#fff', marginBottom: 8 }}>
            {isRu ? 'Магазин скидок' : 'Discount Shop'}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', lineHeight: 1.5 }}>
            {isRu ? 'Обменяйте монеты на скидки для разработки' : 'Exchange coins for development discounts'}
          </p>
        </div>

        <div style={{
          display: 'flex', justifyContent: 'center', gap: 24,
          padding: '20px 0', marginBottom: 32,
          borderTop: '1px solid rgba(255,255,255,0.06)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 4 }}>
              <Coins size={18} color={EMERALD} />
              <span style={{ fontFamily: SYNE, fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>
                {balance.availableCoins.toLocaleString()}
              </span>
            </div>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              {isRu ? 'Доступно' : 'Available'}
            </span>
          </div>
          <div style={{ width: 1, background: 'rgba(255,255,255,0.08)' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 4 }}>
              <Gift size={18} color="rgba(255,255,255,0.4)" />
              <span style={{ fontFamily: SYNE, fontSize: '1.4rem', fontWeight: 800, color: 'rgba(255,255,255,0.6)' }}>
                {balance.spentCoins.toLocaleString()}
              </span>
            </div>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              {isRu ? 'Потрачено' : 'Spent'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {tiers.map((tier) => {
            const canAfford = balance.availableCoins >= tier.coins;
            const isLoading = redeeming === tier.id;

            return (
              <button
                key={tier.id}
                onClick={() => canAfford && !isLoading && handleRedeem(tier)}
                disabled={!canAfford || isLoading}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '16px 20px', borderRadius: 16,
                  background: canAfford
                    ? 'linear-gradient(135deg, rgba(52,211,153,0.08), rgba(52,211,153,0.03))'
                    : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${canAfford ? 'rgba(52,211,153,0.15)' : 'rgba(255,255,255,0.06)'}`,
                  cursor: canAfford ? 'pointer' : 'not-allowed',
                  opacity: canAfford ? 1 : 0.5,
                  textAlign: 'left',
                  width: '100%',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: canAfford
                      ? `linear-gradient(135deg, ${EMERALD}20, ${EMERALD}08)`
                      : 'rgba(255,255,255,0.04)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: canAfford ? EMERALD : 'rgba(255,255,255,0.3)' }}>
                      {tier.discount}%
                    </span>
                  </div>
                  <div>
                    <div style={{ fontFamily: SYNE, fontWeight: 700, fontSize: '0.95rem', color: '#fff', marginBottom: 2 }}>
                      {isRu ? tier.name : tier.nameEn}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Coins size={13} color={canAfford ? EMERALD : 'rgba(255,255,255,0.3)'} />
                      <span style={{ fontSize: '0.8rem', color: canAfford ? EMERALD : 'rgba(255,255,255,0.3)', fontWeight: 600 }}>
                        {tier.coins.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                <ChevronRight size={18} color={canAfford ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.15)'} />
              </button>
            );
          })}
        </div>

        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <button
            onClick={() => onNavigate('earning')}
            style={{
              padding: '12px 28px', borderRadius: 14,
              background: 'rgba(52,211,153,0.1)',
              border: '1px solid rgba(52,211,153,0.15)',
              color: EMERALD, fontWeight: 700, fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            {isRu ? 'Заработать больше монет' : 'Earn More Coins'}
          </button>
        </div>

      </div>
    </div>
  );
}
