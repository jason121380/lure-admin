
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

type NotesEditDialogProps = {
  notes: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (notes: string) => void;
};

export function NotesEditDialog({
  notes,
  open,
  onOpenChange,
  onSave,
}: NotesEditDialogProps) {
  const [currentNotes, setCurrentNotes] = useState('');

  useEffect(() => {
    if (open) {
      setCurrentNotes(notes);
    }
  }, [notes, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(currentNotes);
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
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button type="submit">儲存</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
