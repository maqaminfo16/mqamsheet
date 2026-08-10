"use client";
import React, { useState } from 'react';
import { Table, Column } from './ui/Table';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { Send, Search, Copy, Check } from 'lucide-react';
import { Input } from './ui/Input';

export interface Lead {
  id: string;
  full_name: string;
  phone_raw: string;
  phone_cleaned: string;
  email?: string;
  sync_status: 'pending' | 'sent' | 'failed';
  sync_error?: string;
  deal_id?: string;
  created_at: string;
}

export interface LeadsTableProps {
  leads: Lead[];
  onSync?: (id: string) => void;
  onSyncAll?: () => void;
  loading?: boolean;
}

function CopyErrorButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} title="نسخ الخطأ" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: copied ? 'var(--success, #10b981)' : 'var(--text-secondary, #6b7280)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', marginTop: '-2px' }}>
      {copied ? <Check size={14} /> : <Copy size={14} />}
    </button>
  );
}

export function LeadsTable({ leads, onSync, onSyncAll, loading }: LeadsTableProps) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'sent' | 'failed'>('all');
  const [search, setSearch] = useState('');

  const filteredLeads = leads.filter(lead => {
    if (filter !== 'all' && lead.sync_status !== filter) return false;
    if (search && !lead.full_name.includes(search) && !lead.phone_cleaned.includes(search)) return false;
    return true;
  });

  const columns: Column<Lead>[] = [
    { key: 'full_name', header: 'الاسم' },
    { key: 'phone_raw', header: 'رقم الجوال (الأصلي)', hideOnMobile: true },
    { key: 'phone_cleaned', header: 'الرقم المنظف' },
    { key: 'email', header: 'الإيميل', render: (row) => row.email || '-', hideOnMobile: true },
    { 
      key: 'sync_status', 
      header: 'الحالة',
      render: (row) => {
        if (row.sync_status === 'sent') return <Badge variant="success">✅ مُرسل</Badge>;
        if (row.sync_status === 'failed') return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
            <div title={row.sync_error || 'خطأ غير معروف'}>
              <Badge variant="danger">❌ فشل</Badge>
            </div>
            {row.sync_error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span 
                  style={{ 
                    fontSize: '0.75rem', 
                    color: 'var(--danger, #ef4444)', 
                    maxWidth: '120px', 
                    whiteSpace: 'nowrap', 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis' 
                  }} 
                  title={row.sync_error}
                >
                  {row.sync_error}
                </span>
                <CopyErrorButton text={row.sync_error} />
              </div>
            )}
          </div>
        );
        return <Badge variant="warning">⏳ في الانتظار</Badge>;
      }
    },
    { key: 'deal_id', header: 'معرف الصفقة', render: (row) => row.deal_id || '-', hideOnMobile: true },
    { 
      key: 'created_at', 
      header: 'التاريخ والوقت', 
      hideOnMobile: true,
      render: (row) => new Date(row.created_at).toLocaleString('ar-SA', { 
        timeZone: 'Asia/Riyadh',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }) 
    },
    {
      key: 'actions',
      header: 'الإجراء',
      render: (row) => (
        row.sync_status !== 'sent' ? (
          <Button 
            size="sm" 
            variant="secondary" 
            onClick={() => onSync && onSync(row.id)}
            disabled={loading || !onSync}
          >
            إرسال
          </Button>
        ) : null
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="flex-col-mobile gap-sm-mobile" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Button variant={filter === 'all' ? 'primary' : 'ghost'} size="sm" onClick={() => setFilter('all')}>الكل</Button>
          <Button variant={filter === 'pending' ? 'primary' : 'ghost'} size="sm" onClick={() => setFilter('pending')}>في الانتظار</Button>
          <Button variant={filter === 'sent' ? 'primary' : 'ghost'} size="sm" onClick={() => setFilter('sent')}>مُرسل</Button>
          <Button variant={filter === 'failed' ? 'primary' : 'ghost'} size="sm" onClick={() => setFilter('failed')}>فشل</Button>
        </div>
        
        <div className="flex-col-mobile gap-sm-mobile" style={{ display: 'flex', gap: '12px', alignItems: 'center', width: '100%', justifyContent: 'flex-end' }}>
          <div className="search-input-mobile" style={{ width: '250px' }}>
            <Input 
              placeholder="بحث بالاسم أو الرقم..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search size={16} />}
            />
          </div>
          <Button variant="primary" icon={<Send size={16} />} onClick={onSyncAll} disabled={loading || !onSyncAll || leads.filter(l => l.sync_status !== 'sent').length === 0}>
            إرسال الكل
          </Button>
        </div>
      </div>
      
      <div className="glass" style={{ padding: '20px' }}>
        <Table columns={columns} data={filteredLeads} emptyMessage="لا يوجد عملاء مطابقين للبحث" />
        <div style={{ marginTop: '16px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          إجمالي النتائج: {filteredLeads.length}
        </div>
      </div>
    </div>
  );
}
