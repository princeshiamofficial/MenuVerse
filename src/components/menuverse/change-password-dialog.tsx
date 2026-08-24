import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ChangePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerifyCurrentPassword?: (password: string) => Promise<void>;
  onSave: (data: { currentPassword: string; newPassword: string }) => Promise<void>;
}

export function ChangePasswordDialog({
  open,
  onOpenChange,
  onVerifyCurrentPassword,
  onSave,
}: ChangePasswordDialogProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [isVerifyingCurrent, setIsVerifyingCurrent] = useState(false);
  const [isCurrentInvalid, setIsCurrentInvalid] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setStep(1);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowCurrent(false);
      setShowNew(false);
      setIsCurrentInvalid(false);
      setIsVerifyingCurrent(false);
    }
  }, [open]);

  const isMismatched = confirmPassword.length > 0 && newPassword !== confirmPassword;

  const handleNext = async () => {
    const trimmed = currentPassword.trim();
    if (!trimmed) {
      toast.error("Please enter your current password.");
      return;
    }

    if (onVerifyCurrentPassword) {
      setIsVerifyingCurrent(true);
      setIsCurrentInvalid(false);
      try {
        await onVerifyCurrentPassword(trimmed);
        setIsCurrentInvalid(false);
        setStep(2);
      } catch (err) {
        setIsCurrentInvalid(true);
        const msg = err instanceof Error ? err.message : "Current password is incorrect.";
        toast.error(msg);
      } finally {
        setIsVerifyingCurrent(false);
      }
    } else {
      setStep(2);
    }
  };

  const handleSave = async () => {
    if (!currentPassword) {
      toast.error("Please enter your current password.");
      setStep(1);
      return;
    }
    if (!newPassword) {
      toast.error("Please enter a new password.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        currentPassword,
        newPassword,
      });
      toast.success("Password updated successfully!");
      onOpenChange(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update password";
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-[#F2F5F8] dark:bg-card border-slate-200/60 dark:border-border rounded-2xl p-6 shadow-xl">
        <DialogHeader className="space-y-2">
          {/* Stepper Progress Header */}
          <div className="flex items-center gap-2 mb-1">
            <div
              className={cn(
                "flex items-center justify-center h-6 w-6 rounded-full text-xs font-bold transition-all",
                step === 1
                  ? "bg-[#D77649] text-white shadow-xs"
                  : "bg-emerald-500 text-white shadow-xs",
              )}
            >
              {step > 1 ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : "1"}
            </div>
            <div
              className={cn(
                "flex-1 h-1 rounded-full transition-all",
                step === 2 ? "bg-[#D77649]" : "bg-slate-200 dark:bg-slate-700",
              )}
            />
            <div
              className={cn(
                "flex items-center justify-center h-6 w-6 rounded-full text-xs font-bold transition-all",
                step === 2
                  ? "bg-[#D77649] text-white shadow-xs"
                  : "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400",
              )}
            >
              2
            </div>
          </div>

          <DialogTitle className="flex items-center gap-2 text-base font-bold text-neutral-800 dark:text-foreground">
            {step === 1 ? (
              <>
                <ShieldCheck className="h-5 w-5 text-[#D77649] shrink-0" />
                Step 1 of 2: Verify Current Password
              </>
            ) : (
              <>
                <KeyRound className="h-5 w-5 text-[#D77649] shrink-0" />
                Step 2 of 2: Set New Password
              </>
            )}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400 dark:text-muted-foreground">
            {step === 1
              ? "Enter your existing account password to confirm identity before changing."
              : "Enter and confirm your new secure account password."}
          </DialogDescription>
        </DialogHeader>

        {/* Step 1: Current Password */}
        {step === 1 && (
          <div className="py-4 space-y-4 animate-in fade-in-50 duration-200">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                Current Password
              </Label>
              <div className="relative">
                <Input
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => {
                    setCurrentPassword(e.target.value);
                    if (isCurrentInvalid) setIsCurrentInvalid(false);
                  }}
                  placeholder="Enter current password"
                  autoFocus
                  disabled={isVerifyingCurrent}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !isVerifyingCurrent) handleNext();
                  }}
                  className={cn(
                    "h-9 text-xs bg-white dark:bg-card border-slate-200 dark:border-border pr-9 focus:border-[#D77649] transition-all",
                    isCurrentInvalid &&
                      "border-red-500 focus:border-red-500 ring-2 ring-red-500/20 text-red-600",
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
                >
                  {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {isCurrentInvalid && (
                <p className="text-[11px] font-semibold text-red-500 flex items-center gap-1 mt-1 animate-in fade-in-50">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>Current password is incorrect</span>
                </p>
              )}
            </div>
          </div>
        )}

        {/* Step 2: New Password & Confirm */}
        {step === 2 && (
          <div className="py-3 space-y-3.5 animate-in fade-in-50 duration-200">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                New Password
              </Label>
              <div className="relative">
                <Input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min. 6 chars)"
                  autoFocus
                  disabled={isSaving}
                  className="h-9 text-xs bg-white dark:bg-card border-slate-200 dark:border-border pr-9 focus:border-[#D77649]"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
                >
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                Confirm New Password
              </Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                disabled={isSaving}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isMismatched) handleSave();
                }}
                className={cn(
                  "h-9 text-xs bg-white dark:bg-card border-slate-200 dark:border-border focus:border-[#D77649] transition-all",
                  isMismatched &&
                    "border-red-500 focus:border-red-500 ring-2 ring-red-500/20 text-red-600",
                )}
              />
              {isMismatched && (
                <p className="text-[11px] font-semibold text-red-500 flex items-center gap-1 mt-1 animate-in fade-in-50">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>Passwords do not match</span>
                </p>
              )}
            </div>
          </div>
        )}

        <DialogFooter className="flex items-center justify-between gap-2 mt-2 pt-2">
          {step === 1 ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isVerifyingCurrent}
                className="h-9 px-4 rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-card hover:bg-slate-50 dark:hover:bg-accent text-neutral-800 dark:text-foreground text-xs font-semibold shadow-2xs cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={!currentPassword.trim() || isVerifyingCurrent}
                onClick={handleNext}
                className="h-9 px-5 rounded-xl bg-linear-to-r from-[#D77649] via-[#CB6C3F] to-[#B85C31] hover:from-[#C9693D] hover:to-[#A74E26] text-white text-xs font-bold shadow-md shadow-amber-900/10 cursor-pointer transition-all flex items-center gap-1.5"
              >
                {isVerifyingCurrent ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <span>Next Step</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
                disabled={isSaving}
                className="h-9 px-4 rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-card hover:bg-slate-50 dark:hover:bg-accent text-neutral-800 dark:text-foreground text-xs font-semibold shadow-2xs cursor-pointer flex items-center gap-1.5"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
              <Button
                type="button"
                disabled={isSaving || isMismatched || !newPassword || !confirmPassword}
                onClick={handleSave}
                className={cn(
                  "h-9 px-5 rounded-xl bg-linear-to-r from-[#D77649] via-[#CB6C3F] to-[#B85C31] hover:from-[#C9693D] hover:to-[#A74E26] text-white text-xs font-bold shadow-md shadow-amber-900/10 cursor-pointer transition-all",
                  (isMismatched || !newPassword || !confirmPassword) &&
                    "opacity-50 cursor-not-allowed",
                )}
              >
                {isSaving ? "Saving..." : "Update Password"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
