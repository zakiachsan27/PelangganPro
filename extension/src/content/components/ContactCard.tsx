import { h } from 'preact';
import type { ContactData } from '../../types';

interface ContactCardProps {
  contact: ContactData;
}

export function ContactCard({ contact }: ContactCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatPhone = (phone: string) => {
    // Format: 628123456789 -> +62 812-3456-789
    if (phone.startsWith('62')) {
      return `+62 ${phone.slice(2, 5)}-${phone.slice(5, 9)}-${phone.slice(9)}`;
    }
    return phone;
  };

  return (
    <div className="pp-header">
      <div className="pp-flex pp-items-center pp-gap-3">
        <div className="pp-avatar">
          {getInitials(contact.name)}
        </div>
        <div className="pp-flex-1 pp-min-w-0">
          <h2 className="pp-header-title pp-truncate">{contact.name}</h2>
          <p className="pp-header-subtitle">{formatPhone(contact.phone)}</p>
        </div>
      </div>
      
      {contact.tags.length > 0 && (
        <div className="pp-flex pp-flex-wrap pp-mt-3">
          {contact.tags.map(tag => (
            <span 
              key={tag.id} 
              className="pp-tag"
              style={{ 
                backgroundColor: tag.color + '20', 
                color: tag.color 
              }}
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
