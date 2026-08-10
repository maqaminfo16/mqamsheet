import React from 'react';
import Link from 'next/link';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { Settings, FileText, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Button } from './ui/Button';

export interface SheetStats {
  total_leads: number;
  sent_leads: number;
  failed_leads: number;
  pending_leads: number;
}

export interface SheetConfig {
  id: string;
  name: string;
  source?: string | null;
  is_active: boolean;
  auto_sync: boolean;
}

export interface SheetCardProps {
  sheet: SheetConfig & SheetStats;
}

export function SheetCard({ sheet }: SheetCardProps) {
  return (
    <Card 
      style={{ padding: '20px' }}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.1rem', flexWrap: 'wrap' }}>
          <span style={{ flex: 1, minWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={sheet.name}>{sheet.name}</span>
          {sheet.source && (
            <Badge variant="info" style={{ flexShrink: 0 }}>{sheet.source}</Badge>
          )}
        </div>
      }
      actions={
        <Badge variant={sheet.is_active ? 'success' : 'danger'}>
          {sheet.is_active ? 'نشط' : 'متوقف'}
        </Badge>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          <Settings size={16} />
          <span>المزامنة التلقائية: {sheet.auto_sync ? <span style={{ color: 'var(--success)' }}>مفعلة</span> : <span style={{ color: 'var(--warning)' }}>معطلة</span>}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', backgroundColor: 'rgba(0,0,0,0.03)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: 'var(--success)' }}><CheckCircle2 size={14}/> مُرسل</span>
            <span style={{ fontWeight: 600 }}>{sheet.sent_leads}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: 'var(--warning)' }}><Clock size={14}/> انتظار</span>
            <span style={{ fontWeight: 600 }}>{sheet.pending_leads}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: 'var(--danger)' }}><XCircle size={14}/> فشل</span>
            <span style={{ fontWeight: 600 }}>{sheet.failed_leads}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: 'auto' }}>
          <Link href={`/sheets/${sheet.id}`} style={{ flex: 1, textDecoration: 'none' }}>
            <Button variant="primary" style={{ width: '100%' }} icon={<FileText size={16} />}>التفاصيل</Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
