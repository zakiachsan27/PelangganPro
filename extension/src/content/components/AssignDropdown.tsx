import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import type { ContactData } from '../../types';

interface AssignDropdownProps {
  contact: ContactData;
  onAssigned: () => void;
}

export function AssignDropdown({ contact }: AssignDropdownProps) {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Sementara hanya display, belum bisa assign
  // Karena butuh fetch agents dari API (UUID required)
  return (
    <div className="pp-section">
      <h3 className="pp-section-title">Assign ke</h3>
      
      {contact.assignedTo ? (
        <div className="pp-flex pp-items-center pp-gap-2 pp-p-2 pp-bg-gray-50 pp-rounded">
          <div className="pp-avatar" style={{ width: '28px', height: '28px', fontSize: '12px' }}>
            {getInitials(contact.assignedTo.name)}
          </div>
          <span className="pp-text-sm pp-font-medium">{contact.assignedTo.name}</span>
        </div>
      ) : (
        <p className="pp-text-sm pp-text-gray-500">Belum di-assign</p>
      )}
      
      <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '8px' }}>
        * Assign via dashboard CRM
      </p>
    </div>
  );
}
