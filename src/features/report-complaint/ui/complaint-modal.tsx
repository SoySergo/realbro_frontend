'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Loader2, Flag, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/shared/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/ui/select';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/lib/utils';
import { complaintSchema, complaintReasons, type ComplaintFormData, type ComplaintReason } from '../model';

interface ComplaintModalProps {
    propertyId: string;
    isOpen: boolean;
    onClose: () => void;
}

export function ComplaintModal({ propertyId, isOpen, onClose }: ComplaintModalProps) {
    const t = useTranslations('complaint');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useForm<ComplaintFormData>({
        resolver: zodResolver(complaintSchema),
        defaultValues: {
            reason: 'spam',
            description: '',
        },
    });

    const selectedReason = watch('reason');

    const onSubmit = async (data: ComplaintFormData) => {
        setIsSubmitting(true);
        try {
            const response = await fetch('/api/complaints', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    propertyId,
                    reason: data.reason,
                    description: data.description,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to submit complaint');
            }

            toast.success(t('successMessage'), { icon: <Flag className="w-4 h-4" /> });
            reset();
            onClose();
        } catch {
            toast.error(t('errorMessage'), { icon: <AlertCircle className="w-4 h-4" /> });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            reset();
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle>{t('title')}</DialogTitle>
                    <DialogDescription>{t('description')}</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
                    {/* Reason select */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">
                            {t('reasonLabel')}
                        </label>
                        <Select
                            value={selectedReason}
                            onValueChange={(value) => setValue('reason', value as ComplaintReason)}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder={t('reasonPlaceholder')} />
                            </SelectTrigger>
                            <SelectContent>
                                {complaintReasons.map((reason) => (
                                    <SelectItem key={reason} value={reason}>
                                        {t(`reasons.${reason}`)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.reason && (
                            <p className="text-xs text-error">{t('reasonRequired')}</p>
                        )}
                    </div>

                    {/* Description textarea */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">
                            {t('descriptionLabel')}
                        </label>
                        <textarea
                            {...register('description')}
                            className={cn(
                                'w-full min-h-[120px] rounded-lg border border-border bg-background px-3 py-2 text-sm',
                                'placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary',
                                'resize-none transition-colors',
                                errors.description && 'border-error focus:ring-error/20 focus:border-error'
                            )}
                            placeholder={t('descriptionPlaceholder')}
                            maxLength={1000}
                        />
                        {errors.description && (
                            <p className="text-xs text-error">
                                {t('descriptionMinLength')}
                            </p>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isSubmitting}
                        >
                            {t('cancel')}
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-error hover:bg-error/90 text-white"
                        >
                            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {t('submit')}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
