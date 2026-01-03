import { useState } from "react";
import { 
  Coins, 
  Heart, 
  Share2, 
  Eye, 
  Play,
  Gift,
  Instagram,
  Target,
  Sparkles,
  Trophy,
  CheckCircle,
  ArrowLeft,
  Star,
  TrendingUp,
  Users,
  MessageCircle,
  Clock,
  Shield,
  Zap,
  DollarSign,
  Award
} from "lucide-react";
import StickyGlassHeader from "./ui/StickyGlassHeader";
import { useRewards } from "../contexts/RewardsContext";
import { useLanguage } from '../contexts/LanguageContext';

interface TasksPageProps {
  onNavigate: (section: string) => void;
}

const discountTiersBase = [
  { coins: 500, discount: 5 },
  { coins: 1000, discount: 10 },
  { coins: 2000, discount: 15 },
  { coins: 3500, discount: 20 },
  { coins: 5000, discount: 25 }
];

export default function TasksPage({ onNavigate }: TasksPageProps) {
  const { t } = useLanguage();
  const { userStats, tasks, completeTask, startTask, verifyTask } = useRewards();
  const [selectedTab, setSelectedTab] = useState<'tasks' | 'rewards'>('tasks');
  const [activeTask, setActiveTask] = useState<string | null>(null);
  const [showExchangeModal, setShowExchangeModal] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState<string>('');
  
  const discountTiers = discountTiersBase.map(tier => ({
    ...tier,
    label: `${tier.discount}% ${t('tasks.discount')}`
  }));

  const handleTaskClick = async (task: any) => {
    if (task.completed || task.verificationStatus === 'failed') return;
    
    // Check cooldown
    if (task.lastAttempt && Date.now() - task.lastAttempt < 30000) {
      setVerificationMessage(t('tasks.tooManyAttempts'));
      return;
    }
    
    // Check attempt limit
    if ((task.attempts || 0) >= 3) {
      setVerificationMessage(t('tasks.attemptLimitReached'));
      return;
    }
    
    setActiveTask(task.id);
    startTask(task.id);
    setVerificationMessage(t('tasks.taskStarted'));
    
    // Open social media link
    window.open(task.url, '_blank');
    
    // Start verification timer
    const verificationTimer = setTimeout(async () => {
      const success = await verifyTask(task.id);
      setActiveTask(null);
      
      if (success) {
        setVerificationMessage(t('tasks.taskCompleted').replace('{coins}', String(task.coins)));
      } else {
        const currentTask = tasks.find(t => t.id === task.id);
        if (currentTask?.verificationStatus === 'failed') {
          if ((currentTask.attempts || 0) >= 3) {
            setVerificationMessage(t('tasks.taskBlocked'));
          } else {
            setVerificationMessage(t('tasks.taskNotCompleted'));
          }
        }
      }
      
      // Clear message after 5 seconds
      setTimeout(() => setVerificationMessage(''), 5000);
    }, (task.minimumTime || 5) * 1000 + 2000); // Add 2 seconds buffer
    
    // Handle user returning early
    const handleVisibilityChange = () => {
      if (!document.hidden && activeTask === task.id) {
        // User returned to tab, trigger verification
        clearTimeout(verificationTimer);
        setTimeout(async () => {
          const success = await verifyTask(task.id);
          setActiveTask(null);
          
          if (success) {
            setVerificationMessage(t('tasks.taskCompleted').replace('{coins}', String(task.coins)));
          } else {
            setVerificationMessage(t('tasks.spendMoreTime'));
          }
          
          setTimeout(() => setVerificationMessage(''), 5000);
        }, 1000);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Cleanup
    setTimeout(() => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, 60000); // Remove listener after 1 minute
  };

  const getTaskIcon = (type: string, platform: string) => {
    if (platform === 'instagram') {
      switch (type) {
        case 'like': return <Heart className="w-5 h-5" />;
        case 'follow': return <Users className="w-5 h-5" />;
        case 'share': return <Share2 className="w-5 h-5" />;
        case 'comment': return <MessageCircle className="w-5 h-5" />;
        case 'view': return <Eye className="w-5 h-5" />;
        default: return <Eye className="w-5 h-5" />;
      }
    } else {
      switch (type) {
        case 'like': return <Heart className="w-5 h-5" />;
        case 'follow': return <Users className="w-5 h-5" />;
        case 'share': return <Share2 className="w-5 h-5" />;
        case 'comment': return <MessageCircle className="w-5 h-5" />;
        case 'view': return <Play className="w-5 h-5" />;
        default: return <Eye className="w-5 h-5" />;
      }
    }
  };

  const getAvailableDiscount = () => {
    const tier = discountTiers
      .slice()
      .reverse()
      .find(tier => userStats.totalCoins >= tier.coins);
    return tier || null;
  };

  const getNextTier = () => {
    const nextTier = discountTiers.find(tier => userStats.totalCoins < tier.coins);
    return nextTier;
  };

  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* Mobile Container */}
      <div className="max-w-md mx-auto bg-black min-h-screen relative pb-32">
        <StickyGlassHeader />
        
        {/* Header */}
        <div className="pt-24 px-6 pb-6">
          <button 
            onClick={() => onNavigate('')}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span className="font-medium">{t('tasks.back')}</span>
          </button>
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center bg-green-50 rounded-full px-4 py-2 mb-6">
              <Gift className="w-4 h-4 text-green-600 mr-2" />
              <span className="text-sm font-medium text-green-600">{t('tasks.earnUpTo25')}</span>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {t('tasks.title')}
            </h1>
            
            <p className="text-lg text-gray-600 mb-6">
              {t('tasks.subtitle')}
            </p>
          </div>
        </div>

        {/* How it works */}
        <div className="px-6 py-6 bg-gray-50 mx-6 rounded-3xl mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">{t('tasks.howItWorks')}</h2>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center">
                <Zap className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{t('tasks.completeTasks')}</h3>
                <p className="text-sm text-gray-600">{t('tasks.completeTasksDesc')}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-yellow-100 rounded-2xl flex items-center justify-center">
                <Coins className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{t('tasks.getCoins')}</h3>
                <p className="text-sm text-gray-600">{t('tasks.getCoinsDesc')}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-green-100 rounded-2xl flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{t('tasks.exchangeForDiscounts')}</h3>
                <p className="text-sm text-gray-600">{t('tasks.exchangeForDiscountsDesc')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Current Status */}
        <div className="px-6 mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-6">
            <div className="text-center mb-4">
              <h3 className="text-lg font-bold text-gray-900 mb-2">{t('tasks.yourStats')}</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center bg-white rounded-2xl py-4">
                <div className="text-2xl font-bold text-gray-900">{userStats.totalCoins}</div>
                <div className="text-sm text-gray-600">{t('tasks.coinsEarned')}</div>
              </div>
              <div className="text-center bg-white rounded-2xl py-4">
                <div className="text-2xl font-bold text-gray-900">{userStats.tasksCompleted}</div>
                <div className="text-sm text-gray-600">{t('tasks.tasksCompleted')}</div>
              </div>
            </div>
            
            <button 
              onClick={() => setShowExchangeModal(true)}
              className="w-full bg-black text-white py-3 rounded-2xl font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center"
            >
              <Award className="w-5 h-5 mr-2" />
              {t('tasks.exchangeForDiscount')}
            </button>
          </div>
        </div>

        {/* Available Discounts Preview */}
        {userStats.totalCoins >= 500 && (
          <div className="px-6 mb-8">
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-green-800">{t('tasks.enoughCoins')}</h3>
                  <p className="text-sm text-green-600">{t('tasks.exchangeUpTo').replace('{discount}', String(getAvailableDiscount()?.discount))}</p>
                </div>
                <Trophy className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>
        )}

        {/* Verification Message */}
        {verificationMessage && (
          <div className="mx-6 mb-6 p-4 bg-blue-50 border border-blue-200 rounded-2xl">
            <p className="text-blue-800 text-center font-medium">{verificationMessage}</p>
          </div>
        )}

        {/* Tasks List */}
        <div className="px-6 space-y-4 mb-8">
          <h2 className="text-xl font-bold text-gray-900 text-center mb-6">{t('tasks.availableTasks')}</h2>
          
          {tasks.map((task, index) => {
            const isBlocked = task.verificationStatus === 'failed' && (task.attempts || 0) >= 3;
            const isOnCooldown = task.lastAttempt && Date.now() - task.lastAttempt < 30000;
            
            return (
              <div key={task.id} className={`relative bg-white border-2 border-gray-100 rounded-2xl p-5 transition-all ${
                task.completed ? 'bg-green-50 border-green-200' : 
                isBlocked ? 'opacity-40 cursor-not-allowed' :
                isOnCooldown ? 'opacity-70 cursor-wait' :
                'cursor-pointer hover:border-gray-200 hover:shadow-lg'
              }`} onClick={() => !task.completed && !isBlocked && !isOnCooldown && handleTaskClick(task)}>
                
                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  {isBlocked && (
                    <div className="bg-red-100 text-red-700 text-xs px-3 py-1 rounded-full font-medium">
                      {t('tasks.blocked')}
                    </div>
                  )}
                  
                  {isOnCooldown && !task.completed && (
                    <div className="bg-yellow-100 text-yellow-700 text-xs px-3 py-1 rounded-full font-medium">
                      {t('tasks.waiting')}
                    </div>
                  )}
                  
                  {task.verificationStatus === 'verifying' && (
                    <div className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full font-medium animate-pulse">
                      {t('tasks.verifying')}
                    </div>
                  )}

                  {task.completed && (
                    <div className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-medium flex items-center">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      {t('tasks.completed')}
                    </div>
                  )}
                  
                  {!task.completed && !isBlocked && !isOnCooldown && task.verificationStatus !== 'verifying' && (
                    <div className="bg-yellow-100 text-yellow-700 text-xs px-3 py-1 rounded-full font-medium flex items-center">
                      <Coins className="w-3 h-3 mr-1" />
                      +{task.coins}
                    </div>
                  )}
                </div>

                {/* Task Content */}
                <div className="pr-20">
                  <div className="flex items-center space-x-4 mb-3">
                    {/* Platform Icon */}
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      task.completed ? 'bg-green-500' :
                      task.platform === 'instagram' ? 'bg-pink-500' : 
                      'bg-gray-900'
                    } text-white`}>
                      {task.completed ? <CheckCircle className="w-6 h-6" /> : getTaskIcon(task.type, task.platform)}
                    </div>
                    
                    {/* Task Info */}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{task.title}</h3>
                      <p className="text-gray-600 text-sm">{task.description}</p>
                    </div>
                  </div>

                  {/* Task Meta */}
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    {task.timeLimit && (
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {task.timeLimit} {t('tasks.min')}
                      </span>
                    )}
                    {task.minimumTime && !task.completed && (
                      <span className="flex items-center">
                        <Shield className="w-3 h-3 mr-1" />
                        {t('tasks.minTime').replace('{time}', String(task.minimumTime))}
                      </span>
                    )}
                    {(task.attempts || 0) > 0 && !task.completed && (
                      <span className="flex items-center">
                        <Target className="w-3 h-3 mr-1" />
                        {task.attempts}/3 {t('tasks.attempts')}
                      </span>
                    )}
                    {activeTask === task.id && (
                      <span className="text-blue-600 font-medium animate-pulse">
                        {t('tasks.inProgress')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Exchange Modal */}
        {showExchangeModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full max-h-[80vh] overflow-y-auto">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('tasks.exchangeCoins')}</h3>
                <p className="text-gray-600">{t('tasks.youHaveCoins').replace('{coins}', String(userStats.totalCoins))}</p>
              </div>
              
              <div className="space-y-4 mb-6">
                {discountTiers.map((tier, index) => {
                  const canAfford = userStats.totalCoins >= tier.coins;
                  return (
                    <div key={index} className={`p-4 rounded-2xl border-2 transition-all ${
                      canAfford ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-gray-50 opacity-60'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-bold text-lg">{tier.label}</div>
                          <div className="text-sm text-gray-600">{tier.coins} {t('tasks.coins')}</div>
                        </div>
                        <button 
                          disabled={!canAfford}
                          className={`px-4 py-2 rounded-xl font-bold transition-all ${
                            canAfford ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          {canAfford ? t('tasks.exchange') : t('tasks.notEnough')}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <button 
                onClick={() => setShowExchangeModal(false)}
                className="w-full bg-gray-500 text-white py-3 rounded-2xl font-bold hover:bg-gray-600 transition-all"
              >
                {t('tasks.close')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}