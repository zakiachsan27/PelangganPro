import { h } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';

interface ContactOption {
  id: string;
  name: string;
  phone: string | null;
}

interface ContactSearchProps {
  contacts: ContactOption[];
  selectedContactId: string;
  onSelect: (contactId: string) => void;
  loading: boolean;
}

const styles = {
  container: {
    position: 'relative' as const,
  },
  input: {
    width: '100%',
    padding: '10px 32px 10px 12px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    fontSize: '13px',
    background: '#ffffff',
    outline: 'none',
    boxSizing: 'border-box' as const,
  },
  dropdown: {
    position: 'absolute' as const,
    top: '100%',
    left: 0,
    right: 0,
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    marginTop: '4px',
    maxHeight: '250px',
    overflowY: 'auto' as const,
    zIndex: 1000,
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    pointerEvents: 'auto' as const,
  },
  dropdownItem: {
    padding: '10px 12px',
    cursor: 'pointer',
    borderBottom: '1px solid #f3f4f6',
    fontSize: '13px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '2px',
    userSelect: 'none' as const,
    pointerEvents: 'auto' as const,
  },
  dropdownItemName: {
    fontWeight: 500,
    color: '#1f2937',
  },
  dropdownItemPhone: {
    fontSize: '12px',
    color: '#6b7280',
  },
  dropdownItemSelected: {
    background: '#eff6ff',
  },
  dropdownItemHover: {
    background: '#f9fafb',
  },
  emptyState: {
    padding: '12px',
    textAlign: 'center' as const,
    color: '#9ca3af',
    fontSize: '12px',
  },
  selectedDisplay: {
    padding: '10px 12px',
    background: '#eff6ff',
    borderRadius: '8px',
    border: '1px solid #bfdbfe',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedName: {
    fontWeight: 500,
    color: '#1e40af',
    fontSize: '13px',
  },
  selectedPhone: {
    fontSize: '12px',
    color: '#3b82f6',
  },
  changeText: {
    fontSize: '11px',
    color: '#6b7280',
  },
  clearButton: {
    position: 'absolute' as const,
    right: '8px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: '#f3f4f6',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    padding: '2px 6px',
    color: '#6b7280',
    fontSize: '14px',
    lineHeight: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};

export function ContactSearch({ 
  contacts, 
  selectedContactId, 
  onSelect, 
  loading 
}: ContactSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filteredContacts, setFilteredContacts] = useState<ContactOption[]>(contacts);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedContact = contacts.find(c => c.id === selectedContactId);

  // Filter contacts based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredContacts(contacts);
      setHighlightedIndex(0);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = contacts.filter(contact => 
      contact.name.toLowerCase().includes(term) ||
      (contact.phone && contact.phone.includes(term))
    );
    setFilteredContacts(filtered);
    setHighlightedIndex(0);
  }, [searchTerm, contacts]);

  // Handle click outside to close dropdown - use capture phase to ensure we process clicks correctly
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      // Use capture: true to ensure this runs after item click handlers
      document.addEventListener('click', handleClickOutside, true);
      return () => document.removeEventListener('click', handleClickOutside, true);
    }
  }, [isOpen]);

  const handleInputChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    setSearchTerm(target.value);
    setIsOpen(true);
  };

  const handleSelectContact = (contactId: string) => {
    onSelect(contactId);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredContacts.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : 0);
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredContacts[highlightedIndex]) {
          handleSelectContact(filteredContacts[highlightedIndex].id);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
    }
  };

  const handleClear = (e: Event) => {
    e.stopPropagation();
    setSearchTerm('');
    setIsOpen(true);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleSelectedClick = () => {
    setIsOpen(true);
    if (selectedContact) {
      setSearchTerm(selectedContact.name);
    } else {
      setSearchTerm('');
    }
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 0);
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <input
          type="text"
          placeholder="Memuat kontak..."
          disabled
          style={styles.input}
        />
      </div>
    );
  }

  // Show selected contact with option to change, or placeholder if none selected
  if (!isOpen) {
    if (selectedContact) {
      return (
        <div style={styles.container}>
          <div style={styles.selectedDisplay} onClick={handleSelectedClick}>
            <div>
              <div style={styles.selectedName}>{selectedContact.name}</div>
              {selectedContact.phone && (
                <div style={styles.selectedPhone}>{selectedContact.phone}</div>
              )}
            </div>
            <span style={styles.changeText}>Ganti →</span>
          </div>
        </div>
      );
    }
    
    // No contact selected - show placeholder
    return (
      <div style={styles.container}>
        <div 
          style={{
            ...styles.selectedDisplay,
            background: '#f9fafb',
            borderColor: '#e5e7eb',
          }} 
          onClick={handleSelectedClick}
        >
          <span style={{ color: '#9ca3af', fontSize: '13px' }}>-- Pilih kontak --</span>
          <span style={styles.changeText}>Pilih →</span>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container} ref={containerRef}>
      <div style={{ position: 'relative' }}>
        <input
          ref={inputRef}
          type="text"
          placeholder="Cari nama atau nomor telepon..."
          value={searchTerm}
          onInput={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          style={styles.input}
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          spellcheck={false}
        />
        {searchTerm && (
          <button 
            type="button"
            style={styles.clearButton}
            onClick={handleClear}
            title="Clear search"
          >
            ×
          </button>
        )}
      </div>

      {isOpen && (
        <div style={styles.dropdown}>
          {filteredContacts.length > 0 ? (
            filteredContacts.map((contact, index) => {
              const isSelected = contact.id === selectedContactId;
              const isHighlighted = index === highlightedIndex;
              
              return (
                <div
                  key={contact.id}
                  onMouseDown={(e: MouseEvent) => {
                    // Use mousedown to capture before click outside handler fires
                    e.stopPropagation();
                    handleSelectContact(contact.id);
                  }}
                  style={{
                    ...styles.dropdownItem,
                    ...(isSelected ? styles.dropdownItemSelected : {}),
                    ...(isHighlighted ? styles.dropdownItemHover : {}),
                  }}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  <span style={styles.dropdownItemName}>{contact.name}</span>
                  {contact.phone && (
                    <span style={styles.dropdownItemPhone}>{contact.phone}</span>
                  )}
                </div>
              );
            })
          ) : (
            <div style={styles.emptyState}>
              Tidak ditemukan kontak "{searchTerm}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
