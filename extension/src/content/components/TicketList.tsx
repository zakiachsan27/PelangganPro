import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import type { TicketInfo, TicketCategory, TicketPriority } from '../../types';
import { crmClient } from '../../api/crm-client';
import { formatDate } from '../../utils/format';

interface TicketListProps {
  contactId: string;
}

const styles = {
  section: {
    padding: '16px 20px',
    borderBottom: '1px solid #f3f4f6',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  title: {
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    color: '#6b7280',
  },
  addButton: {
    padding: '4px 10px',
    borderRadius: '4px',
    border: '1px solid #e5e7eb',
    background: '#ffffff',
    fontSize: '11px',
    fontWeight: 500,
    color: '#4f46e5',
    cursor: 'pointer',
  },
  form: {
    marginBottom: '12px',
    background: '#f8fafc',
    padding: '12px',
    borderRadius: '8px',
  },
  input: {
    width: '100%',
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #e5e7eb',
    fontSize: '13px',
    marginBottom: '8px',
    outline: 'none',
  },
  textarea: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    fontSize: '13px',
    fontFamily: 'inherit',
    minHeight: '80px',
    resize: 'vertical' as const,
    outline: 'none',
    marginBottom: '8px',
  },
  select: {
    width: '100%',
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #e5e7eb',
    fontSize: '13px',
    background: '#ffffff',
    cursor: 'pointer',
    outline: 'none',
    marginBottom: '8px',
  },
  formActions: {
    display: 'flex',
    gap: '8px',
    marginTop: '8px',
  },
  imageUploadArea: {
    display: 'block',
    border: '1.5px dashed #c4c4c4',
    borderRadius: '6px',
    padding: '8px 10px',
    textAlign: 'center' as const,
    backgroundColor: '#f9fafb',
    marginBottom: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  imageUploadAreaHover: {
    borderColor: '#4f46e5',
    backgroundColor: '#eef2ff',
  },
  imageUploadText: {
    fontSize: '11px',
    color: '#6b7280',
    marginBottom: '2px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
  },
  imageUploadHint: {
    fontSize: '10px',
    color: '#9ca3af',
  },
  imagePreviewContainer: {
    position: 'relative' as const,
    display: 'inline-block',
    marginBottom: '12px',
  },
  imagePreview: {
    maxWidth: '100%',
    maxHeight: '150px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
  },
  imageRemoveButton: {
    position: 'absolute' as const,
    top: '-8px',
    right: '-8px',
    backgroundColor: '#ef4444',
    color: '#ffffff',
    border: 'none',
    borderRadius: '50%',
    width: '20px',
    height: '20px',
    fontSize: '12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPrimary: {
    padding: '6px 14px',
    borderRadius: '6px',
    border: 'none',
    background: '#4f46e5',
    fontSize: '12px',
    fontWeight: 500,
    color: '#ffffff',
    cursor: 'pointer',
  },
  buttonSecondary: {
    padding: '6px 14px',
    borderRadius: '6px',
    border: '1px solid #e5e7eb',
    background: '#ffffff',
    fontSize: '12px',
    fontWeight: 500,
    color: '#6b7280',
    cursor: 'pointer',
  },
  ticketsList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px',
  },
  ticketItem: {
    background: '#f8fafc',
    borderRadius: '8px',
    padding: '12px',
    border: '1px solid #f1f5f9',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  ticketHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '6px',
  },
  ticketTitle: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#1f2937',
    flex: 1,
  },
  ticketStatus: {
    fontSize: '10px',
    fontWeight: 600,
    padding: '2px 8px',
    borderRadius: '10px',
    textTransform: 'uppercase' as const,
  },
  ticketDesc: {
    fontSize: '12px',
    color: '#6b7280',
    lineHeight: 1.5,
    marginBottom: '8px',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical' as const,
    overflow: 'hidden',
  },
  ticketMeta: {
    display: 'flex',
    gap: '8px',
    fontSize: '11px',
    color: '#9ca3af',
    flexWrap: 'wrap' as const,
    alignItems: 'center',
  },
  attachmentLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '3px',
    color: '#4f46e5',
    fontSize: '10px',
    cursor: 'pointer',
    textDecoration: 'none',
  },
  badge: {
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '10px',
    fontWeight: 500,
  },
  emptyText: {
    fontSize: '13px',
    color: '#9ca3af',
    fontStyle: 'italic' as const,
    textAlign: 'center' as const,
    padding: '20px',
  },
};

const statusColors: Record<string, { bg: string; color: string }> = {
  open: { bg: '#fef3c7', color: '#92400e' },
  in_progress: { bg: '#dbeafe', color: '#1e40af' },
  waiting: { bg: '#fce7f3', color: '#9d174d' },
  resolved: { bg: '#d1fae5', color: '#065f46' },
  closed: { bg: '#f3f4f6', color: '#4b5563' },
};

const priorityColors: Record<string, string> = {
  low: '#6b7280',
  medium: '#f59e0b',
  high: '#ef4444',
  urgent: '#dc2626',
};

const categoryLabels: Record<string, string> = {
  bug: 'Bug',
  feature_request: 'Feature',
  pertanyaan: 'Tanya',
  keluhan_pelanggan: 'Keluhan',
  internal: 'Internal',
};

export function TicketList({ contactId }: TicketListProps) {
  const [tickets, setTickets] = useState<TicketInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TicketCategory>('pertanyaan');
  const [priority, setPriority] = useState<TicketPriority>('medium');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (contactId) {
      loadTickets();
    }
  }, [contactId]);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const data = await crmClient.getTickets(contactId);
      // Filter hanya tampilkan status: open, in_progress, waiting
      const filteredData = data.filter((ticket) =>
        ['open', 'in_progress', 'waiting'].includes(ticket.status)
      );
      setTickets(filteredData);
    } catch (err) {
      console.error('Failed to load tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  // Image upload handlers
  const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

  const handleImageSelect = (file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      alert('Ukuran file maksimal 2MB');
      return;
    }
    if (!file.type.startsWith('image/')) {
      alert('Hanya file gambar yang diperbolehkan');
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: Event) => {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      handleImageSelect(input.files[0]);
    }
  };

  const handlePaste = (e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf('image') !== -1) {
        e.preventDefault();
        const blob = item.getAsFile();
        if (blob) {
          handleImageSelect(blob);
        }
        break;
      }
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await crmClient.createTicket({
        contactId,
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
        imageFile: imageFile || undefined,
      });
      setTitle('');
      setDescription('');
      setCategory('pertanyaan');
      setPriority('medium');
      setImageFile(null);
      setImagePreview(null);
      setIsAdding(false);
      loadTickets();
    } catch (err) {
      console.error('Failed to create ticket:', err);
      alert('Gagal membuat ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusStyle = (status: string) => {
    return statusColors[status] || { bg: '#f3f4f6', color: '#4b5563' };
  };

  return (
    <div style={styles.section}>
      <div style={styles.header}>
        <span style={styles.title}>Tickets</span>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            style={styles.addButton}
          >
            + Buat
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="text"
            style={styles.input}
            placeholder="Judul ticket..."
            value={title}
            onChange={(e) => setTitle((e.target as HTMLInputElement).value)}
            disabled={isSubmitting}
            required
          />
          <textarea
            style={styles.textarea}
            placeholder="Deskripsi ticket... (Ctrl+V untuk paste gambar)"
            value={description}
            onChange={(e) => setDescription((e.target as HTMLTextAreaElement).value)}
            onPaste={handlePaste}
            disabled={isSubmitting}
            required
          />
          <select
            style={styles.select}
            value={category}
            onChange={(e) => setCategory((e.target as HTMLSelectElement).value as TicketCategory)}
            disabled={isSubmitting}
          >
            <option value="pertanyaan">Pertanyaan</option>
            <option value="keluhan_pelanggan">Keluhan Pelanggan</option>
            <option value="bug">Bug</option>
            <option value="feature_request">Feature Request</option>
            <option value="internal">Internal</option>
          </select>
          <select
            style={styles.select}
            value={priority}
            onChange={(e) => setPriority((e.target as HTMLSelectElement).value as TicketPriority)}
            disabled={isSubmitting}
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
            <option value="urgent">Urgent</option>
          </select>
          
          {/* Image Upload Area */}
          {imagePreview ? (
            <div style={styles.imagePreviewContainer}>
              <img src={imagePreview} alt="Preview" style={styles.imagePreview} />
              <button
                type="button"
                style={styles.imageRemoveButton}
                onClick={removeImage}
                disabled={isSubmitting}
              >
                ×
              </button>
            </div>
          ) : (
            <label style={{
              ...styles.imageUploadArea,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              opacity: isSubmitting ? 0.5 : 1,
            }}>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                disabled={isSubmitting}
                style={{ display: 'none' }}
              />
              <div style={styles.imageUploadText}>📎 Upload Gambar</div>
              <div style={styles.imageUploadHint}>Klik atau Ctrl+V • Maksimal 2MB</div>
            </label>
          )}
          
          <div style={styles.formActions}>
            <button
              type="submit"
              style={{
                ...styles.buttonPrimary,
                opacity: isSubmitting ? 0.7 : 1,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan'}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setTitle('');
                setDescription('');
                setImageFile(null);
                setImagePreview(null);
              }}
              style={styles.buttonSecondary}
              disabled={isSubmitting}
            >
              Batal
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <div style={{ fontSize: '12px', color: '#9ca3af' }}>Memuat tickets...</div>
        </div>
      ) : tickets.length > 0 ? (
        <div style={styles.ticketsList}>
          {tickets.map((ticket) => {
            const statusStyle = getStatusStyle(ticket.status);
            return (
              <div 
                key={ticket.id} 
                style={styles.ticketItem}
                onClick={() => window.open(`http://localhost:3000/tickets/${ticket.id}`, '_blank')}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.backgroundColor = '#f1f5f9';
                  (e.target as HTMLElement).style.borderColor = '#e2e8f0';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.backgroundColor = '#f8fafc';
                  (e.target as HTMLElement).style.borderColor = '#f1f5f9';
                }}
              >
                <div style={styles.ticketHeader}>
                  <span style={styles.ticketTitle}>{ticket.title}</span>
                  <span
                    style={{
                      ...styles.ticketStatus,
                      backgroundColor: statusStyle.bg,
                      color: statusStyle.color,
                    }}
                  >
                    {ticket.status.replace('_', ' ')}
                  </span>
                </div>
                <div style={styles.ticketDesc}>{ticket.description}</div>
                <div style={styles.ticketMeta}>
                  <span
                    style={{
                      ...styles.badge,
                      backgroundColor: '#e5e7eb',
                      color: '#374151',
                    }}
                  >
                    {categoryLabels[ticket.category]}
                  </span>
                  <span
                    style={{
                      ...styles.badge,
                      backgroundColor: priorityColors[ticket.priority] + '20',
                      color: priorityColors[ticket.priority],
                    }}
                  >
                    {ticket.priority}
                  </span>
                  {ticket.assigneeName && (
                    <span>👤 {ticket.assigneeName}</span>
                  )}
                  <span>📅 {formatDate(ticket.createdAt)}</span>
                  {ticket.imageUrl && (
                    <a 
                      href={ticket.imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={styles.attachmentLink}
                      onClick={(e) => e.stopPropagation()}
                    >
                      📎 Lampiran
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={styles.emptyText}>
          Belum ada ticket
        </div>
      )}
    </div>
  );
}
