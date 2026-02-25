import { h } from 'preact';
import type { ContactData } from '../../types';

interface DealInfoProps {
  contact: ContactData;
}

export function DealInfo({ contact }: DealInfoProps) {
  const formatCurrency = (value: number, currency: string) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: currency || 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="pp-section">
      <h3 className="pp-section-title">Pipeline</h3>
      
      {contact.pipeline ? (
        <div>
          <div className="pp-flex pp-items-center pp-gap-2 pp-mb-2">
            <span className="pp-stage-badge">
              {contact.pipeline.stage}
            </span>
          </div>
          <p className="pp-text-sm pp-text-gray-600">{contact.pipeline.name}</p>
        </div>
      ) : (
        <p className="pp-text-sm pp-text-gray-500">Belum ada pipeline</p>
      )}

      {contact.deal && (
        <div className="pp-mt-3 pp-p-3 pp-bg-gray-50 pp-rounded">
          <p className="pp-text-xs pp-text-gray-500 pp-mb-1">Deal Value</p>
          <p className="pp-deal-value">
            {formatCurrency(contact.deal.value, contact.deal.currency)}
          </p>
          <p className="pp-text-sm pp-text-gray-600 pp-mt-1">{contact.deal.title}</p>
        </div>
      )}
    </div>
  );
}
