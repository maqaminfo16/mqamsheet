"use client";
import React, { useState, useEffect } from 'react';
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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(30);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, search, itemsPerPage]);

  const filteredLeads = leads.filter(lead => {
    if (filter !== 'all' && lead.sync_status !== filter) return false;
    if (search && !lead.full_name.includes(search) && !lead.phone_cleaned.includes(search)) return false;
    return true;
  });

  const totalItems = filteredLeads.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedLeads = filteredLeads.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

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
      render: (row) => {
        const d = new Date(row.created_at);
        const dateStr = d.toLocaleDateString('en-GB', { timeZone: 'Asia/Riyadh' });
        const timeStr = d.toLocaleTimeString('en-US', { timeZone: 'Asia/Riyadh', hour: '2-digit', minute: '2-digit', hour12: true });
        const timeAr = timeStr.replace('AM', 'ص').replace('PM', 'م');
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', whiteSpace: 'nowrap' }}>
            <span style={{ fontSize: '0.85rem' }}>{dateStr}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #6b7280)' }}>{timeAr}</span>
          </div>
        );
      }
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
        <Table columns={columns} data={paginatedLeads} emptyMessage="لا يوجد عملاء مطابقين للبحث" />
        
        <div style={{ 
          marginTop: '16px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            إجمالي العملاء: {totalItems} | يعرض {startItem} إلى {endItem}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>عدد العملاء بالصفحة:</span>
              <select 
                value={itemsPerPage} 
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                style={{ 
                  padding: '4px 8px', 
                  borderRadius: '4px', 
                  border: '1px solid var(--border-color, #e5e7eb)',
                  background: 'var(--bg-primary, transparent)',
                  color: 'inherit',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value={30} style={{ color: '#000' }}>30</option>
                <option value={60} style={{ color: '#000' }}>60</option>
                <option value={100} style={{ color: '#000' }}>100</option>
              </select>
            </div>

            {totalPages > 1 && (
              <div style={{ display: 'flex', gap: '4px' }}>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  السابق
                </Button>
                <div style={{ display: 'flex', alignItems: 'center', padding: '0 8px', fontSize: '0.9rem' }}>
                  {currentPage} من {totalPages}
                </div>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  التالي
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
