import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";

interface ImageUploadPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (imageFile: File) => void;
}

export const ImageUploadPopup = ({ open, onOpenChange, onSubmit }: ImageUploadPopupProps) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error("Please select an image file");
        return;
      }
      
      setSelectedImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setShowPreview(false);
    }
  };

  const handleSubmit = () => {
    if (!selectedImage) {
      toast.error("Please select an image first");
      return;
    }
    
    setShowPreview(true);
  };

  const handleConfirm = () => {
    if (selectedImage) {
      onSubmit(selectedImage);
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setShowPreview(false);
    onOpenChange(false);
  };

  const handleRemoveImage = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedImage(null);
    setPreviewUrl(null);
    setShowPreview(false);
  };

  return (
    <>
      {/* Upload Dialog */}
      <Dialog open={open && !showPreview} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Image</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Image Preview */}
            {previewUrl && (
              <div className="relative w-full h-48 border rounded-lg overflow-hidden bg-muted">
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="w-full h-full object-contain"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={handleRemoveImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Upload Button */}
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => document.getElementById('image-upload')?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {selectedImage ? "Change Image" : "Upload Image"}
                </Button>
              </label>
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={!selectedImage}
              className="w-full bg-gradient-to-r from-primary to-accent"
            >
              Submit
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Confirmation Dialog */}
      <Dialog open={showPreview} onOpenChange={() => setShowPreview(false)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Confirm Image</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {previewUrl && (
              <div className="w-full max-h-96 border rounded-lg overflow-hidden bg-muted">
                <img 
                  src={previewUrl} 
                  alt="Final Preview" 
                  className="w-full h-full object-contain"
                />
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowPreview(false)}
              >
                Back
              </Button>
              <Button
                onClick={handleConfirm}
                className="flex-1 bg-gradient-to-r from-primary to-accent"
              >
                Continue
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
