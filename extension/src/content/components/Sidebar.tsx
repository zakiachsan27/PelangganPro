import { h } from 'preact';
import { useState, useEffect, useCallback } from 'preact/hooks';
import type { ContactData, LoadingState } from '../../types';
import { crmClient } from '../../api/crm-client';
import { authStorage } from '../../storage/auth-storage';

import { ContactCard } from './ContactCard';
import { DealInfo } from './DealInfo';
import { NotesList } from './NotesList';
import { PipelineSelect } from './PipelineSelect';
import { AssignDropdown } from './AssignDropdown';
import { TaskForm } from './TaskForm';
import { ErrorState } from './ErrorState';

interface SidebarProps {
  phone: string;
}

const STORAGE_KEY = 'pelangganpro_sidebar_visible';

export function Sidebar({ phone }: SidebarProps) {
  const [contact, setContact] = useState<ContactData | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load visibility preference
  useEffect(() => {
    chrome.storage.local.get(STORAGE_KEY).then((result) => {
      if (result[STORAGE_KEY] !== undefined) {
        setIsVisible(result[STORAGE_KEY]);
      }
    });
  }, []);

  const toggleVisibility = () => {
    const newValue = !isVisible;
    setIsVisible(newValue);
    chrome.storage.local.set({ [STORAGE_KEY]: newValue });
  };

  const loadContact = useCallback(async () => {
    if (!phone) return;

    setLoadingState('loading');
    setError(null);

    try {
      // Try to get auth with retry
      let auth = null;
      let attempts = 0;
      const maxAttempts = 3;
      
      while (!auth && attempts < maxAttempts) {
        auth = await authStorage.getAuth();
        if (!auth) {
          attempts++;
          if (attempts < maxAttempts) {
            console.log(`[Sidebar] Auth retry ${attempts}/${maxAttempts}...`);
            await new Promise(r => setTimeout(r, 300));
          }
        }
      }
      
      setIsAuthenticated(!!auth);

      if (!auth) {
        setLoadingState('error');
        setError('NOT_AUTHENTICATED');
        return;
      }

      const data = await crmClient.getContact(phone);
      
      if (data) {
        setContact(data);
        setLoadingState('success');
      } else {
        setContact(null);
        setLoadingState('error');
        setError('NOT_FOUND');
      }
    } catch (err) {
      console.error('Failed to load contact:', err);
      setLoadingState('error');
      
      if (err instanceof Error) {
        const message = err.message;
        if (message.includes('NOT_AUTHENTICATED') || message.includes('401') || message.includes('Sesi habis')) {
          setError('NOT_AUTHENTICATED');
          setIsAuthenticated(false);
        } else if (message.includes('TIMEOUT') || message.includes('timeout')) {
          setError('TIMEOUT: Server tidak merespons dalam waktu 10 detik.');
        } else if (message.includes('NETWORK') || message.includes('network')) {
          setError('NETWORK_ERROR');
        } else {
          setError('UNKNOWN');
        }
      } else {
        setError('UNKNOWN');
      }
    }
  }, [phone]);

  useEffect(() => {
    loadContact();
  }, [loadContact]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadContact().finally(() => {
      setTimeout(() => setIsRefreshing(false), 500);
    });
  };

  // Toggle button (always visible)
  const ToggleButton = () => (
    <button
      onClick={toggleVisibility}
      style={{
        position: 'fixed',
        right: isVisible ? '320px' : '0',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 10000,
        width: '24px',
        height: '60px',
        background: '#4f46e5',
        color: 'white',
        border: 'none',
        borderRadius: '4px 0 0 4px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '14px',
        boxShadow: '-2px 0 8px rgba(0,0,0,0.1)',
        transition: 'right 0.3s ease'
      }}
      title={isVisible ? 'Sembunyikan CRM' : 'Tampilkan CRM'}
    >
      {isVisible ? '›' : '‹'}
    </button>
  );

  if (!isVisible) {
    return <ToggleButton />;
  }

  // Loading state
  if (loadingState === 'loading' && !contact) {
    return (
      <>
        <ToggleButton />
        <div className="pp-sidebar">
          <div className="pp-loading">
            <div className="pp-spinner" />
          </div>
        </div>
      </>
    );
  }

  // Error states
  if (loadingState === 'error' || !isAuthenticated) {
    return (
      <>
        <ToggleButton />
        <div className="pp-sidebar">
          <ErrorState 
            type={error === 'NOT_AUTHENTICATED' ? 'not_authenticated' : 
                  error === 'NOT_FOUND' ? 'not_found' :
                  error === 'NETWORK_ERROR' ? 'network_error' : 
                  error === 'UNKNOWN' ? 'unknown' : 'unknown'}
            message={error && error !== 'NOT_AUTHENTICATED' && error !== 'NOT_FOUND' && error !== 'NETWORK_ERROR' && error !== 'UNKNOWN' ? error : undefined}
            onRetry={handleRefresh}
          />
        </div>
      </>
    );
  }

  // No contact found
  if (!contact) {
    return (
      <>
        <ToggleButton />
        <div className="pp-sidebar">
          <ErrorState type="not_found" />
        </div>
      </>
    );
  }

  // Success - render contact data
  return (
    <>
      <ToggleButton />
      <div className="pp-sidebar">
        {isRefreshing && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: 'linear-gradient(90deg, #4f46e5, #7c3aed)',
            animation: 'pp-pulse 1s infinite'
          }} />
        )}
        
        <ContactCard contact={contact} />
        
        {contact.upcomingTask && (
          <div className="pp-section" style={{ background: '#fef3c7' }}>
            <h3 className="pp-section-title">⏰ Reminder</h3>
            <p className="pp-font-medium">{contact.upcomingTask.title}</p>
            <p className="pp-text-xs pp-text-gray-600 pp-mt-1">
              {new Date(contact.upcomingTask.dueDate).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        )}

        <DealInfo contact={contact} />
        
        <NotesList 
          contact={contact} 
          onNoteAdded={handleRefresh} 
        />
        
        <PipelineSelect 
          contact={contact} 
          onStageChanged={handleRefresh} 
        />
        
        <AssignDropdown 
          contact={contact} 
          onAssigned={handleRefresh} 
        />
        
        <TaskForm 
          contact={contact} 
          onTaskAdded={handleRefresh} 
        />

        <div className="pp-section" style={{ marginTop: 'auto', borderTop: '1px solid #e5e7eb' }}>
          <button 
            className="pp-button pp-button-sm"
            onClick={() => window.open(`http://localhost:3000/contacts/${contact.id}`, '_blank')}
          >
            Buka di CRM →
          </button>
        </div>
      </div>
    </>
  );
}
