import { useState, useEffect, useCallback } from 'react';
import { crmClient } from '../../api/crm-client';
import type { MessageScheduler } from '../../types';

interface SchedulerListProps {
  contactId?: string;
  phone?: string;
}

export function SchedulerList(_props: SchedulerListProps) {
  const [schedulers, setSchedulers] = useState<MessageScheduler[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const loadSchedulers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await crmClient.getSchedulers();
      // Filter only pending and sending schedulers for quick view
      const active = data.filter(
        (s: MessageScheduler) => s.status === 'pending' || s.status === 'sending' || s.status === 'paused'
      );
      setSchedulers(active);
    } catch (err) {
      console.error('Failed to load schedulers:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (expanded) {
      loadSchedulers();
    }
  }, [expanded, loadSchedulers]);

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Menunggu';
      case 'sending':
        return 'Mengirim';
      case 'paused':
        return 'Dijeda';
      case 'completed':
        return 'Selesai';
      case 'failed':
        return 'Gagal';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return { bg: '#f3f4f6', color: '#6b7280' };
      case 'sending':
        return { bg: '#dbeafe', color: '#2563eb' };
      case 'paused':
        return { bg: '#fef3c7', color: '#d97706' };
      case 'completed':
        return { bg: '#d1fae5', color: '#059669' };
      case 'failed':
        return { bg: '#fee2e2', color: '#dc2626' };
      default:
        return { bg: '#f3f4f6', color: '#6b7280' };
    }
  };

  return (
    <div style={styles.section}>
      <div 
        style={styles.header}
        onClick={() => setExpanded(!expanded)}
      >
        <span style={styles.title}>📅 SCHEDULER</span>
        <span style={styles.expandIcon}>{expanded ? '▼' : '▶'}</span>
      </div>

      {expanded && (
        <div style={styles.content}>
          {loading ? (
            <div style={styles.loading}>Memuat...</div>
          ) : schedulers.length === 0 ? (
            <div style={styles.empty}>
              Tidak ada jadwal aktif
              <button
                style={styles.createBtn}
                onClick={() => {
                  window.open(`${API_BASE_URL}/scheduler`, '_blank');
                }}
              >
                Buat di Dashboard
              </button>
            </div>
          ) : (
            <div style={styles.list}>
              {schedulers.map((scheduler) => {
                const statusStyle = getStatusColor(scheduler.status);
                return (
                  <div key={scheduler.id} style={styles.item}>
                    <div style={styles.itemHeader}>
                      <span style={styles.itemName}>{scheduler.name}</span>
                      <span
                        style={{
                          ...styles.status,
                          backgroundColor: statusStyle.bg,
                          color: statusStyle.color,
                        }}
                      >
                        {getStatusText(scheduler.status)}
                      </span>
                    </div>
                    <div style={styles.progress}>
                      <div style={styles.progressBar}>
                        <div
                          style={{
                            ...styles.progressFill,
                            width: `${(scheduler.sent_count / scheduler.total_count) * 100}%`,
                          }}
                        />
                      </div>
                      <span style={styles.progressText}>
                        {scheduler.sent_count}/{scheduler.total_count}
                      </span>
                    </div>
                  </div>
                );
              })}
              <button
                style={styles.viewAllBtn}
                onClick={() => {
                  window.open(`${API_BASE_URL}/scheduler`, '_blank');
                }}
              >
                Lihat Semua Jadwal →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

const styles = {
  section: {
    padding: '12px 16px',
    borderBottom: '1px solid #e2e8f0',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    userSelect: 'none' as const,
  },
  title: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#64748b',
    letterSpacing: '0.5px',
  },
  expandIcon: {
    fontSize: '10px',
    color: '#94a3b8',
  },
  content: {
    marginTop: '12px',
  },
  loading: {
    fontSize: '12px',
    color: '#94a3b8',
    textAlign: 'center' as const,
    padding: '12px',
  },
  empty: {
    fontSize: '12px',
    color: '#94a3b8',
    textAlign: 'center' as const,
    padding: '12px',
  },
  createBtn: {
    display: 'block',
    marginTop: '8px',
    padding: '6px 12px',
    fontSize: '11px',
    color: '#4f46e5',
    backgroundColor: '#eef2ff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    width: '100%',
  },
  list: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  item: {
    padding: '10px',
    backgroundColor: '#f8fafc',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
  },
  itemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '6px',
  },
  itemName: {
    fontSize: '12px',
    fontWeight: 500,
    color: '#1e293b',
  },
  status: {
    fontSize: '9px',
    padding: '2px 6px',
    borderRadius: '4px',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
  },
  progress: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  progressBar: {
    flex: 1,
    height: '4px',
    backgroundColor: '#e2e8f0',
    borderRadius: '2px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: '2px',
    transition: 'width 0.3s ease',
  },
  progressText: {
    fontSize: '10px',
    color: '#64748b',
    minWidth: '35px',
    textAlign: 'right' as const,
  },
  viewAllBtn: {
    marginTop: '8px',
    padding: '8px',
    fontSize: '11px',
    color: '#4f46e5',
    backgroundColor: 'transparent',
    border: '1px dashed #c7d2fe',
    borderRadius: '4px',
    cursor: 'pointer',
    width: '100%',
    textAlign: 'center' as const,
  },
};
