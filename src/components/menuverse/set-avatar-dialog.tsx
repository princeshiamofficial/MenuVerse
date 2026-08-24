import { useEffect, useState } from "react";
import { UserCog, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { uploadToImgBB } from "@/lib/imgbb";
import { cn } from "@/lib/utils";

interface SetAvatarDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
  email?: string;
  currentAvatarUrl?: string | null;
  onSave: (newAvatarUrl: string) => Promise<void>;
}

export function SetAvatarDialog({
  open,
  onOpenChange,
  name,
  email,
  currentAvatarUrl,
  onSave,
}: SetAvatarDialogProps) {
  const [avatarUrl, setAvatarUrl] = useState(currentAvatarUrl || "");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setAvatarUrl(currentAvatarUrl || "");
    }
  }, [open, currentAvatarUrl]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(avatarUrl || "");
      onOpenChange(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save avatar";
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-[#F2F5F8] dark:bg-card border-slate-200/60 dark:border-border rounded-2xl p-6 shadow-xl">
        <DialogHeader className="space-y-1">
          <DialogTitle className="flex items-center gap-2 text-base font-bold text-neutral-800 dark:text-foreground">
            <UserCog className="h-5 w-5 text-[#D77649] shrink-0" />
            Set Avatar for {name}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400 dark:text-muted-foreground">
            Manage the profile picture for{" "}
            {email || `${name.toLowerCase().replace(/\s+/g, "")}@example.com`}.
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          <h4 className="text-xs font-bold text-neutral-800 dark:text-foreground mb-3">
            Profile Picture
          </h4>

          <div className="flex items-center gap-4">
            {/* Circle Avatar Preview */}
            <div className="h-20 w-20 rounded-full bg-[#E5EEF5] dark:bg-muted flex items-center justify-center shrink-0 overflow-hidden border border-slate-200/60 dark:border-border shadow-2xs">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Preview" className="h-full w-full object-cover" />
              ) : (
                <UserCog className="h-10 w-10 text-slate-400 dark:text-slate-500" />
              )}
            </div>

            {/* Upload Image Button & File Trigger */}
            <div className="flex flex-col gap-2">
              <input
                type="file"
                id={`avatar-file-upload-input-${name.replace(/\s+/g, "-")}`}
                accept="image/*"
                className="hidden"
                disabled={isUploadingAvatar || isSaving}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setIsUploadingAvatar(true);
                  const toastId = toast.loading("Uploading profile image...");
                  try {
                    const cdnUrl = await uploadToImgBB(file);
                    if (cdnUrl) {
                      setAvatarUrl(cdnUrl);
                      toast.success("Avatar image uploaded successfully!", { id: toastId });
                    } else {
                      throw new Error("Upload failed");
                    }
                  } catch (err) {
                    const message = err instanceof Error ? err.message : "Failed to upload avatar";
                    toast.error(message, { id: toastId });
                  } finally {
                    setIsUploadingAvatar(false);
                  }
                }}
              />
              <label
                htmlFor={`avatar-file-upload-input-${name.replace(/\s+/g, "-")}`}
                className={cn(
                  "inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-card hover:bg-slate-50 dark:hover:bg-accent text-neutral-800 dark:text-foreground text-xs font-semibold rounded-xl border border-slate-200 dark:border-border shadow-2xs cursor-pointer transition-all",
                  (isUploadingAvatar || isSaving) && "opacity-50 pointer-events-none",
                )}
              >
                {isUploadingAvatar ? (
                  <Loader2 className="h-4 w-4 animate-spin text-neutral-500" />
                ) : (
                  <Upload className="h-4 w-4 text-neutral-700 dark:text-neutral-300" />
                )}
                <span>{isUploadingAvatar ? "Uploading..." : "Upload Image"}</span>
              </label>
            </div>
          </div>

          <p className="text-xs text-slate-400 dark:text-muted-foreground mt-3">
            Upload an image (JPG, PNG, GIF). Max 2MB.
          </p>
        </div>

        <DialogFooter className="flex items-center justify-end gap-2 mt-4 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
            className="h-9 px-4 rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-card hover:bg-slate-50 dark:hover:bg-accent text-neutral-800 dark:text-foreground text-xs font-semibold shadow-2xs cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={isUploadingAvatar || isSaving}
            onClick={handleSave}
            className="h-9 px-5 rounded-xl bg-linear-to-r from-[#D77649] via-[#CB6C3F] to-[#B85C31] hover:from-[#C9693D] hover:to-[#A74E26] text-white text-xs font-bold shadow-md shadow-amber-900/10 cursor-pointer transition-all"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
