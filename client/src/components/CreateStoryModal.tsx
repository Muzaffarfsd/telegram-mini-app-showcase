import { useState, useRef, useCallback, memo } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { X, Camera, Video, Upload, Loader2, Check, ImagePlus } from 'lucide-react';
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

const categories = [
  { id: 'general', label: { en: 'General', ru: 'Общее' } },
  { id: 'fashion', label: { en: 'Fashion', ru: 'Мода' } },
  { id: 'food', label: { en: 'Food', ru: 'Еда' } },
  { id: 'fitness', label: { en: 'Fitness', ru: 'Фитнес' } },
  { id: 'realestate', label: { en: 'Real Estate', ru: 'Недвижимость' } },
  { id: 'ai', label: { en: 'AI & Tech', ru: 'AI и Технологии' } },
];

export const CreateStoryModal = memo(function CreateStoryModal({ isOpen, onClose }: CreateStoryModalProps) {
  const { language } = useLanguage();
  const haptic = useHaptic();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('general');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const resetForm = useCallback(() => {
    setTitle('');
    setDescription('');
    setCategory('general');
    setMediaType('image');
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadProgress(0);
    setIsUploading(false);
  }, []);

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
            className="w-full max-w-lg bg-surface-elevated rounded-t-3xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-separator">
              <h2 
                className="text-lg font-bold text-primary"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                {language === 'ru' ? 'Создать сторис' : 'Create Story'}
              </h2>
              <button
                onClick={handleClose}
                className="w-8 h-8 rounded-full bg-fill-tertiary flex items-center justify-center"
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
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full aspect-[9/16] max-h-[300px] rounded-2xl border-2 border-dashed border-separator flex flex-col items-center justify-center gap-3 bg-fill-tertiary/30 hover:bg-fill-tertiary/50 transition-colors"
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
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={language === 'ru' ? 'Название вашего сторис' : 'Your story title'}
                  maxLength={100}
                  className="bg-fill-tertiary border-0"
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
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={language === 'ru' ? 'Расскажите подробнее...' : 'Tell us more...'}
                  maxLength={500}
                  rows={2}
                  className="bg-fill-tertiary border-0 resize-none"
                />
              </div>
              
              <div className="space-y-2">
                <label 
                  className="text-xs font-medium text-label-secondary"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  {language === 'ru' ? 'Категория' : 'Category'}
                </label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setCategory(cat.id);
                        haptic.selection();
                      }}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        category === cat.id
                          ? 'bg-system-blue text-white'
                          : 'bg-fill-tertiary text-label-secondary hover:bg-fill-secondary'
                      }`}
                    >
                      {cat.label[language as 'en' | 'ru']}
                    </button>
                  ))}
                </div>
              </div>
              
              {isUploading && (
                <div className="space-y-2">
                  <div className="h-1 bg-fill-tertiary rounded-full overflow-hidden">
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
