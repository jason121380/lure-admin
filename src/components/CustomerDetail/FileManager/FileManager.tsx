import { useState, useEffect, useRef, useCallback } from "react";
import { Upload, Download, Trash2, File, FileText, Image, FileIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { DeleteFileDialog } from "./DeleteFileDialog";

type CustomerFile = {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  uploaded_at: string;
  updated_at?: string;
};

type FileManagerProps = {
  customerId: string;
};

export function FileManager({ customerId }: FileManagerProps) {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const [files, setFiles] = useState<CustomerFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isDragOver, setIsDragOver] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    fileId: string;
    filePath: string;
    fileName: string;
  }>({
    open: false,
    fileId: "",
    filePath: "",
    fileName: ""
  });

  useEffect(() => {
    if (user) {
      fetchFiles();
    }
  }, [customerId, user]);

  const fetchFiles = async () => {
    try {
      const { data, error } = await supabase
        .from('customer_files')
        .select('*')
        .eq('customer_id', customerId)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setFiles(data || []);
    } catch (error) {
      console.error('Error fetching files:', error);
      toast.error('無法載入檔案清單');
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (file: File) => {
    if (!user) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${customerId}/${fileName}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('customer-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Save file metadata to database
      const { error: dbError } = await supabase
        .from('customer_files')
        .insert({
          customer_id: customerId,
          user_id: user.id,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          mime_type: file.type
        });

      if (dbError) throw dbError;

      toast.success('檔案上傳成功');
      fetchFiles();
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('檔案上傳失敗');
    } finally {
      setUploading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    await uploadFile(file);
    
    // Reset input
    event.target.value = '';
  };

  const handleDrop = useCallback(async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);

    const droppedFiles = Array.from(event.dataTransfer.files);
    if (droppedFiles.length === 0) return;

    // Handle only the first file for now
    const file = droppedFiles[0];
    await uploadFile(file);
  }, [uploadFile]);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    // Only set isDragOver to false if we're leaving the drop zone entirely
    if (!dropZoneRef.current?.contains(event.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  }, []);

  const handleFileDownload = async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('customer-files')
        .download(filePath);

      if (error) throw error;

      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('檔案下載開始');
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('檔案下載失敗');
    }
  };

  const handleFileDelete = async (fileId: string, filePath: string, fileName: string) => {
    setDeleteDialog({
      open: true,
      fileId,
      filePath,
      fileName
    });
  };

  const confirmDelete = async () => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('customer-files')
        .remove([deleteDialog.filePath]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('customer_files')
        .delete()
        .eq('id', deleteDialog.fileId);

      if (dbError) throw dbError;

      toast.success('檔案已刪除');
      fetchFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('檔案刪除失敗');
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (mimeType.includes('pdf')) return <FileText className="w-4 h-4" />;
    if (mimeType.includes('text/')) return <FileText className="w-4 h-4" />;
    return <FileIcon className="w-4 h-4" />;
  };

  const getFileType = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return '圖片';
    if (mimeType.includes('pdf')) return 'PDF';
    if (mimeType.includes('text/')) return '文字';
    if (mimeType.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document')) return 'Word';
    if (mimeType.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')) return 'Excel';
    if (mimeType.includes('application/vnd.openxmlformats-officedocument.presentationml.presentation')) return 'PowerPoint';
    if (mimeType.includes('application/zip')) return 'ZIP';
    if (mimeType.includes('application/x-rar')) return 'RAR';
    return '檔案';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDateTime = (dateTimeString: string) => {
    try {
      const date = new Date(dateTimeString);
      return date.toLocaleString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (error) {
      return dateTimeString;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">載入中...</div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className={isMobile ? 'text-lg' : 'text-xl'}>檔案總管</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Hidden file input for drag zone */}
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileUpload}
          className="hidden"
          disabled={uploading}
        />

        {/* Drag and Drop Zone */}
        <div
          ref={dropZoneRef}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            border-2 border-dashed rounded-lg p-8 mb-6 text-center transition-colors
            ${isDragOver 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
            }
            ${uploading ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
          `}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragOver ? 'text-blue-500' : 'text-gray-400'}`} />
          <p className={`text-lg font-medium mb-2 ${isDragOver ? 'text-blue-700' : 'text-gray-700'}`}>
            {isDragOver ? '放開以上傳檔案' : '拖拽檔案到此處上傳'}
          </p>
          <p className="text-sm text-gray-500">
            或點擊此區域選擇檔案
          </p>
        </div>

        {files.length === 0 ? (
          <div className="text-center text-gray-500 py-4">
            <FileIcon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p>尚未上傳任何檔案</p>
          </div>
        ) : (
          <div className="space-y-3">
            {files.map((file) => (
              <div 
                key={file.id} 
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {getFileIcon(file.mime_type)}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{file.file_name}</p>
                    <div className="text-sm text-gray-500 space-y-1">
                      <p>
                        {getFileType(file.mime_type)} • {formatFileSize(file.file_size)} • 上傳於 {new Date(file.uploaded_at).toLocaleDateString()}
                      </p>
                      {file.updated_at && (
                        <p className="text-xs">
                          更新時間：{formatDateTime(file.updated_at)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleFileDownload(file.file_path, file.file_name)}
                    className="h-8 w-8"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleFileDelete(file.id, file.file_path, file.file_name)}
                    className="h-8 w-8 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <DeleteFileDialog
          open={deleteDialog.open}
          onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, open }))}
          onConfirm={confirmDelete}
          fileName={deleteDialog.fileName}
        />
      </CardContent>
    </Card>
  );
}
