import { h } from 'preact';
import { useState } from 'preact/hooks';
import type { ContactData, NoteInfo } from '../../types';
import { crmClient } from '../../api/crm-client';
import { formatDate } from '../../utils/format';

interface NotesListProps {
  contact: ContactData;
  onNoteAdded: () => void;
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
  },
  formActions: {
    display: 'flex',
    gap: '8px',
    marginTop: '8px',
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
  buttonGhost: {
    padding: '4px 8px',
    borderRadius: '4px',
    border: 'none',
    background: 'transparent',
    fontSize: '11px',
    fontWeight: 500,
    color: '#6b7280',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  notesList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px',
  },
  noteItem: {
    background: '#f8fafc',
    borderRadius: '8px',
    padding: '12px',
    border: '1px solid #f1f5f9',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  noteContent: {
    fontSize: '13px',
    color: '#374151',
    lineHeight: 1.5,
    marginBottom: '8px',
    whiteSpace: 'pre-wrap' as const,
    wordBreak: 'break-word' as const,
  },
  noteMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '11px',
    color: '#9ca3af',
  },
  noteActions: {
    display: 'flex',
    gap: '4px',
  },
  emptyText: {
    fontSize: '13px',
    color: '#9ca3af',
    fontStyle: 'italic' as const,
    textAlign: 'center' as const,
    padding: '20px',
  },
  editIcon: {
    width: '12px',
    height: '12px',
  },
};

export function NotesList({ contact, onNoteAdded }: NotesListProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Edit state
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    if (!newNote.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await crmClient.addNote({
        contactId: contact.id,
        content: newNote.trim(),
      });
      setNewNote('');
      setIsAdding(false);
      onNoteAdded();
    } catch (error) {
      console.error('Failed to add note:', error);
      alert('Gagal menambahkan catatan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditStart = (note: NoteInfo) => {
    setEditingNoteId(note.id);
    setEditContent(note.content);
    setIsAdding(false); // Close add form if open
  };

  const handleEditCancel = () => {
    setEditingNoteId(null);
    setEditContent('');
  };

  const handleEditSubmit = async (e: Event) => {
    e.preventDefault();
    if (!editContent.trim() || !editingNoteId || isEditing) return;

    setIsEditing(true);
    try {
      await crmClient.updateNote({
        noteId: editingNoteId,
        content: editContent.trim(),
      });
      setEditingNoteId(null);
      setEditContent('');
      onNoteAdded();
    } catch (error) {
      console.error('Failed to update note:', error);
      alert('Gagal mengubah catatan');
    } finally {
      setIsEditing(false);
    }
  };

  const handleAddClick = () => {
    setIsAdding(true);
    setEditingNoteId(null); // Close any editing
    setEditContent('');
  };

  return (
    <div style={styles.section}>
      <div style={styles.header}>
        <span style={styles.title}>Catatan</span>
        {!isAdding && !editingNoteId && (
          <button
            onClick={handleAddClick}
            style={styles.addButton}
          >
            + Tambah
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} style={styles.form}>
          <textarea
            style={styles.textarea}
            placeholder="Tulis catatan..."
            value={newNote}
            onChange={(e) => setNewNote((e.target as HTMLTextAreaElement).value)}
            disabled={isSubmitting}
          />
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
                setNewNote('');
              }}
              style={styles.buttonSecondary}
              disabled={isSubmitting}
            >
              Batal
            </button>
          </div>
        </form>
      )}

      {contact.recentNotes && contact.recentNotes.length > 0 ? (
        <div style={styles.notesList}>
          {contact.recentNotes.map((note) => (
            <div 
              key={note.id} 
              style={styles.noteItem}
              onClick={(e) => {
                // Don't navigate if clicking edit button
                const target = e.target as HTMLElement;
                if (target.closest('button')) return;
                window.open(`http://localhost:3000/contacts/${contact.id}?tab=notes`, '_blank');
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = '#f1f5f9';
                (e.currentTarget as HTMLElement).style.borderColor = '#e2e8f0';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = '#f8fafc';
                (e.currentTarget as HTMLElement).style.borderColor = '#f1f5f9';
              }}
            >
              {editingNoteId === note.id ? (
                // Edit mode
                <form onSubmit={handleEditSubmit}>
                  <textarea
                    style={styles.textarea}
                    value={editContent}
                    onChange={(e) => setEditContent((e.target as HTMLTextAreaElement).value)}
                    disabled={isEditing}
                    autoFocus
                  />
                  <div style={styles.formActions}>
                    <button
                      type="submit"
                      style={{
                        ...styles.buttonPrimary,
                        opacity: isEditing ? 0.7 : 1,
                        cursor: isEditing ? 'not-allowed' : 'pointer',
                      }}
                      disabled={isEditing}
                    >
                      {isEditing ? 'Menyimpan...' : 'Simpan'}
                    </button>
                    <button
                      type="button"
                      onClick={handleEditCancel}
                      style={styles.buttonSecondary}
                      disabled={isEditing}
                    >
                      Batal
                    </button>
                  </div>
                </form>
              ) : (
                // View mode
                <>
                  <div style={styles.noteContent}>{note.content}</div>
                  <div style={styles.noteMeta}>
                    <span>{note.authorName} • {formatDate(note.createdAt)}</span>
                    <div style={styles.noteActions}>
                      <button
                        onClick={() => handleEditStart(note)}
                        style={styles.buttonGhost}
                        title="Edit catatan"
                      >
                        <svg style={styles.editIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                        Edit
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div style={styles.emptyText}>
          Belum ada catatan
        </div>
      )}
    </div>
  );
}
