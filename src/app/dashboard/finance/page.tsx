'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { Card, Badge, Button, Avatar } from '@/components/ui';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight,
  MoreVertical,
  Plus,
  Download,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  X,
  Trash2
} from 'lucide-react';

import { useLanguage } from '@/lib/i18n';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function FinancePage() {
  const { t } = useLanguage();
  const { data: invoices, mutate: mutateInvoices, isLoading: invoicesLoading } = useSWR('/api/invoices', fetcher, { fallbackData: [] });
  const { data: transactions, mutate: mutateTransactions, isLoading: transactionsLoading } = useSWR('/api/transactions', fetcher, { fallbackData: [] });
  
  // Modals state
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Invoice Form
  const [invoiceData, setInvoiceData] = useState({ client: '', amount: '', status: 'pending', dueDate: '' });
  
  // Transaction Form
  const [txData, setTxData] = useState({ desc: '', type: 'income', amount: '', category: '', date: '' });

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoiceData),
      });
      mutateInvoices();
      setIsInvoiceModalOpen(false);
      setInvoiceData({ client: '', amount: '', status: 'pending', dueDate: '' });
    } catch (err) {
      console.error('Failed to create invoice:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(txData),
      });
      mutateTransactions();
      setIsTxModalOpen(false);
      setTxData({ desc: '', type: 'income', amount: '', category: '', date: '' });
    } catch (err) {
      console.error('Failed to create transaction:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteInvoice = async (id: string) => {
    try {
      await fetch(`/api/invoices?id=${id}`, { method: 'DELETE' });
      mutateInvoices();
      setOpenMenuId(null);
    } catch (err) {
      console.error('Failed to delete invoice:', err);
    }
  };

  const exportToCSV = () => {
    if (!Array.isArray(invoices) || invoices.length === 0) return;
    const headers = ['Invoice ID', 'Client', 'Amount', 'Status', 'Date', 'Due Date'];
    const rows = invoices.map(inv => [
      inv.invoiceId, inv.client, inv.amount, inv.status,
      new Date(inv.date).toLocaleDateString(), new Date(inv.dueDate).toLocaleDateString()
    ]);
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `invoices_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid': return <Badge variant="success" size="sm" className="bg-[#34D399]/10 text-[#34D399] border-[#34D399]/20"><CheckCircle2 className="w-3 h-3 mr-1" /> Paid</Badge>;
      case 'pending': return <Badge variant="info" size="sm" className="bg-[#60A5FA]/10 text-[#60A5FA] border-[#60A5FA]/20"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case 'overdue': return <Badge variant="error" size="sm" className="bg-[#F87171]/10 text-[#F87171] border-[#F87171]/20"><AlertCircle className="w-3 h-3 mr-1" /> Overdue</Badge>;
      case 'draft': return <Badge variant="default" size="sm" className="bg-white/5 text-white/50 border-white/10">Draft</Badge>;
      default: return null;
    }
  };

  // KPI Calculations
  const safeTransactions = Array.isArray(transactions) ? transactions : [];
  const safeInvoices = Array.isArray(invoices) ? invoices : [];

  const totalRevenue = safeTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = safeTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const mrr = totalRevenue > 0 ? totalRevenue * 0.4 : 0; // Simulated MRR as 40% of revenue for demo
  const outstandingAmount = safeInvoices.filter(i => i.status !== 'paid').reduce((sum, i) => sum + i.amount, 0);
  const overdueCount = safeInvoices.filter(i => i.status === 'overdue').length;

  return (
    <div className="space-y-8 relative" style={{ animation: 'fade-in-up 500ms ease-out' }}>
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 flex items-center justify-center text-[#8B5CF6]">
              <DollarSign className="w-5 h-5" />
            </div>
            <h1 className="text-3xl font-black text-[var(--color-text-primary)] tracking-tight">{t('finance.title')}</h1>
          </div>
          <p className="text-[var(--color-text-muted)] max-w-xl text-sm leading-relaxed">
            {t('finance.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setIsInvoiceModalOpen(true)}>
            {t('finance.newInvoice')}
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card padding="md" className="border-white/5 bg-black/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#B6FF2E]/5 rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-[#B6FF2E]/10 transition-colors"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50">
              <Wallet className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold text-[#34D399] bg-[#34D399]/10 px-2 py-1 rounded-md">
              <ArrowUpRight className="w-3 h-3" /> Active
            </div>
          </div>
          <p className="text-xs font-bold text-white/30 uppercase tracking-wider mb-1 relative z-10">Total Revenue (YTD)</p>
          <h3 className="text-2xl font-black text-white relative z-10">{formatCurrency(totalRevenue)}</h3>
        </Card>

        <Card padding="md" className="border-white/5 bg-black/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#8B5CF6]/5 rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-[#8B5CF6]/10 transition-colors"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs font-bold text-white/30 uppercase tracking-wider mb-1 relative z-10">Monthly Recurring (MRR)</p>
          <h3 className="text-2xl font-black text-white relative z-10">{formatCurrency(mrr)}</h3>
        </Card>

        <Card padding="md" className="border-white/5 bg-black/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#F87171]/5 rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-[#F87171]/10 transition-colors"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs font-bold text-white/30 uppercase tracking-wider mb-1 relative z-10">Total Expenses</p>
          <h3 className="text-2xl font-black text-white relative z-10">{formatCurrency(totalExpenses)}</h3>
        </Card>

        <Card padding="md" className="border-white/5 bg-black/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#F59E0B]/5 rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-[#F59E0B]/10 transition-colors"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50">
              <FileText className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold text-white/40 bg-white/5 px-2 py-1 rounded-md">
              {overdueCount} Overdue
            </div>
          </div>
          <p className="text-xs font-bold text-white/30 uppercase tracking-wider mb-1 relative z-10">Outstanding Invoices</p>
          <h3 className="text-2xl font-black text-white relative z-10">
            {formatCurrency(outstandingAmount)}
          </h3>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Transactions */}
        <Card padding="lg" className="lg:col-span-1 border-white/5 bg-black/20 max-h-[500px] flex flex-col">
          <div className="flex items-center justify-between mb-6 shrink-0">
            <h3 className="text-base font-bold text-white">Recent Transactions</h3>
            <Button variant="ghost" size="sm" onClick={() => setIsTxModalOpen(true)}>Add</Button>
          </div>
          
          <div className="space-y-4 overflow-y-auto custom-scrollbar flex-1 pr-2">
            {transactionsLoading ? (
               <div className="flex justify-center p-4"><div className="w-6 h-6 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin"></div></div>
            ) : safeTransactions.length === 0 ? (
               <div className="text-center text-white/40 text-sm py-8 border-2 border-dashed border-white/5 rounded-xl">No transactions found.</div>
            ) : (
              safeTransactions.map((tx: any) => (
                <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.02] transition-colors group cursor-pointer border border-transparent hover:border-white/5">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${
                      tx.type === 'income' 
                        ? 'bg-[#34D399]/10 text-[#34D399] border-[#34D399]/20' 
                        : 'bg-white/5 text-white/40 border-white/10'
                    }`}>
                      {tx.type === 'income' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-[#B6FF2E] transition-colors">{tx.desc}</h4>
                      <p className="text-[11px] text-white/40">{new Date(tx.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${tx.type === 'income' ? 'text-[#34D399]' : 'text-white'}`}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </p>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-white/30 mt-0.5">{tx.category}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Invoices List */}
        <Card padding="none" className="lg:col-span-2 border-white/5 bg-black/20 overflow-hidden flex flex-col min-h-[400px]">
          <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white">Invoices & Billing</h3>
              <p className="text-xs text-white/40 mt-1">Manage your active and past due invoices.</p>
            </div>
            <div className="flex items-center bg-black/40 p-1 rounded-lg border border-white/10">
              <button className="px-4 py-1.5 rounded bg-white/10 text-white text-xs font-semibold">All</button>
              <button className="px-4 py-1.5 rounded text-white/40 hover:text-white/60 text-xs font-semibold transition-colors">Unpaid</button>
            </div>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/[0.06]">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-white/40">Invoice</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-white/40">Client</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-white/40">Amount</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-white/40">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-white/40">Due Date</th>
                  <th className="px-6 py-4 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {invoicesLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-white/50">
                      <div className="w-6 h-6 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                      Loading invoices...
                    </td>
                  </tr>
                ) : safeInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-white/50">
                      No invoices found. Create one to get started.
                    </td>
                  </tr>
                ) : (
                  safeInvoices.map((inv: any) => (
                    <tr key={inv.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/50">
                            <FileText className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-bold text-white">{inv.invoiceId}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={inv.client} size="sm" />
                          <span className="text-sm font-semibold text-white/70 group-hover:text-white transition-colors">{inv.client}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-white">{formatCurrency(inv.amount)}</span>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(inv.status)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-semibold ${inv.status === 'overdue' ? 'text-[#F87171]' : 'text-white/40'}`}>
                          {formatDate(inv.dueDate)}
                        </span>
                      </td>
                      <td className="px-6 py-4 relative">
                        <button 
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                          onClick={() => setOpenMenuId(openMenuId === inv.id ? null : inv.id)}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {openMenuId === inv.id && (
                          <div className="absolute right-6 top-10 w-32 bg-[#1A1A1A] border border-white/10 rounded-lg shadow-xl overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-100">
                            <button 
                              className="w-full text-left px-4 py-2 text-xs font-semibold text-[#F87171] hover:bg-white/5 flex items-center gap-2 transition-colors"
                              onClick={() => handleDeleteInvoice(inv.id)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Create Invoice Modal */}
      {isInvoiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Create Invoice</h2>
              <button onClick={() => setIsInvoiceModalOpen(false)} className="text-white/50 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateInvoice} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Client Name</label>
                <input 
                  type="text" 
                  required
                  value={invoiceData.client}
                  onChange={e => setInvoiceData({...invoiceData, client: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#8B5CF6] transition-colors"
                  placeholder="e.g. Acme Corp"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Amount (USD)</label>
                <input 
                  type="number" 
                  required
                  step="0.01"
                  value={invoiceData.amount}
                  onChange={e => setInvoiceData({...invoiceData, amount: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#8B5CF6] transition-colors"
                  placeholder="e.g. 5000"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Status</label>
                  <select 
                    value={invoiceData.status}
                    onChange={e => setInvoiceData({...invoiceData, status: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#8B5CF6] transition-colors appearance-none"
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Due Date</label>
                  <input 
                    type="date" 
                    required
                    value={invoiceData.dueDate}
                    onChange={e => setInvoiceData({...invoiceData, dueDate: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#8B5CF6] transition-colors"
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-white/10">
                <Button variant="ghost" type="button" onClick={() => setIsInvoiceModalOpen(false)}>Cancel</Button>
                <Button variant="primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Invoice'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Transaction Modal */}
      {isTxModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Log Transaction</h2>
              <button onClick={() => setIsTxModalOpen(false)} className="text-white/50 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateTransaction} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Description</label>
                <input 
                  type="text" 
                  required
                  value={txData.desc}
                  onChange={e => setTxData({...txData, desc: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#8B5CF6] transition-colors"
                  placeholder="e.g. Stripe Payout"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Type</label>
                  <select 
                    value={txData.type}
                    onChange={e => setTxData({...txData, type: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#8B5CF6] transition-colors appearance-none"
                  >
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Amount</label>
                  <input 
                    type="number" 
                    required
                    step="0.01"
                    value={txData.amount}
                    onChange={e => setTxData({...txData, amount: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#8B5CF6] transition-colors"
                    placeholder="5000"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Category</label>
                  <input 
                    type="text" 
                    required
                    value={txData.category}
                    onChange={e => setTxData({...txData, category: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#8B5CF6] transition-colors"
                    placeholder="e.g. Software"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Date</label>
                  <input 
                    type="date" 
                    required
                    value={txData.date}
                    onChange={e => setTxData({...txData, date: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#8B5CF6] transition-colors"
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-white/10">
                <Button variant="ghost" type="button" onClick={() => setIsTxModalOpen(false)}>Cancel</Button>
                <Button variant="primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Logging...' : 'Log Transaction'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
