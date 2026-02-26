import { h } from 'preact';
import { useState } from 'preact/hooks';
import type { ContactData } from '../../types';
import { crmClient } from '../../api/crm-client';

interface ContactCardProps {
  contact: ContactData;
  onContactUpdated?: () => void;
}

const styles = {
  card: {
    background: '#ffffff',
    padding: '20px',
    borderBottom: '1px solid #f3f4f6',
  },
  crmLink: {
    display: 'block',
    width: '100%',
    padding: '10px',
    marginTop: '16px',
    borderRadius: '6px',
    border: 'none',
    background: '#4f46e5',
    color: '#ffffff',
    fontSize: '13px',
    fontWeight: 500,
    textAlign: 'center' as const,
    textDecoration: 'none',
    cursor: 'pointer',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px',
  },
  avatar: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    fontWeight: 600,
    flexShrink: 0,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#1f2937',
    margin: 0,
    marginBottom: '4px',
  },
  phone: {
    fontSize: '13px',
    color: '#6b7280',
  },
  tags: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '6px',
  },
  tag: {
    padding: '4px 10px',
    borderRadius: '9999px',
    fontSize: '11px',
    fontWeight: 500,
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    marginTop: '16px',
    paddingTop: '16px',
    borderTop: '1px solid #f3f4f6',
  },
  infoItem: {
    textAlign: 'center' as const,
  },
  infoLabel: {
    fontSize: '11px',
    color: '#9ca3af',
    marginBottom: '4px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.025em',
  },
  infoValue: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#1f2937',
  },
  editableValue: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#1f2937',
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: '4px',
    border: '1px dashed #d1d5db',
    transition: 'all 0.15s ease',
  },
  editableValueHover: {
    background: '#f3f4f6',
    borderColor: '#9ca3af',
  },
  select: {
    width: '100%',
    padding: '6px 8px',
    fontSize: '14px',
    fontWeight: 600,
    color: '#1f2937',
    border: '1px solid #4f46e5',
    borderRadius: '4px',
    background: '#ffffff',
    outline: 'none',
    cursor: 'pointer',
  },
  editHint: {
    fontSize: '10px',
    color: '#9ca3af',
    textAlign: 'center' as const,
    marginTop: '8px',
    fontStyle: 'italic' as const,
  },
};

const STATUS_OPTIONS = [
  { value: 'lead', label: 'Lead' },
  { value: 'active', label: 'Active' },
  { value: 'customer', label: 'Customer' },
  { value: 'inactive', label: 'Inactive' },
];

const SOURCE_OPTIONS = [
  { value: 'manual', label: 'Manual' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'web', label: 'Web' },
  { value: 'referral', label: 'Referral' },
  { value: 'tokopedia', label: 'Tokopedia' },
  { value: 'shopee', label: 'Shopee' },
];

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getTagColor(index: number): { bg: string; text: string } {
  const colors = [
    { bg: '#e0e7ff', text: '#4338ca' },
    { bg: '#fce7f3', text: '#be185d' },
    { bg: '#d1fae5', text: '#047857' },
    { bg: '#fef3c7', text: '#b45309' },
    { bg: '#ede9fe', text: '#6d28d9' },
  ];
  return colors[index % colors.length];
}

export function ContactCard({ contact, onContactUpdated }: ContactCardProps) {
  const [editingStatus, setEditingStatus] = useState(false);
  const [editingSource, setEditingSource] = useState(false);
  const [updating, setUpdating] = useState(false);

  const handleStatusChange = async (e: Event) => {
    const target = e.target as HTMLSelectElement;
    const newStatus = target.value;
    console.log('[ContactCard] Status change:', newStatus);
    
    if (newStatus === contact.status) {
      setEditingStatus(false);
      return;
    }
    
    setEditingStatus(false);
    setUpdating(true);
    try {
      await crmClient.updateContact(contact.id, { status: newStatus });
      console.log('[ContactCard] Status updated successfully');
      onContactUpdated?.();
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Gagal mengupdate status');
    } finally {
      setUpdating(false);
    }
  };

  const handleSourceChange = async (e: Event) => {
    const target = e.target as HTMLSelectElement;
    const newSource = target.value;
    console.log('[ContactCard] Source change:', newSource);
    
    if (newSource === contact.source) {
      setEditingSource(false);
      return;
    }
    
    setEditingSource(false);
    setUpdating(true);
    try {
      await crmClient.updateContact(contact.id, { source: newSource });
      console.log('[ContactCard] Source updated successfully');
      onContactUpdated?.();
    } catch (err) {
      console.error('Failed to update source:', err);
      alert('Gagal mengupdate source');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div style={styles.avatar}>
          {getInitials(contact.name)}
        </div>
        <div style={styles.info}>
          <h3 style={styles.name}>{contact.name}</h3>
          <div style={styles.phone}>{contact.phone}</div>
        </div>
      </div>

      {contact.tags && contact.tags.length > 0 && (
        <div style={styles.tags}>
          {contact.tags.map((tag, index) => {
            const colors = getTagColor(index);
            return (
              <span
                key={tag.id}
                style={{
                  ...styles.tag,
                  backgroundColor: colors.bg,
                  color: colors.text,
                }}
              >
                {tag.name}
              </span>
            );
          })}
        </div>
      )}

      <div style={styles.infoGrid}>
        <div style={styles.infoItem}>
          <div style={styles.infoLabel}>Status</div>
          {editingStatus ? (
            <select
              style={styles.select}
              defaultValue={contact.status || 'lead'}
              onChange={handleStatusChange}
              disabled={updating}
              autoFocus
            >
              {STATUS_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          ) : (
            <div
              style={styles.editableValue}
              onClick={() => setEditingStatus(true)}
              title="Klik untuk edit"
            >
              {STATUS_OPTIONS.find(o => o.value === contact.status)?.label || 'Lead'}
            </div>
          )}
        </div>
        <div style={styles.infoItem}>
          <div style={styles.infoLabel}>Source</div>
          {editingSource ? (
            <select
              style={styles.select}
              defaultValue={contact.source || 'manual'}
              onChange={handleSourceChange}
              disabled={updating}
              autoFocus
            >
              {SOURCE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          ) : (
            <div
              style={styles.editableValue}
              onClick={() => setEditingSource(true)}
              title="Klik untuk edit"
            >
              {SOURCE_OPTIONS.find(o => o.value === contact.source)?.label || 'Manual'}
            </div>
          )}
        </div>
      </div>
      
      <a
        href={`http://localhost:3000/contacts/${contact.id}`}
        target="_blank"
        rel="noopener noreferrer"
        style={styles.crmLink}
      >
        Buka di CRM →
      </a>
    </div>
  );
}
