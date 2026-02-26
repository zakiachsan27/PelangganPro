import { h } from 'preact';
import type { ContactData } from '../../types';

interface AssignDropdownProps {
  contact: ContactData;
  onAssigned: () => void;
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
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  avatar: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    fontWeight: 600,
  },
  name: {
    fontSize: '13px',
    color: '#374151',
  },
  emptyText: {
    fontSize: '13px',
    color: '#9ca3af',
  },
  note: {
    fontSize: '11px',
    color: '#9ca3af',
    marginTop: '8px',
    fontStyle: 'italic' as const,
  },
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function AssignDropdown({ contact }: AssignDropdownProps) {
  return (
    <div style={styles.section}>
      <div style={styles.title}>Assign ke</div>
      {contact.assignedTo ? (
        <div style={styles.content}>
          <div style={styles.avatar}>
            {getInitials(contact.assignedTo.name)}
          </div>
          <span style={styles.name}>{contact.assignedTo.name}</span>
        </div>
      ) : (
        <div>
          <div style={styles.emptyText}>Belum di-assign</div>
          <div style={styles.note}>
            * Assign via dashboard CRM
          </div>
        </div>
      )}
    </div>
  );
}
