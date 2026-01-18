import { useState, useRef, useCallback, memo, useEffect, useMemo } from 'react';
import { X, Camera, Video, ImagePlus, Hash, MapPin, Link2, ChevronDown, Store, Smartphone, Sparkles, UtensilsCrossed, Dumbbell, Home, Plane, GraduationCap, Car, PawPrint, Stethoscope, Flower2, Brush, Package, PartyPopper, Scale, Wallet, Bot, Lightbulb, Star, BarChart3, Handshake, Rocket, Trophy, HelpCircle, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useHaptic } from '@/hooks/useHaptic';
import { useLanguage } from '@/contexts/LanguageContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface CreateStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type DemoOption = {
  id: string;
  title: { en: string; ru: string };
  Icon: LucideIcon;
};

type Category = {
  id: string;
  label: { en: string; ru: string };
  Icon: LucideIcon;
  color: string;
};

const DEMO_OPTIONS: DemoOption[] = [
  { id: 'clothing-store', title: { en: 'Fashion Store', ru: 'Магазин одежды' }, Icon: Store },
  { id: 'electronics', title: { en: 'Electronics', ru: 'Электроника' }, Icon: Smartphone },
  { id: 'beauty', title: { en: 'Beauty Salon', ru: 'Салон красоты' }, Icon: Sparkles },
  { id: 'restaurant', title: { en: 'Restaurant', ru: 'Ресторан' }, Icon: UtensilsCrossed },
  { id: 'fitness', title: { en: 'Fitness Club', ru: 'Фитнес клуб' }, Icon: Dumbbell },
  { id: 'real-estate', title: { en: 'Real Estate', ru: 'Недвижимость' }, Icon: Home },
  { id: 'travel', title: { en: 'Travel Agency', ru: 'Турагентство' }, Icon: Plane },
  { id: 'education', title: { en: 'Education', ru: 'Образование' }, Icon: GraduationCap },
  { id: 'auto', title: { en: 'Auto Service', ru: 'Автосервис' }, Icon: Car },
  { id: 'pets', title: { en: 'Pet Shop', ru: 'Зоомагазин' }, Icon: PawPrint },
  { id: 'medical', title: { en: 'Medical', ru: 'Медицина' }, Icon: Stethoscope },
  { id: 'flowers', title: { en: 'Flowers', ru: 'Цветы' }, Icon: Flower2 },
  { id: 'cleaning', title: { en: 'Cleaning', ru: 'Уборка' }, Icon: Brush },
  { id: 'delivery', title: { en: 'Delivery', ru: 'Доставка' }, Icon: Package },
  { id: 'events', title: { en: 'Events', ru: 'Мероприятия' }, Icon: PartyPopper },
  { id: 'lawyer', title: { en: 'Legal', ru: 'Юрист' }, Icon: Scale },
  { id: 'finance', title: { en: 'Finance', ru: 'Финансы' }, Icon: Wallet },
  { id: 'ai-agent', title: { en: 'AI Agent', ru: 'AI Агент' }, Icon: Bot },
];

const CATEGORIES: Category[] = [
  { id: 'my-business', label: { en: 'My Business', ru: 'Мой бизнес' }, Icon: Store, color: 'from-emerald-500 to-teal-500' },
  { id: 'idea', label: { en: 'App Idea', ru: 'Идея приложения' }, Icon: Lightbulb, color: 'from-amber-500 to-orange-500' },
  { id: 'review', label: { en: 'Review', ru: 'Отзыв' }, Icon: Star, color: 'from-yellow-500 to-amber-500' },
  { id: 'before-after', label: { en: 'Before/After', ru: 'До/После' }, Icon: BarChart3, color: 'from-blue-500 to-indigo-500' },
  { id: 'looking-for', label: { en: 'Looking For', ru: 'Ищу партнёра' }, Icon: Handshake, color: 'from-purple-500 to-pink-500' },
  { id: 'lifehack', label: { en: 'Lifehack', ru: 'Лайфхак' }, Icon: Rocket, color: 'from-cyan-500 to-blue-500' },
  { id: 'achievement', label: { en: 'Achievement', ru: 'Достижение' }, Icon: Trophy, color: 'from-yellow-400 to-orange-500' },
  { id: 'question', label: { en: 'Question', ru: 'Вопрос' }, Icon: HelpCircle, color: 'from-pink-500 to-rose-500' },
];

const CategoryButton = memo(function CategoryButton({ 
  cat, 
  isSelected, 
  language, 
  onSelect 
}: { 
  cat: Category; 
  isSelected: boolean; 
  language: string; 
  onSelect: () => void;
}) {
  const CatIcon = cat.Icon;
  return (
    <button
      data-testid={`button-category-${cat.id}`}
      onClick={onSelect}
      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium ${
        isSelected
          ? `bg-gradient-to-r ${cat.color} text-white shadow-md`
          : 'bg-secondary text-foreground'
      }`}
    >
      <CatIcon className="w-4 h-4" />
      <span className="truncate">{cat.label[language as 'en' | 'ru']}</span>
    </button>
  );
});

const DemoItem = memo(function DemoItem({
  demo,
  isSelected,
  language,
  onSelect,
}: {
  demo: DemoOption;
  isSelected: boolean;
  language: string;
  onSelect: () => void;
}) {
  const DemoIcon = demo.Icon;
  return (
    <button
      data-testid={`button-demo-${demo.id}`}
      onClick={onSelect}
      className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 ${
        isSelected ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-secondary'
      }`}
    >
      <DemoIcon className="w-4 h-4" />
      <span className="truncate">{demo.title[language as 'en' | 'ru']}</span>
    </button>
  );
});

export const CreateStoryModal = memo(function CreateStoryModal({ isOpen, onClose }: CreateStoryModalProps) {
  const { language } = useLanguage();
  const haptic = useHaptic();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('my-business');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [hashtagInput, setHashtagInput] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [linkedDemoId, setLinkedDemoId] = useState<string | null>(null);
  const [location, setLocation] = useState('');
  const [showDemoSelector, setShowDemoSelector] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const resetForm = useCallback(() => {
    setTitle('');
    setDescription('');
    setCategory('my-business');
    setMediaType('image');
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadProgress(0);
    setIsUploading(false);
    setHashtagInput('');
    setHashtags([]);
    setLinkedDemoId(null);
    setLocation('');
    setShowDemoSelector(false);
  }, []);

  const handleAddHashtag = useCallback(() => {
    const tag = hashtagInput.trim().replace(/^#/, '').replace(/[^a-zA-Zа-яА-Я0-9_]/g, '');
    if (tag && hashtags.length < 10 && !hashtags.includes(tag)) {
      setHashtags(prev => [...prev, tag]);
      setHashtagInput('');
      haptic.light();
    }
  }, [hashtagInput, hashtags, haptic]);

  const handleRemoveHashtag = useCallback((tag: string) => {
    setHashtags(prev => prev.filter(t => t !== tag));
    haptic.light();
  }, [haptic]);

  const handleClose = useCallback(() => {
    haptic.light();
    resetForm();
    onClose();
  }, [haptic, onClose, resetForm]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    haptic.light();
    setSelectedFile(file);
    setMediaType(file.type.startsWith('video/') ? 'video' : 'image');
    setPreviewUrl(URL.createObjectURL(file));
  }, [haptic]);

  const handleCategorySelect = useCallback((catId: string) => {
    setCategory(catId);
    haptic.selection();
  }, [haptic]);

  const handleDemoSelect = useCallback((demoId: string | null) => {
    setLinkedDemoId(demoId);
    setShowDemoSelector(false);
    haptic.light();
  }, [haptic]);

  const createStoryMutation = useMutation({
    mutationFn: async () => {
      if (!selectedFile) throw new Error('No file selected');
      
      setIsUploading(true);
      setUploadProgress(10);
      
      const uploadUrlResponse = await apiRequest('POST', '/api/user-stories/upload-url', {});
      const { uploadURL } = await uploadUrlResponse.json();
      
      setUploadProgress(30);
      
      await fetch(uploadURL, {
        method: 'PUT',
        body: selectedFile,
        headers: { 'Content-Type': selectedFile.type },
      });
      
      setUploadProgress(70);
      
      const storyResponse = await apiRequest('POST', '/api/user-stories', {
        title,
        description: description || null,
        mediaType,
        mediaUrl: uploadURL,
        category,
        hashtags,
        linkedDemoId,
        location: location || null,
      });
      
      setUploadProgress(100);
      return storyResponse.json();
    },
    onSuccess: () => {
      haptic.success();
      queryClient.invalidateQueries({ queryKey: ['/api/user-stories'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user-stories/my'] });
      handleClose();
    },
    onError: (error) => {
      console.error('Failed to create story:', error);
      haptic.error();
      setIsUploading(false);
    },
  });

  const handleSubmit = useCallback(() => {
    if (!title.trim() || !selectedFile) return;
    haptic.medium();
    createStoryMutation.mutate();
  }, [title, selectedFile, haptic, createStoryMutation]);

  const isValid = title.trim().length > 0 && selectedFile !== null;

  const selectedDemoTitle = useMemo(() => {
    if (!linkedDemoId) return null;
    const demo = DEMO_OPTIONS.find(d => d.id === linkedDemoId);
    return demo?.title?.[language as 'en' | 'ru']?.slice(0, 15) || linkedDemoId;
  }, [linkedDemoId, language]);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      const raf = requestAnimationFrame(() => setIsVisible(true));
      return () => cancelAnimationFrame(raf);
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => setIsAnimating(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen && !isAnimating) return null;

  return (
    <div
      className={`fixed inset-0 z-[1000] bg-black/70 flex items-end justify-center ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ transition: 'opacity 150ms ease-out' }}
      onClick={handleClose}
    >
      <div
        className="w-full max-w-lg bg-background border-t border-border rounded-t-2xl overflow-hidden shadow-2xl"
        style={{ 
          transform: isVisible ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 200ms cubic-bezier(0.32, 0.72, 0, 1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-bold text-foreground" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            {language === 'ru' ? 'Создать сторис' : 'Create Story'}
          </h2>
          <button
            data-testid="button-close-create-story"
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        
        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto overscroll-contain">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          {!previewUrl ? (
            <button
              data-testid="button-select-media"
              onClick={() => fileInputRef.current?.click()}
              className="w-full aspect-[9/16] max-h-[250px] rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-3 bg-secondary/50"
            >
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <ImagePlus className="w-7 h-7 text-primary" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {language === 'ru' ? 'Добавить фото или видео' : 'Add photo or video'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {language === 'ru' ? 'Нажмите для выбора' : 'Tap to select'}
                </p>
              </div>
            </button>
          ) : (
            <div className="relative w-full aspect-[9/16] max-h-[250px] rounded-xl overflow-hidden bg-black">
              {mediaType === 'video' ? (
                <video src={previewUrl} className="w-full h-full object-cover" controls />
              ) : (
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" loading="eager" />
              )}
              <button
                data-testid="button-remove-preview"
                onClick={() => { setSelectedFile(null); setPreviewUrl(null); haptic.light(); }}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center"
              >
                <X className="w-4 h-4 text-white" />
              </button>
              <div className="absolute bottom-2 left-2 px-2 py-1 rounded-full bg-black/50 flex items-center gap-1">
                {mediaType === 'video' ? <Video className="w-3 h-3 text-white" /> : <Camera className="w-3 h-3 text-white" />}
                <span className="text-xs text-white capitalize">{mediaType}</span>
              </div>
            </div>
          )}
          
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {language === 'ru' ? 'Заголовок' : 'Title'}
            </label>
            <Input
              data-testid="input-story-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={language === 'ru' ? 'Название вашего сторис' : 'Your story title'}
              maxLength={100}
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {language === 'ru' ? 'Описание (опционально)' : 'Description (optional)'}
            </label>
            <Textarea
              data-testid="input-story-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={language === 'ru' ? 'Расскажите подробнее...' : 'Tell us more...'}
              maxLength={500}
              rows={2}
              className="resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              <Hash className="w-3 h-3" />
              {language === 'ru' ? 'Хэштеги' : 'Hashtags'}
              <span className="opacity-60">({hashtags.length}/10)</span>
            </label>
            <div className="flex gap-2">
              <Input
                data-testid="input-hashtag"
                value={hashtagInput}
                onChange={(e) => setHashtagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddHashtag())}
                placeholder={language === 'ru' ? '#бизнес' : '#business'}
                maxLength={30}
                className="flex-1"
              />
              <Button
                data-testid="button-add-hashtag"
                type="button"
                onClick={handleAddHashtag}
                disabled={!hashtagInput.trim() || hashtags.length >= 10}
                size="sm"
                variant="secondary"
              >
                +
              </Button>
            </div>
            {hashtags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {hashtags.map(tag => (
                  <button
                    key={tag}
                    data-testid={`button-remove-hashtag-${tag}`}
                    onClick={() => handleRemoveHashtag(tag)}
                    className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium flex items-center gap-1"
                  >
                    #{tag}
                    <X className="w-3 h-3" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                <MapPin className="w-3 h-3" />
                {language === 'ru' ? 'Город' : 'Location'}
              </label>
              <Input
                data-testid="input-location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={language === 'ru' ? 'Москва' : 'Moscow'}
                maxLength={100}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                <Link2 className="w-3 h-3" />
                {language === 'ru' ? 'Связать с демо' : 'Link to demo'}
              </label>
              <div className="relative">
                <button
                  data-testid="button-select-demo"
                  type="button"
                  onClick={() => setShowDemoSelector(!showDemoSelector)}
                  className="w-full h-9 px-3 rounded-lg bg-secondary border border-border text-left text-sm flex items-center justify-between"
                >
                  <span className={linkedDemoId ? 'text-foreground' : 'text-muted-foreground'}>
                    {selectedDemoTitle || (language === 'ru' ? 'Выбрать' : 'Select')}
                  </span>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </button>
                {showDemoSelector && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-background rounded-xl shadow-xl border border-border z-50 max-h-48 overflow-y-auto overscroll-contain">
                    <button
                      data-testid="button-demo-none"
                      onClick={() => handleDemoSelect(null)}
                      className="w-full px-3 py-2 text-left text-sm text-muted-foreground hover:bg-secondary"
                    >
                      {language === 'ru' ? 'Без привязки' : 'No link'}
                    </button>
                    {DEMO_OPTIONS.map(demo => (
                      <DemoItem
                        key={demo.id}
                        demo={demo}
                        isSelected={linkedDemoId === demo.id}
                        language={language}
                        onSelect={() => handleDemoSelect(demo.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {language === 'ru' ? 'Тип контента' : 'Content Type'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((cat) => (
                <CategoryButton
                  key={cat.id}
                  cat={cat}
                  isSelected={category === cat.id}
                  language={language}
                  onSelect={() => handleCategorySelect(cat.id)}
                />
              ))}
            </div>
          </div>
          
          {isUploading && (
            <div className="space-y-2">
              <div className="h-1 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary"
                  style={{ width: `${uploadProgress}%`, transition: 'width 200ms ease-out' }}
                />
              </div>
              <p className="text-xs text-muted-foreground text-center">
                {language === 'ru' ? 'Загрузка...' : 'Uploading...'} {uploadProgress}%
              </p>
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-border">
          <Button
            data-testid="button-submit-story"
            onClick={handleSubmit}
            disabled={!isValid || isUploading}
            className="w-full"
          >
            {isUploading 
              ? (language === 'ru' ? 'Загрузка...' : 'Uploading...') 
              : (language === 'ru' ? 'Опубликовать' : 'Publish')}
          </Button>
        </div>
      </div>
    </div>
  );
});
