import { h } from 'preact';
import { useState } from 'preact/hooks';
import type { ContactData } from '../../types';
import { crmClient } from '../../api/crm-client';

interface TaskFormProps {
  contact: ContactData;
  onTaskAdded: () => void;
}

export function TaskForm({ contact, onTaskAdded }: TaskFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    if (!title.trim() || !dueDate || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await crmClient.addReminder({
        contactId: contact.id,
        title: title.trim(),
        dueDate: new Date(dueDate).toISOString()
      });
      setTitle('');
      setDueDate('');
      setIsOpen(false);
      onTaskAdded();
    } catch (error) {
      console.error('Failed to add reminder:', error);
      alert('Gagal menambahkan reminder');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDateForInput = (date: Date) => {
    return date.toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm
  };

  // Default to tomorrow same time
  const getDefaultDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return formatDateForInput(tomorrow);
  };

  if (!isOpen) {
    return (
      <div className="pp-section">
        <button 
          className="pp-button"
          onClick={() => {
            setIsOpen(true);
            setDueDate(getDefaultDate());
          }}
        >
          📅 Tambah Reminder
        </button>
      </div>
    );
  }

  return (
    <div className="pp-section">
      <h3 className="pp-section-title">Tambah Reminder</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          className="pp-input pp-mb-2"
          placeholder="Judul reminder..."
          value={title}
          onChange={(e) => setTitle((e.target as HTMLInputElement).value)}
          disabled={isSubmitting}
        />
        <input
          type="datetime-local"
          className="pp-input pp-mb-3"
          value={dueDate}
          onChange={(e) => setDueDate((e.target as HTMLInputElement).value)}
          disabled={isSubmitting}
        />
        <div className="pp-flex pp-gap-2">
          <button 
            type="submit" 
            className="pp-button pp-button-primary pp-button-sm"
            disabled={isSubmitting || !title.trim() || !dueDate}
          >
            {isSubmitting ? 'Menyimpan...' : 'Simpan'}
          </button>
          <button 
            type="button" 
            className="pp-button pp-button-sm"
            onClick={() => {
              setIsOpen(false);
              setTitle('');
              setDueDate('');
            }}
            disabled={isSubmitting}
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}
