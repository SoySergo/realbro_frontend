'use client';

import { memo } from 'react';
import { Phone, MessageCircle, Mail, ExternalLink } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface ContactFormProps {
  contactInfo: {
    phone?: string;
    whatsapp?: string;
    email?: string;
  };
  labels: {
    title: string;
    phone: string;
    whatsapp: string;
    email: string;
    call: string;
    write: string;
    send: string;
  };
  className?: string;
}

export const ContactForm = memo(function ContactForm({
  contactInfo,
  labels,
  className,
}: ContactFormProps) {
  return (
    <div className={cn(
      'rounded-xl border border-border bg-background-secondary p-3 space-y-3',
      'animate-message-slide-in',
      className
    )}>
      {/* Заголовок */}
      <div className="flex items-center gap-2">
        <Phone className="w-4 h-4 text-brand-primary" />
        <span className="text-sm font-medium text-text-primary">{labels.title}</span>
      </div>

      {/* Контакты */}
      <div className="space-y-2">
        {contactInfo.phone && (
          <a
            href={`tel:${contactInfo.phone}`}
            className={cn(
              'flex items-center gap-3 p-2.5 rounded-lg',
              'bg-background border border-border',
              'hover:bg-background-tertiary transition-colors group'
            )}
          >
            <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center shrink-0">
              <Phone className="w-4 h-4 text-success" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-text-tertiary">{labels.phone}</p>
              <p className="text-sm font-medium text-text-primary">{contactInfo.phone}</p>
            </div>
            <span className="text-xs text-brand-primary group-hover:underline">{labels.call}</span>
          </a>
        )}

        {contactInfo.whatsapp && (
          <a
            href={`https://wa.me/${contactInfo.whatsapp.replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'flex items-center gap-3 p-2.5 rounded-lg',
              'bg-background border border-border',
              'hover:bg-background-tertiary transition-colors group'
            )}
          >
            <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center shrink-0">
              <MessageCircle className="w-4 h-4 text-success" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-text-tertiary">{labels.whatsapp}</p>
              <p className="text-sm font-medium text-text-primary">{contactInfo.whatsapp}</p>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-text-tertiary" />
          </a>
        )}

        {contactInfo.email && (
          <a
            href={`mailto:${contactInfo.email}`}
            className={cn(
              'flex items-center gap-3 p-2.5 rounded-lg',
              'bg-background border border-border',
              'hover:bg-background-tertiary transition-colors group'
            )}
          >
            <div className="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center shrink-0">
              <Mail className="w-4 h-4 text-brand-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-text-tertiary">{labels.email}</p>
              <p className="text-sm font-medium text-text-primary">{contactInfo.email}</p>
            </div>
            <span className="text-xs text-brand-primary group-hover:underline">{labels.send}</span>
          </a>
        )}
      </div>
    </div>
  );
});
