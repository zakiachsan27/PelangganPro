import { h } from 'preact';
import type { ContactData } from '../../types';

interface PipelineSelectProps {
  contact: ContactData;
  onStageChanged: () => void;
}

function getStatusColor(status?: string): { bg: string; color: string } {
  switch (status) {
    case 'won':
      return { bg: '#dcfce7', color: '#166534' }; // green
    case 'lost':
      return { bg: '#fee2e2', color: '#991b1b' }; // red
    default:
      return { bg: '#dbeafe', color: '#1e40af' }; // blue
  }
}

const styles = {
  section: {
    padding: '16px 20px',
    borderBottom: '1px solid #f3f4f6',
  },
  title: {
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    color: '#6b7280',
    marginBottom: '8px',
  },
  content: {
    fontSize: '13px',
    color: '#374151',
  },
  note: {
    fontSize: '11px',
    color: '#9ca3af',
    marginTop: '8px',
    fontStyle: 'italic' as const,
  },
};

export function PipelineSelect({ contact }: PipelineSelectProps) {
  const dealStatus = contact.deal?.status || contact.pipeline?.status;
  const colors = getStatusColor(dealStatus);
  
  return (
    <div style={styles.section}>
      <div style={styles.title}>Pipeline</div>
      <div style={styles.content}>
        {contact.pipeline ? (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 12px',
            borderRadius: '9999px',
            fontSize: '12px',
            fontWeight: 600,
            background: colors.bg,
            color: colors.color,
          }}>
            {contact.pipeline.stage}
            {dealStatus && dealStatus !== 'open' && (
              <span style={{ 
                fontSize: '10px', 
                textTransform: 'uppercase',
                opacity: 0.8 
              }}>
                ({dealStatus === 'won' ? 'Menang' : 'Kalah'})
              </span>
            )}
          </span>
        ) : (
          <span style={{ color: '#9ca3af' }}>Belum ada pipeline</span>
        )}
      </div>
      <div style={styles.note}>
        * Update pipeline via dashboard CRM
      </div>
    </div>
  );
}
