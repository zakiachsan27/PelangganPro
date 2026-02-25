import { h } from 'preact';
import type { ContactData } from '../../types';

interface PipelineSelectProps {
  contact: ContactData;
  onStageChanged: () => void;
}

export function PipelineSelect({ contact }: PipelineSelectProps) {
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
      
      <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '8px' }}>
        * Update pipeline via dashboard CRM
      </p>
    </div>
  );
}
