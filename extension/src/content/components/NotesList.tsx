import { h } from 'preact';
import type { ContactData } from '../../types';
import { useState } from 'preact/hooks';
import { crmClient } from '../../api/crm-client';

interface NotesListProps {
  contact: ContactData;
  onNoteAdded: () => void;
}

export function NotesList({ contact, onNoteAdded }: NotesListProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const openExtensionPopup = () => {
    chrome.runtime.sendMessage({ type: 'OPEN_POPUP' });
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    if (!newNote.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await crmClient.addNote({
        contactId: contact.id,
        content: newNote.trim()
      });
      
      setNewNote('');
      setIsAdding(false);
      onNoteAdded();
    } catch (error) {
      console.error('Failed to add note:', error);
      
      if (error instanceof Error) {
        const message = error.message;
        
        if (message.includes('NOT_AUTHENTICATED') || message.includes('401') || message.includes('Sesi habis')) {
          setError('SESSION_EXPIRED');
        } else if (message.includes('TIMEOUT') || message.includes('timeout')) {
          setError('TIMEOUT: Server tidak merespons. Silakan coba lagi.');
        } else if (message.includes('NETWORK') || message.includes('network')) {
          setError('NETWORK_ERROR: Periksa koneksi internet Anda.');
        } else {
          setError(message);
        }
      } else {
        setError('Gagal menambahkan catatan. Silakan coba lagi.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pp-section">
      <div className="pp-flex pp-justify-between pp-items-center pp-mb-3">
        <h3 className="pp-section-title pp-mb-0">Catatan</h3>
        {!isAdding && (
          <button 
            className="pp-button pp-button-sm"
            onClick={() => setIsAdding(true)}
          >
            + Tambah
          </button>
        )}
      </div>

      {error === 'SESSION_EXPIRED' && (
        <div style={{ 
          background: '#fee2e2', 
          color: '#dc2626', 
          padding: '12px', 
          borderRadius: '6px', 
          fontSize: '13px',
          marginBottom: '12px'
        }}>
          <p style={{ margin: '0 0 8px 0' }}>Sesi habis. Silakan login ulang.</p>
          <button
            onClick={openExtensionPopup}
            style={{
              background: '#dc2626',
              color: 'white',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '4px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            Login Ulang
          </button>
        </div>
      )}

      {error && error !== 'SESSION_EXPIRED' && (
        <div style={{ 
          background: '#fee2e2', 
          color: '#dc2626', 
          padding: '8px', 
          borderRadius: '4px', 
          fontSize: '12px',
          marginBottom: '12px'
        }}>
          {error}
        </div>
      )}

      {isAdding && (
        <form onSubmit={handleSubmit} className="pp-mb-3">
          <textarea
            className="pp-textarea pp-mb-2"
            placeholder="Tulis catatan..."
            value={newNote}
            onChange={(e) => setNewNote((e.target as HTMLTextAreaElement).value)}
            disabled={isSubmitting}
          />
          <div className="pp-flex pp-gap-2">
            <button 
              type="submit" 
              className="pp-button pp-button-primary pp-button-sm"
              disabled={isSubmitting || !newNote.trim()}
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan'}
            </button>
            <button 
              type="button" 
              className="pp-button pp-button-sm"
              onClick={() => {
                setIsAdding(false);
                setNewNote('');
                setError(null);
              }}
              disabled={isSubmitting}
            >
              Batal
            </button>
          </div>
        </form>
      )}

      {contact.recentNotes.length === 0 ? (
        <p className="pp-text-sm pp-text-gray-500">Belum ada catatan</p>
      ) : (
        <div>
          {contact.recentNotes.map((note) => (
            <div key={note.id} className="pp-note-item">
              <p>{note.content}</p>
              <p className="pp-note-date">
                {note.authorName} • {formatDate(note.createdAt)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
