'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/store/useUser';
import { API_BASE_URL } from '@/lib/constants';

interface Model3DUploadProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  disabled?: boolean;
}

export function Model3DUpload({ value, onChange, disabled }: Model3DUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.glb')) {
      setError('Chỉ chấp nhận file GLB');
      toast({
        title: 'Lỗi',
        description: 'Chỉ chấp nhận file GLB',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      setError('File không được vượt quá 50MB');
      toast({
        title: 'Lỗi',
        description: 'File không được vượt quá 50MB',
        variant: 'destructive',
      });
      return;
    }

    setError(null);
    setUploading(true);

    try {
      if (!user?.accessToken) {
        throw new Error('Vui lòng đăng nhập để upload file');
      }

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/api/Products/upload-model3d`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.accessToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Upload thất bại' }));
        throw new Error(errorData.error || errorData.message || 'Upload thất bại');
      }

      const data = await response.json();
      onChange(data.url);
      
      toast({
        title: 'Thành công',
        description: 'Đã upload model 3D thành công',
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload thất bại';
      setError(errorMessage);
      toast({
        title: 'Lỗi upload',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      // Reset input
      e.target.value = '';
    }
  };

  const handleRemove = () => {
    onChange(null);
    setError(null);
  };

  return (
    <div className="space-y-2">
      <Label>Model 3D (GLB) - Tùy chọn</Label>
      
      {value ? (
        <div className="flex items-center gap-2 p-3 border rounded-md bg-green-50">
          <span className="text-sm text-green-700 flex-1">
            ✓ Đã upload: {value.split('/').pop()}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            disabled={disabled || uploading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label
              htmlFor="model3d-upload"
              className="cursor-pointer flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Đang upload...</span>
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  <span>Chọn file GLB</span>
                </>
              )}
            </Label>
            <Input
              id="model3d-upload"
              type="file"
              accept=".glb"
              onChange={handleFileChange}
              disabled={disabled || uploading}
              className="hidden"
            />
          </div>
          <p className="text-xs text-gray-500">
            Chỉ chấp nhận file GLB, tối đa 50MB
          </p>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

