import { useState, useRef, useCallback, memo } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { X, Camera, Video, Upload, Loader2, ImagePlus, Hash, MapPin, Link2, ChevronDown, Store, Smartphone, Sparkles, UtensilsCrossed, Dumbbell, Home, Plane, GraduationCap, Car, PawPrint, Stethoscope, Flower2, Brush, Package, PartyPopper, Scale, Wallet, Bot, Lightbulb, Star, BarChart3, Handshake, Rocket, Trophy, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useHaptic } from '@/hooks/useHaptic';
import { useLanguage } from '@/contexts/LanguageContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

const demoOptions = [
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

interface CreateStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const categories = [
  { id: 'my-business', label: { en: 'My Business', ru: 'Мой бизнес' }, Icon: Store, color: 'from-emerald-500 to-teal-500' },
  { id: 'idea', label: { en: 'App Idea', ru: 'Идея приложения' }, Icon: Lightbulb, color: 'from-amber-500 to-orange-500' },
  { id: 'review', label: { en: 'Review', ru: 'Отзыв' }, Icon: Star, color: 'from-yellow-500 to-amber-500' },
  { id: 'before-after', label: { en: 'Before/After', ru: 'До/После' }, Icon: BarChart3, color: 'from-blue-500 to-indigo-500' },
  { id: 'looking-for', label: { en: 'Looking For', ru: 'Ищу партнёра' }, Icon: Handshake, color: 'from-purple-500 to-pink-500' },
  { id: 'lifehack', label: { en: 'Lifehack', ru: 'Лайфхак' }, Icon: Rocket, color: 'from-cyan-500 to-blue-500' },
  { id: 'achievement', label: { en: 'Achievement', ru: 'Достижение' }, Icon: Trophy, color: 'from-yellow-400 to-orange-500' },
  { id: 'question', label: { en: 'Question', ru: 'Вопрос' }, Icon: HelpCircle, color: 'from-pink-500 to-rose-500' },
];

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
    
    const isVideo = file.type.startsWith('video/');
    setMediaType(isVideo ? 'video' : 'image');
    
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
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
        headers: {
          'Content-Type': selectedFile.type,
        },
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

  return (
    <AnimatePresence>
      {isOpen && (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-xl flex items-end justify-center"
          onClick={handleClose}
        >
          <m.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-lg bg-white/80 dark:bg-black/70 backdrop-blur-2xl border-t border-white/30 dark:border-white/10 rounded-t-3xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-white/20 dark:border-white/10">
              <h2 
                className="text-lg font-bold text-primary"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                {language === 'ru' ? 'Создать сторис' : 'Create Story'}
              </h2>
              <button
                data-testid="button-close-create-story"
                onClick={handleClose}
                className="w-8 h-8 rounded-full bg-white/60 dark:bg-white/15 backdrop-blur-xl border border-white/20 dark:border-white/10 flex items-center justify-center"
              >
                <X className="w-4 h-4 text-label-secondary" />
              </button>
            </div>
            
            <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
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
                  className="w-full aspect-[9/16] max-h-[300px] rounded-2xl border-2 border-dashed border-white/30 dark:border-white/10 flex flex-col items-center justify-center gap-3 bg-white/30 dark:bg-white/5 backdrop-blur-xl hover:bg-white/40 dark:hover:bg-white/10 transition-colors"
                >
                  <div className="w-16 h-16 rounded-full bg-system-blue/10 flex items-center justify-center">
                    <ImagePlus className="w-8 h-8 text-system-blue" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-primary" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      {language === 'ru' ? 'Добавить фото или видео' : 'Add photo or video'}
                    </p>
                    <p className="text-xs text-label-secondary mt-1">
                      {language === 'ru' ? 'Нажмите для выбора' : 'Tap to select'}
                    </p>
                  </div>
                </button>
              ) : (
                <div className="relative w-full aspect-[9/16] max-h-[300px] rounded-2xl overflow-hidden bg-black">
                  {mediaType === 'video' ? (
                    <video 
                      src={previewUrl} 
                      className="w-full h-full object-cover"
                      controls
                    />
                  ) : (
                    <img 
                      src={previewUrl} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                    />
                  )}
                  <button
                    data-testid="button-remove-preview"
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(null);
                      haptic.light();
                    }}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                  <div className="absolute bottom-2 left-2 px-2 py-1 rounded-full bg-black/50 backdrop-blur-sm flex items-center gap-1">
                    {mediaType === 'video' ? (
                      <Video className="w-3 h-3 text-white" />
                    ) : (
                      <Camera className="w-3 h-3 text-white" />
                    )}
                    <span className="text-xs text-white capitalize">{mediaType}</span>
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <label 
                  className="text-xs font-medium text-label-secondary"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  {language === 'ru' ? 'Заголовок' : 'Title'}
                </label>
                <Input
                  data-testid="input-story-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={language === 'ru' ? 'Название вашего сторис' : 'Your story title'}
                  maxLength={100}
                  className="bg-white/60 dark:bg-white/15 backdrop-blur-xl border border-white/20 dark:border-white/10 placeholder:text-foreground/40"
                />
              </div>
              
              <div className="space-y-2">
                <label 
                  className="text-xs font-medium text-label-secondary"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  {language === 'ru' ? 'Описание (опционально)' : 'Description (optional)'}
                </label>
                <Textarea
                  data-testid="input-story-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={language === 'ru' ? 'Расскажите подробнее...' : 'Tell us more...'}
                  maxLength={500}
                  rows={2}
                  className="bg-white/60 dark:bg-white/15 backdrop-blur-xl border border-white/20 dark:border-white/10 placeholder:text-foreground/40 resize-none"
                />
              </div>

              <div className="space-y-2">
                <label 
                  className="text-xs font-medium text-label-secondary flex items-center gap-1"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  <Hash className="w-3 h-3" />
                  {language === 'ru' ? 'Хэштеги' : 'Hashtags'}
                  <span className="text-label-tertiary">({hashtags.length}/10)</span>
                </label>
                <div className="flex gap-2">
                  <Input
                    data-testid="input-hashtag"
                    value={hashtagInput}
                    onChange={(e) => setHashtagInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddHashtag())}
                    placeholder={language === 'ru' ? '#бизнес' : '#business'}
                    maxLength={30}
                    className="bg-white/60 dark:bg-white/15 backdrop-blur-xl border border-white/20 dark:border-white/10 placeholder:text-foreground/40 flex-1"
                  />
                  <Button
                    data-testid="button-add-hashtag"
                    type="button"
                    onClick={handleAddHashtag}
                    disabled={!hashtagInput.trim() || hashtags.length >= 10}
                    size="sm"
                    variant="secondary"
                    className="shrink-0"
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
                        className="px-2 py-1 rounded-full bg-system-blue/20 dark:bg-system-blue/30 backdrop-blur-sm border border-system-blue/30 text-system-blue text-xs font-medium flex items-center gap-1 hover:bg-system-blue/30 dark:hover:bg-system-blue/40 transition-colors"
                      >
                        #{tag}
                        <X className="w-3 h-3" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label 
                    className="text-xs font-medium text-label-secondary flex items-center gap-1"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    <MapPin className="w-3 h-3" />
                    {language === 'ru' ? 'Город' : 'Location'}
                  </label>
                  <Input
                    data-testid="input-location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder={language === 'ru' ? 'Москва' : 'Moscow'}
                    maxLength={100}
                    className="bg-white/60 dark:bg-white/15 backdrop-blur-xl border border-white/20 dark:border-white/10 placeholder:text-foreground/40"
                  />
                </div>

                <div className="space-y-2">
                  <label 
                    className="text-xs font-medium text-label-secondary flex items-center gap-1"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    <Link2 className="w-3 h-3" />
                    {language === 'ru' ? 'Связать с демо' : 'Link to demo'}
                  </label>
                  <div className="relative">
                    <button
                      data-testid="button-select-demo"
                      type="button"
                      onClick={() => setShowDemoSelector(!showDemoSelector)}
                      className="w-full h-9 px-3 rounded-lg bg-white/60 dark:bg-white/15 backdrop-blur-xl border border-white/20 dark:border-white/10 text-left text-sm flex items-center justify-between"
                    >
                      <span className={linkedDemoId ? 'text-primary' : 'text-label-tertiary'}>
                        {linkedDemoId 
                          ? demoOptions.find(d => d.id === linkedDemoId)?.title?.[language as 'en' | 'ru']?.slice(0, 15) || linkedDemoId
                          : (language === 'ru' ? 'Выбрать' : 'Select')}
                      </span>
                      <ChevronDown className="w-4 h-4 text-label-tertiary" />
                    </button>
                    {showDemoSelector && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white/80 dark:bg-black/80 backdrop-blur-2xl rounded-xl shadow-xl border border-white/30 dark:border-white/10 z-50 max-h-48 overflow-y-auto">
                        <button
                          data-testid="button-demo-none"
                          onClick={() => { setLinkedDemoId(null); setShowDemoSelector(false); haptic.light(); }}
                          className="w-full px-3 py-2 text-left text-sm text-label-secondary hover:bg-white/30 dark:hover:bg-white/10 transition-colors"
                        >
                          {language === 'ru' ? 'Без привязки' : 'No link'}
                        </button>
                        {demoOptions.map(demo => {
                          const DemoIcon = demo.Icon;
                          return (
                            <button
                              key={demo.id}
                              data-testid={`button-demo-${demo.id}`}
                              onClick={() => { setLinkedDemoId(demo.id); setShowDemoSelector(false); haptic.light(); }}
                              className={`w-full px-3 py-2 text-left text-sm hover:bg-white/30 dark:hover:bg-white/10 transition-colors flex items-center gap-2 ${
                                linkedDemoId === demo.id ? 'bg-system-blue/20 text-system-blue' : 'text-primary'
                              }`}
                            >
                              <DemoIcon className="w-4 h-4" />
                              <span className="truncate">{demo.title[language as 'en' | 'ru']}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <label 
                  className="text-xs font-medium text-label-secondary"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  {language === 'ru' ? 'Тип контента' : 'Content Type'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((cat) => {
                    const CatIcon = cat.Icon;
                    return (
                      <button
                        key={cat.id}
                        data-testid={`button-category-${cat.id}`}
                        onClick={() => {
                          setCategory(cat.id);
                          haptic.selection();
                        }}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          category === cat.id
                            ? `bg-gradient-to-r ${cat.color} text-white shadow-lg backdrop-blur-xl`
                            : 'bg-white/60 dark:bg-white/15 backdrop-blur-xl border border-white/20 dark:border-white/10 text-label-primary hover:bg-white/70 dark:hover:bg-white/20'
                        }`}
                      >
                        <CatIcon className="w-4 h-4" />
                        <span className="truncate">{cat.label[language as 'en' | 'ru']}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              
              {isUploading && (
                <div className="space-y-2">
                  <div className="h-1 bg-white/30 dark:bg-white/10 backdrop-blur-sm rounded-full overflow-hidden">
                    <m.div 
                      className="h-full bg-gradient-to-r from-system-blue to-system-purple"
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <p className="text-xs text-label-secondary text-center">
                    {language === 'ru' ? 'Загрузка...' : 'Uploading...'} {uploadProgress}%
                  </p>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-separator">
              <Button
                data-testid="button-publish-story"
                onClick={handleSubmit}
                disabled={!isValid || isUploading}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-system-blue to-system-purple text-white font-semibold disabled:opacity-50"
              >
                {isUploading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Upload className="w-5 h-5 mr-2" />
                    {language === 'ru' ? 'Опубликовать' : 'Publish'}
                  </>
                )}
              </Button>
              <p className="text-xs text-label-tertiary text-center mt-2">
                {language === 'ru' 
                  ? 'Сторис появится после проверки модератором'
                  : 'Story will appear after moderator review'}
              </p>
            </div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
});
