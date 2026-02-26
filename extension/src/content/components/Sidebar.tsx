import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import type { ContactData } from '../../types';
import { crmClient } from '../../api/crm-client';
import { authStorage } from '../../storage/auth-storage';

import { ContactCard } from './ContactCard';
import { DealInfo } from './DealInfo';
import { NotesList } from './NotesList';
import { PipelineSelect } from './PipelineSelect';
import { AssignDropdown } from './AssignDropdown';
import { LoginPrompt } from './LoginPrompt';
import { TicketList } from './TicketList';
import { ReminderList } from './ReminderList';
import { ContactSearch } from './ContactSearch';

interface ContactOption {
  id: string;
  name: string;
  phone: string | null;
}



const SELECTED_CONTACT_KEY = 'pelangganpro_selected_contact';

// Styles object untuk konsistensi
const styles = {
  container: {
    width: '100%',
    height: '100%',
    overflowY: 'auto' as const,
    background: '#ffffff',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: '14px',
    lineHeight: 1.5,
    color: '#1f2937',
  },
  header: {
    padding: '16px 20px',
    borderBottom: '1px solid #e5e7eb',
    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
  },
  headerTitle: {
    fontSize: '16px',
    fontWeight: 700,
    color: '#ffffff',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  headerIcon: {
    width: '24px',
    height: '24px',
    background: 'rgba(255,255,255,0.2)',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
  },
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
  button: {
    padding: '6px 12px',
    borderRadius: '6px',
    border: '1px solid #d1d5db',
    background: '#ffffff',
    fontSize: '12px',
    fontWeight: 500,
    color: '#374151',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  buttonPrimary: {
    padding: '8px 16px',
    borderRadius: '6px',
    border: 'none',
    background: '#4f46e5',
    fontSize: '13px',
    fontWeight: 500,
    color: '#ffffff',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  buttonSm: {
    padding: '4px 10px',
    borderRadius: '4px',
    border: '1px solid #e5e7eb',
    background: '#f9fafb',
    fontSize: '11px',
    fontWeight: 500,
    color: '#6b7280',
    cursor: 'pointer',
  },
  select: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    fontSize: '13px',
    background: '#ffffff',
    cursor: 'pointer',
    outline: 'none',
  },
  input: {
    width: '100%',
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #e5e7eb',
    fontSize: '13px',
    outline: 'none',
  },
  emptyState: {
    textAlign: 'center' as const,
    padding: '40px 20px',
    color: '#9ca3af',
  },
  contactSelector: {
    padding: '16px 20px',
    background: '#f8fafc',
    borderBottom: '1px solid #e5e7eb',
  },
};

export function Sidebar() {
  const [contact, setContact] = useState<ContactData | null>(null);
  const [contactsList, setContactsList] = useState<ContactOption[]>([]);
  const [selectedContactId, setSelectedContactId] = useState<string>('');
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [loadingContact, setLoadingContact] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  
  // Add contact form state
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [addingContact, setAddingContact] = useState(false);

  // Check auth and load preferences on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Load contacts when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadContactsList();
    }
  }, [isAuthenticated]);



  const checkAuth = async () => {
    const auth = await authStorage.getAuth();
    setIsAuthenticated(!!auth);
  };

  const loadContactsList = async () => {
    setLoadingContacts(true);
    try {
      const contacts = await crmClient.getContacts();
      setContactsList(contacts);
    } catch (err) {
      console.error('Failed to load contacts list:', err);
      if (err instanceof Error && err.message.includes('401')) {
        setIsAuthenticated(false);
      }
    } finally {
      setLoadingContacts(false);
    }
  };

  const loadContactById = async (contactId: string, list = contactsList, bustCache = false) => {
    if (!contactId) return;
    
    const contactOption = list.find(c => c.id === contactId);
    if (!contactOption) return;

    setLoadingContact(true);
    try {
      // Use ID to fetch contact (more reliable than phone format variations)
      const data = await crmClient.getContact(contactId, undefined, false, bustCache, true);
      if (data) {
        setContact(data);
      } else {
        setContact({
          id: contactOption.id,
          name: contactOption.name,
          phone: contactOption.phone || '',
          email: null,
          tags: [],
          pipeline: null,
          deal: null,
          recentNotes: [],
          assignedTo: null,
        } as ContactData);
      }
    } catch (e) {
      setContact({
        id: contactOption.id,
        name: contactOption.name,
        phone: contactOption.phone || '',
        email: null,
        tags: [],
        pipeline: null,
        deal: null,
        recentNotes: [],
        assignedTo: null,
      } as ContactData);
    } finally {
      setLoadingContact(false);
    }
  };

  const handleAddContact = async (e: Event) => {
    e.preventDefault();
    if (!newContactName.trim()) return;

    setAddingContact(true);
    try {
      const newContact = await crmClient.createContact({
        first_name: newContactName.trim(),
        phone: newContactPhone.trim() || undefined,
        whatsapp: newContactPhone.trim() || undefined,
      });

      const updatedList = [newContact, ...contactsList];
      setContactsList(updatedList);
      setSelectedContactId(newContact.id);
      chrome.storage.local.set({ [SELECTED_CONTACT_KEY]: newContact.id });
      setNewContactName('');
      setNewContactPhone('');
      setShowAddContact(false);
      
      setContact({
        id: newContact.id,
        name: newContact.name,
        phone: newContact.phone || '',
        email: null,
        tags: [],
        pipeline: null,
        deal: null,
        recentNotes: [],
        assignedTo: null,
      } as ContactData);
    } catch (err) {
      console.error('Failed to create contact:', err);
      alert('Gagal menambahkan kontak');
    } finally {
      setAddingContact(false);
    }
  };

  const handleRefresh = () => {
    console.log('[Sidebar] Refresh triggered for contact:', selectedContactId);
    if (selectedContactId) {
      loadContactById(selectedContactId, contactsList, true);
    }
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  // Not authenticated
  if (!isAuthenticated) {
    return <LoginPrompt onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.headerTitle}>
          <span style={styles.headerIcon}>P</span>
          PelangganPro CRM
        </h2>
      </div>

      {/* Contact Selector */}
      <div style={styles.contactSelector}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionTitle}>Pilih Kontak</span>
          <button
            onClick={() => setShowAddContact(!showAddContact)}
            style={styles.buttonSm}
          >
            + Tambah
          </button>
        </div>
        
        <ContactSearch
          contacts={contactsList}
          selectedContactId={selectedContactId}
          onSelect={(contactId) => {
            setSelectedContactId(contactId);
            chrome.storage.local.set({ [SELECTED_CONTACT_KEY]: contactId });
            if (contactId) {
              loadContactById(contactId);
            } else {
              setContact(null);
            }
          }}
          loading={loadingContacts}
        />
        
        {loadingContacts && (
          <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '8px' }}>
            Memuat kontak...
          </div>
        )}

        {/* Add Contact Form */}
        {showAddContact && (
          <form onSubmit={handleAddContact} style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
            <input
              type="text"
              placeholder="Nama kontak..."
              value={newContactName}
              onChange={(e) => setNewContactName((e.target as HTMLInputElement).value)}
              style={{ ...styles.input, marginBottom: '8px' }}
              required
            />
            <input
              type="text"
              placeholder="Nomor WhatsApp (opsional)..."
              value={newContactPhone}
              onChange={(e) => setNewContactPhone((e.target as HTMLInputElement).value)}
              style={{ ...styles.input, marginBottom: '10px' }}
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="submit"
                disabled={addingContact}
                style={{
                  ...styles.buttonPrimary,
                  flex: 1,
                  opacity: addingContact ? 0.7 : 1,
                  cursor: addingContact ? 'not-allowed' : 'pointer',
                }}
              >
                {addingContact ? 'Menyimpan...' : 'Simpan'}
              </button>
              <button
                type="button"
                onClick={() => setShowAddContact(false)}
                style={styles.button}
              >
                Batal
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Loading state */}
      {loadingContact && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ width: '24px', height: '24px', border: '2px solid #e5e7eb', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
          <p style={{ marginTop: '12px', fontSize: '13px', color: '#6b7280' }}>Memuat data kontak...</p>
        </div>
      )}

      {/* No contact selected */}
      {!loadingContact && !selectedContactId && (
        <div style={styles.emptyState}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>👆</div>
          <p style={{ fontSize: '14px', color: '#6b7280' }}>
            Pilih kontak dari dropdown untuk melihat data CRM
          </p>
        </div>
      )}

      {/* Contact data */}
      {!loadingContact && selectedContactId && contact && (
        <>
          <ContactCard contact={contact} onContactUpdated={handleRefresh} />
          <TicketList contactId={contact.id} />
          <ReminderList contactId={contact.id} />
          <NotesList contact={contact} onNoteAdded={handleRefresh} />
          <DealInfo contact={contact} onDealUpdated={handleRefresh} />
          <PipelineSelect contact={contact} onStageChanged={handleRefresh} />
          <AssignDropdown contact={contact} onAssigned={handleRefresh} />
        </>
      )}
    </div>
  );
}
