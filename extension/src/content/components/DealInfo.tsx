import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import type { ContactData, PipelineInfo } from '../../types';
import { crmClient } from '../../api/crm-client';
import { formatCurrency } from '../../utils/format';

interface DealInfoProps {
  contact: ContactData;
  onDealUpdated?: () => void;
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
    border: '1px solid #4f46e5',
    background: '#ffffff',
    fontSize: '11px',
    fontWeight: 500,
    color: '#4f46e5',
    cursor: 'pointer',
  },
  dealCard: {
    background: '#f8fafc',
    borderRadius: '8px',
    padding: '14px',
    border: '1px solid #e2e8f0',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  dealCardHover: {
    background: '#f1f5f9',
    borderColor: '#cbd5e1',
  },
  dealTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#1f2937',
    marginBottom: '8px',
  },
  dealValue: {
    fontSize: '18px',
    fontWeight: 700,
    color: '#059669',
    marginBottom: '8px',
  },
  stageBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '9999px',
    fontSize: '11px',
    fontWeight: 600,
    background: '#dbeafe',
    color: '#1e40af',
  },
  emptyState: {
    textAlign: 'center' as const,
    padding: '16px',
    background: '#f9fafb',
    borderRadius: '8px',
    border: '1px dashed #e2e8f0',
  },
  emptyText: {
    fontSize: '13px',
    color: '#9ca3af',
    marginBottom: '8px',
  },
  form: {
    background: '#f8fafc',
    borderRadius: '8px',
    padding: '14px',
    border: '1px solid #e2e8f0',
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
  inputGroup: {
    display: 'flex',
    gap: '8px',
    marginBottom: '8px',
  },
  select: {
    flex: 1,
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #e5e7eb',
    fontSize: '13px',
    outline: 'none',
    background: '#ffffff',
    cursor: 'pointer',
  },
  formActions: {
    display: 'flex',
    gap: '8px',
    marginTop: '12px',
  },
  buttonPrimary: {
    flex: 1,
    padding: '8px 12px',
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
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #e5e7eb',
    background: '#ffffff',
    color: '#6b7280',
    fontSize: '12px',
    fontWeight: 500,
    cursor: 'pointer',
  },
};

function getStatusStyle(status?: string): { bg: string; color: string; label: string } {
  switch (status) {
    case 'won':
      return { bg: '#dcfce7', color: '#166534', label: 'Menang' };
    case 'lost':
      return { bg: '#fee2e2', color: '#991b1b', label: 'Kalah' };
    default:
      return { bg: '#dbeafe', color: '#1e40af', label: 'Prospek' };
  }
}

export function DealInfo({ contact, onDealUpdated }: DealInfoProps) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [value, setValue] = useState('');
  const [displayValue, setDisplayValue] = useState('');
  const [currency, setCurrency] = useState('IDR');
  const [creating, setCreating] = useState(false);
  const [pipelines, setPipelines] = useState<PipelineInfo[]>([]);
  const [selectedPipelineId, setSelectedPipelineId] = useState('');
  const [selectedStageId, setSelectedStageId] = useState('');
  const [loadingPipelines, setLoadingPipelines] = useState(false);

  const dealStatus = contact.deal?.status;
  const statusStyle = getStatusStyle(dealStatus);

  const formatNumber = (num: string): string => {
    // Remove non-digit characters
    const digits = num.replace(/\D/g, '');
    // Add thousand separators
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const handleValueChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const rawValue = target.value.replace(/\./g, '');
    const formattedValue = formatNumber(rawValue);
    setValue(rawValue);
    setDisplayValue(formattedValue);
  };

  // Fetch pipelines when form is shown
  useEffect(() => {
    if (showForm) {
      loadPipelines();
    }
  }, [showForm]);

  const loadPipelines = async () => {
    setLoadingPipelines(true);
    try {
      const data = await crmClient.getPipelines();
      console.log('[DealInfo] Loaded pipelines:', data);
      setPipelines(data);
      // Auto-select first pipeline and its first stage (hidden)
      if (data.length > 0) {
        const firstPipeline = data[0];
        setSelectedPipelineId(firstPipeline.id);
        console.log('[DealInfo] First pipeline:', firstPipeline.name, 'Stages:', firstPipeline.stages);
        if (firstPipeline.stages && firstPipeline.stages.length > 0) {
          setSelectedStageId(firstPipeline.stages[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load pipelines:', err);
    } finally {
      setLoadingPipelines(false);
    }
  };

  const handleCreateDeal = async (e: Event) => {
    e.preventDefault();
    if (!title.trim() || !selectedPipelineId || !selectedStageId) return;

    setCreating(true);
    try {
      await crmClient.createDeal({
        contactId: contact.id,
        title: title.trim(),
        value: parseFloat(value) || 0,
        currency,
        pipelineId: selectedPipelineId,
        stageId: selectedStageId,
      });
      setShowForm(false);
      setTitle('');
      setValue('');
      setDisplayValue('');
      setSelectedPipelineId('');
      setSelectedStageId('');
      onDealUpdated?.();
    } catch (err: any) {
      console.error('Failed to create deal:', err);
      const errorMsg = err?.message || 'Gagal membuat deal';
      alert('Gagal membuat deal: ' + errorMsg);
    } finally {
      setCreating(false);
    }
  };

  const openDealInCRM = () => {
    if (contact.deal?.id) {
      window.open(`http://localhost:3000/deals/${contact.deal.id}`, '_blank');
    }
  };

  return (
    <div style={styles.section}>
      <div style={styles.header}>
        <span style={styles.title}>Deal</span>
        {!contact.deal && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            style={styles.addButton}
          >
            + Buat
          </button>
        )}
      </div>

      {showForm ? (
        <form onSubmit={handleCreateDeal} style={styles.form}>
          <input
            type="text"
            placeholder="Nama deal..."
            value={title}
            onChange={(e) => setTitle((e.target as HTMLInputElement).value)}
            style={styles.input}
            required
            autoFocus
          />
          <div style={styles.inputGroup}>
            <input
              type="text"
              inputMode="numeric"
              placeholder="Nilai"
              value={displayValue}
              onChange={handleValueChange}
              style={{ ...styles.input, flex: 2, marginBottom: 0 }}
            />
            <select
              value={currency}
              onChange={(e) => setCurrency((e.target as HTMLSelectElement).value)}
              style={{ ...styles.select, flex: 1 }}
            >
              <option value="IDR">IDR</option>
              <option value="USD">USD</option>
            </select>
          </div>
          
          {loadingPipelines ? (
            <div style={{ ...styles.input, marginBottom: '8px', color: '#6b7280' }}>
              Memuat stage...
            </div>
          ) : pipelines.length === 0 ? (
            <div style={{ ...styles.input, marginBottom: '8px', color: '#dc2626' }}>
              Tidak ada pipeline. Buat pipeline di CRM terlebih dahulu.
            </div>
          ) : (
            <select
              value={selectedStageId}
              onChange={(e) => setSelectedStageId((e.target as HTMLSelectElement).value)}
              style={{ ...styles.input, marginBottom: '8px' }}
              required
            >
              <option value="">Pilih Stage</option>
              {pipelines[0]?.stages?.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          )}
          <div style={styles.formActions}>
            <button
              type="submit"
              disabled={creating}
              style={{
                ...styles.buttonPrimary,
                opacity: creating ? 0.7 : 1,
              }}
            >
              {creating ? 'Menyimpan...' : 'Simpan'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              style={styles.buttonSecondary}
              disabled={creating}
            >
              Batal
            </button>
          </div>
        </form>
      ) : contact.deal ? (
        <div
          style={{
            ...styles.dealCard,
            borderColor: dealStatus === 'won' ? '#86efac' : dealStatus === 'lost' ? '#fca5a5' : '#e2e8f0',
          }}
          onClick={openDealInCRM}
          title="Klik untuk buka di CRM"
        >
          <div style={styles.dealTitle}>{contact.deal.title}</div>
          <div style={{
            ...styles.dealValue,
            color: dealStatus === 'won' ? '#059669' : dealStatus === 'lost' ? '#dc2626' : '#059669',
          }}>
            {formatCurrency(contact.deal.value, contact.deal.currency)}
          </div>
          <span style={{
            ...styles.stageBadge,
            background: statusStyle.bg,
            color: statusStyle.color,
          }}>
            {contact.pipeline?.stage || statusStyle.label}
            {dealStatus && dealStatus !== 'open' && ` (${statusStyle.label})`}
          </span>
        </div>
      ) : (
        <div style={styles.emptyState}>
          <div style={styles.emptyText}>Belum ada deal</div>
        </div>
      )}
    </div>
  );
}
