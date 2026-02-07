import { z } from 'zod';

export const complaintReasons = [
    'spam',
    'misleading',
    'duplicate',
    'wrong_price',
    'wrong_photos',
    'fraud',
    'offensive',
    'other',
] as const;

export type ComplaintReason = (typeof complaintReasons)[number];

export const complaintSchema = z.object({
    reason: z.enum(complaintReasons),
    description: z.string().min(10).max(1000),
});

export type ComplaintFormData = z.infer<typeof complaintSchema>;
