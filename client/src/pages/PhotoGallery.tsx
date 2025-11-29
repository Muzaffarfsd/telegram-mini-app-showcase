import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ObjectUploader } from "@/components/ObjectUploader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Upload, Trash2, X } from "lucide-react";

interface Photo {
  id: number;
  title: string;
  description: string | null;
  objectPath: string;
  thumbnailPath: string | null;
  uploadedAt: string;
  userId: string | null;
}

/**
 * PhotoGallery - Оптимизированная страница фотогалереи
 * 
 * Особенности:
 * - Мгновенная загрузка фотографий из PostgreSQL
 * - Прямая загрузка в Object Storage через presigned URLs
 * - Glassmorphism дизайн (2025 trending dark theme)
 * - Масонная сетка с lazy loading
 * - Fullscreen preview с метаданными
 */
export default function PhotoGallery() {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string>("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });

  const queryClient = useQueryClient();

  // Fetch all photos
  const { data: photos = [], isLoading } = useQuery<Photo[]>({
    queryKey: ["/api/photos"],
  });

  // Delete photo mutation
  const deleteMutation = useMutation({
    mutationFn: async (photoId: number) => {
      return apiRequest("DELETE", `/api/photos/${photoId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/photos"] });
      setSelectedPhoto(null);
    },
  });

  // Create photo mutation
  const createPhotoMutation = useMutation({
    mutationFn: async (data: { title: string; description: string; objectPath: string }) => {
      return apiRequest("POST", "/api/photos", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/photos"] });
      setShowUploadForm(false);
      setUploadedFileUrl("");
      setFormData({ title: "", description: "" });
    },
  });

  // Handle photo upload complete
  const handleUploadComplete = (result: any) => {
    // Get the full signed URL - backend will normalize it to permanent path
    const uploadedUrl = result.successful?.[0]?.uploadURL;
    if (uploadedUrl) {
      setUploadedFileUrl(uploadedUrl);
      setShowUploadForm(true);
    }
  };

  // Get presigned upload URL
  const getUploadUrl = async () => {
    const response = await fetch("/api/photos/upload-url", {
      method: "POST",
    });
    const data = await response.json();
    return {
      method: "PUT" as const,
      url: data.uploadURL,
    };
  };

  // Submit photo metadata
  const handleSubmitMetadata = () => {
    if (!uploadedFileUrl || !formData.title) return;
    
    createPhotoMutation.mutate({
      title: formData.title,
      description: formData.description || "",
      objectPath: uploadedFileUrl,
    });
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header - Glassmorphism Sticky */}
      <header className="sticky top-0 z-50 bg-white/10 backdrop-blur-xl border-b border-white/20 h-16">
        <div className="h-full px-4 py-5 flex items-center justify-between">
          <h1 className="text-base font-medium">Фотогалерея</h1>
          <ObjectUploader
            maxNumberOfFiles={1}
            maxFileSize={10485760}
            onGetUploadParameters={getUploadUrl}
            onComplete={handleUploadComplete}
            buttonClassName="bg-blue-600 hover:bg-blue-700 rounded-full h-10 px-6"
          >
            <Upload className="w-4 h-4 mr-2" />
            <span className="text-sm">Загрузить</span>
          </ObjectUploader>
        </div>
      </header>

      {/* Photo Grid - Masonry Layout */}
      <main className="p-4">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white/5 animate-pulse rounded-lg h-48" />
            ))}
          </div>
        ) : photos.length === 0 ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="bg-white/10 backdrop-blur-xl border-white/20 p-8 text-center">
              <Upload className="w-12 h-12 mx-auto mb-4 text-white/40" />
              <h2 className="text-lg font-semibold mb-2 text-white/90">Нет фотографий</h2>
              <p className="text-sm text-white/60 mb-4">Загрузите первую фотографию</p>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {photos.map((photo) => (
              <div
                key={photo.id}
                onClick={() => setSelectedPhoto(photo)}
                className="relative group cursor-pointer rounded-lg overflow-hidden hover-elevate active-elevate-2"
                data-testid={`card-photo-${photo.id}`}
              >
                <img
                  src={photo.objectPath}
                  alt={photo.title}
                  className="w-full h-48 object-cover"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-active:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-sm font-medium truncate text-white/95">{photo.title}</p>
                    {photo.description && (
                      <p className="text-xs text-white/60 truncate">{photo.description}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Fullscreen Photo Detail Modal */}
      {selectedPhoto && (
        <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
          <DialogContent className="bg-black border-white/20 max-w-4xl p-0">
            <div className="relative">
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 z-10 bg-white/10 backdrop-blur-md rounded-full p-2 hover-elevate"
                data-testid="button-close-photo"
              >
                <X className="w-5 h-5" />
              </button>
              <img
                src={selectedPhoto.objectPath}
                alt={selectedPhoto.title}
                className="w-full max-h-[70vh] object-contain"
              />
            </div>
            <div className="p-6 bg-white/5 backdrop-blur-xl border-t border-white/20">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold text-white/95">
                  {selectedPhoto.title}
                </DialogTitle>
                <DialogDescription className="text-sm text-white/60">
                  {selectedPhoto.description || "Без описания"}
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4 flex items-center justify-between">
                <p className="text-xs text-white/40">
                  {new Date(selectedPhoto.uploadedAt).toLocaleDateString("ru-RU", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteMutation.mutate(selectedPhoto.id)}
                  disabled={deleteMutation.isPending}
                  data-testid="button-delete-photo"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {deleteMutation.isPending ? "Удаление..." : "Удалить"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Upload Metadata Form */}
      {showUploadForm && (
        <Dialog open={showUploadForm} onOpenChange={setShowUploadForm}>
          <DialogContent className="bg-white/10 backdrop-blur-xl border-white/20">
            <DialogHeader>
              <DialogTitle className="text-white/95">Добавить информацию о фото</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-white/90">Название *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bg-white/5 border-white/20 text-white"
                  placeholder="Введите название фотографии"
                  data-testid="input-photo-title"
                />
              </div>
              <div>
                <Label htmlFor="description" className="text-white/90">Описание</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-white/5 border-white/20 text-white resize-none"
                  placeholder="Добавьте описание (необязательно)"
                  rows={3}
                  data-testid="input-photo-description"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowUploadForm(false);
                  setUploadedFileUrl("");
                  setFormData({ title: "", description: "" });
                }}
                className="border-white/20"
              >
                Отмена
              </Button>
              <Button
                onClick={handleSubmitMetadata}
                disabled={!formData.title || createPhotoMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
                data-testid="button-save-photo"
              >
                {createPhotoMutation.isPending ? "Сохранение..." : "Сохранить"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
