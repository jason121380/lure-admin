
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNotifications } from '@/hooks/useNotifications';

type NotesEditDialogProps = {
  customerId: string;
  notes: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (notes: string) => void;
  customerName?: string;
};

export function NotesEditDialog({
  customerId,
  notes,
  open,
  onOpenChange,
  onSave,
  customerName,
}: NotesEditDialogProps) {
  const [currentNotes, setCurrentNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { addNotification } = useNotifications();

  useEffect(() => {
    if (open) {
      setCurrentNotes(notes);
    }
  }, [notes, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const { error } = await supabase
        .from('customers')
        .update({ notes: currentNotes })
        .eq('id', customerId);
      
      if (error) {
        throw error;
      }
      
      toast.success('備註已成功更新');
      addNotification('edit', '已更新客戶備註', customerName);
      onSave(currentNotes);
      onOpenChange(false);
    } catch (error) {
      toast.error('更新備註時發生錯誤');
      addNotification('edit', '更新客戶備註失敗', customerName);
      console.error('Error updating notes:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>編輯客戶備註</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Textarea
              value={currentNotes}
              onChange={(e) => setCurrentNotes(e.target.value)}
              className="min-h-[200px]"
              placeholder="輸入客戶備註..."
              disabled={isSaving}
            />
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              取消
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? '儲存中...' : '儲存'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
