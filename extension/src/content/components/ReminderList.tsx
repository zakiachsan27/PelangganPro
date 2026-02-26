import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import type { TaskInfo } from '../../types';
import { crmClient } from '../../api/crm-client';

interface ReminderListProps {
  contactId: string;
}

const styles = {
  section: {
    padding: '16px 20px',
    borderBottom: '1px solid #f3f4f6',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  sectionTitle: {
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
    background: '#f8fafc',
    borderRadius: '8px',
    padding: '12px',
    border: '1px solid #e2e8f0',
    marginBottom: '12px',
  },
  input: {
    width: '100%',
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #e5e7eb',
    fontSize: '13px',
    marginBottom: '8px',
    outline: 'none',
    boxSizing: 'border-box' as const,
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
  buttonPrimary: {
    flex: 1,
    padding: '6px 12px',
    borderRadius: '6px',
    border: 'none',
    background: '#4f46e5',
    color: '#ffffff',
    fontSize: '12px',
    fontWeight: 500,
    cursor: 'pointer',
  },
  buttonSecondary: {
    flex: 1,
    padding: '6px 12px',
    borderRadius: '6px',
    border: '1px solid #e5e7eb',
    background: '#ffffff',
    color: '#6b7280',
    fontSize: '12px',
    fontWeight: 500,
    cursor: 'pointer',
  },
  reminderItem: {
    padding: '10px 12px',
    background: '#f8fafc',
    borderRadius: '8px',
    marginBottom: '8px',
    border: '1px solid #e2e8f0',
  },
  reminderTitle: {
    fontSize: '13px',
    fontWeight: 500,
    color: '#1f2937',
    marginBottom: '4px',
  },
  reminderMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '11px',
    color: '#6b7280',
  },
  priorityBadge: {
    low: {
      padding: '2px 6px',
      borderRadius: '4px',
      fontSize: '10px',
      fontWeight: 500,
      background: '#f3f4f6',
      color: '#6b7280',
    },
    medium: {
      padding: '2px 6px',
      borderRadius: '4px',
      fontSize: '10px',
      fontWeight: 500,
      background: '#fef3c7',
      color: '#d97706',
    },
    high: {
      padding: '2px 6px',
      borderRadius: '4px',
      fontSize: '10px',
      fontWeight: 500,
      background: '#fee2e2',
      color: '#dc2626',
    },
    urgent: {
      padding: '2px 6px',
      borderRadius: '4px',
      fontSize: '10px',
      fontWeight: 500,
      background: '#fecaca',
      color: '#991b1b',
    },
  },
  emptyState: {
    padding: '12px',
    textAlign: 'center' as const,
    color: '#9ca3af',
    fontSize: '12px',
    background: '#f9fafb',
    borderRadius: '8px',
    border: '1px dashed #e2e8f0',
  },
  loadingState: {
    padding: '12px',
    textAlign: 'center' as const,
    color: '#6b7280',
    fontSize: '12px',
  },
  calendarIcon: {
    width: '12px',
    height: '12px',
    display: 'inline-block',
    marginRight: '4px',
  },
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  if (dateOnly.getTime() === today.getTime()) {
    return `Hari ini, ${date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;
  } else if (dateOnly.getTime() === tomorrow.getTime()) {
    return `Besok, ${date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;
  } else {
    return date.toLocaleDateString('id-ID', { 
      day: 'numeric', 
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

export function ReminderList({ contactId }: ReminderListProps) {
  const [reminders, setReminders] = useState<TaskInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');

  useEffect(() => {
    loadReminders();
  }, [contactId]);

  const loadReminders = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await crmClient.getUpcomingReminders(contactId);
      setReminders(data);
    } catch (err) {
      console.error('[ReminderList] Failed to load reminders:', err);
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    if (!title.trim() || !dueDate || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await crmClient.addReminder({
        contactId,
        title: title.trim(),
        dueDate: new Date(dueDate).toISOString(),
      });
      
      // Reset form
      setTitle('');
      setDueDate('');
      setPriority('medium');
      setShowForm(false);
      
      // Reload reminders
      loadReminders();
    } catch (err) {
      console.error('[ReminderList] Failed to create reminder:', err);
      alert('Gagal membuat reminder');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.section}>
      <div style={styles.sectionHeader}>
        <span style={styles.sectionTitle}>REMINDER ({reminders.length})</span>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            style={styles.addButton}
          >
            + Tambah
          </button>
        )}
      </div>
      
      {showForm && (
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="text"
            placeholder="Judul reminder..."
            value={title}
            onChange={(e) => setTitle((e.target as HTMLInputElement).value)}
            style={styles.input}
            required
            autoFocus
          />
          <input
            type="datetime-local"
            value={dueDate}
            onChange={(e) => setDueDate((e.target as HTMLInputElement).value)}
            style={styles.input}
            required
          />
          <select
            value={priority}
            onChange={(e) => setPriority((e.target as HTMLSelectElement).value as 'low' | 'medium' | 'high' | 'urgent')}
            style={styles.select}
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
            <option value="urgent">Urgent</option>
          </select>
          <div style={styles.formActions}>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                ...styles.buttonPrimary,
                opacity: isSubmitting ? 0.7 : 1,
              }}
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              style={styles.buttonSecondary}
              disabled={isSubmitting}
            >
              Batal
            </button>
          </div>
        </form>
      )}
      
      {loading ? (
        <div style={styles.loadingState}>Memuat reminder...</div>
      ) : error ? (
        <div style={{...styles.emptyState, color: '#dc2626'}}>
          Error: {error}
        </div>
      ) : reminders.length === 0 ? (
        <div style={styles.emptyState}>
          Tidak ada reminder yang akan datang
        </div>
      ) : (
        reminders.map((reminder) => (
          <div key={reminder.id} style={styles.reminderItem}>
            <div style={styles.reminderTitle}>{reminder.title}</div>
            <div style={styles.reminderMeta}>
              <span style={styles.priorityBadge[reminder.priority]}>
                {reminder.priority === 'low' && 'Low'}
                {reminder.priority === 'medium' && 'Medium'}
                {reminder.priority === 'high' && 'High'}
                {reminder.priority === 'urgent' && 'Urgent'}
              </span>
              <span>
                <span style={styles.calendarIcon}>📅</span>
                {formatDate(reminder.dueDate)}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
