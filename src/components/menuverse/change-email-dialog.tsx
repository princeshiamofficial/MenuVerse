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
  Mail,
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

interface ChangeEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentEmail: string;
  onVerifyPassword?: (password: string) => Promise<void>;
  onSave: (newEmail: string, password?: string) => Promise<void>;
}

export function ChangeEmailDialog({
  open,
  onOpenChange,
  currentEmail,
  onVerifyPassword,
  onSave,
}: ChangeEmailDialogProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [newEmail, setNewEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordInvalid, setIsPasswordInvalid] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setStep(1);
      setNewEmail("");
      setPassword("");
      setShowPassword(false);
      setIsPasswordInvalid(false);
      setIsSaving(false);
    }
  }, [open]);

  const handleNextStep = () => {
    const trimmed = newEmail.trim();
    if (!trimmed) {
      toast.error("Please enter a new email address.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (trimmed.toLowerCase() === currentEmail.toLowerCase()) {
      toast.error("New email must be different from current email.");
      return;
    }
    setStep(2);
  };

  const handleSave = async () => {
    const trimmedEmail = newEmail.trim();
    if (!password.trim()) {
      toast.error("Please enter your account password.");
      return;
    }

    setIsSaving(true);
    setIsPasswordInvalid(false);

    try {
      if (onVerifyPassword) {
        await onVerifyPassword(password.trim());
      }
      await onSave(trimmedEmail, password.trim());
      toast.success("Email address updated successfully!");
      onOpenChange(false);
    } catch (err) {
      setIsPasswordInvalid(true);
      const msg = err instanceof Error ? err.message : "Failed to update email";
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
                <Mail className="h-5 w-5 text-[#D77649] shrink-0" />
                Step 1 of 2: New Email Address
              </>
            ) : (
              <>
                <KeyRound className="h-5 w-5 text-[#D77649] shrink-0" />
                Step 2 of 2: Confirm Account Password
              </>
            )}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400 dark:text-muted-foreground">
            {step === 1
              ? "Enter your new primary email address for notifications and login."
              : "Enter your account password to authorize changing your email address."}
          </DialogDescription>
        </DialogHeader>

        {/* Step 1: Email Form */}
        {step === 1 && (
          <div className="py-3 space-y-3.5 animate-in fade-in-50 duration-200">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                Current Email Address
              </Label>
              <Input
                value={currentEmail}
                disabled
                className="h-9 text-xs bg-slate-100 dark:bg-muted border-slate-200 dark:border-border text-slate-500 font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                New Email Address
              </Label>
              <Input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="e.g. name@example.com"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleNextStep();
                }}
                className="h-9 text-xs bg-white dark:bg-card border-slate-200 dark:border-border focus:border-[#D77649]"
              />
            </div>
          </div>
        )}

        {/* Step 2: Password Confirmation */}
        {step === 2 && (
          <div className="py-3 space-y-3.5 animate-in fade-in-50 duration-200">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs font-medium space-y-1">
              <p className="font-bold">Security Verification Required</p>
              <p className="text-[11px] text-amber-700 dark:text-amber-400">
                Changing your email to{" "}
                <span className="font-bold text-slate-900 dark:text-white">{newEmail}</span>{" "}
                requires your current password.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                Account Password
              </Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (isPasswordInvalid) setIsPasswordInvalid(false);
                  }}
                  placeholder="Enter current password to confirm"
                  autoFocus
                  disabled={isSaving}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !isSaving) handleSave();
                  }}
                  className={cn(
                    "h-9 text-xs bg-white dark:bg-card border-slate-200 dark:border-border pr-9 focus:border-[#D77649] transition-all",
                    isPasswordInvalid &&
                      "border-red-500 focus:border-red-500 ring-2 ring-red-500/20 text-red-600",
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {isPasswordInvalid && (
                <p className="text-[11px] font-semibold text-red-500 flex items-center gap-1 mt-1 animate-in fade-in-50">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>Incorrect account password</span>
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
                className="h-9 px-4 rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-card hover:bg-slate-50 dark:hover:bg-accent text-neutral-800 dark:text-foreground text-xs font-semibold shadow-2xs cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={!newEmail.trim()}
                onClick={handleNextStep}
                className="h-9 px-5 rounded-xl bg-linear-to-r from-[#D77649] via-[#CB6C3F] to-[#B85C31] hover:from-[#C9693D] hover:to-[#A74E26] text-white text-xs font-bold shadow-md shadow-amber-900/10 cursor-pointer transition-all flex items-center gap-1.5"
              >
                <span>Next Step</span>
                <ArrowRight className="h-4 w-4" />
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
                disabled={isSaving || !password.trim()}
                onClick={handleSave}
                className="h-9 px-5 rounded-xl bg-linear-to-r from-[#D77649] via-[#CB6C3F] to-[#B85C31] hover:from-[#C9693D] hover:to-[#A74E26] text-white text-xs font-bold shadow-md shadow-amber-900/10 cursor-pointer transition-all flex items-center gap-1.5"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                    <span>Saving...</span>
                  </>
                ) : (
                  "Update Email"
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
