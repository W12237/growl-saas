'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { Card, Button, Input } from '@/components/ui';
import { 
  Folder, 
  Image as ImageIcon, 
  Video, 
  FileText, 
  Archive, 
  Upload, 
  Search, 
  MoreVertical, 
  LayoutGrid, 
  List,
  FolderOpen,
  Download,
  Share2,
  Trash2,
  Clock,
  HardDrive
} from 'lucide-react';

import { useLanguage } from '@/lib/i18n';

const fetcher = (url: string) => fetch(url).then(res => res.json());

// Format bytes
function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export default function FilesPage() {
  const { t } = useLanguage();
  const [activeFolder, setActiveFolder] = useState('all');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const { data: filesData, mutate, isLoading } = useSWR(`/api/files?folder=${activeFolder}`, fetcher, { fallbackData: [] });
  
  const files = Array.isArray(filesData) ? filesData : [];

  const filteredFiles = files.filter((file: any) => 
    file.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/files?id=${id}`, { method: 'DELETE' });
      mutate();
    } catch (err) {
      console.error('Failed to delete file:', err);
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return <ImageIcon className="w-8 h-8 text-[#B6FF2E]" />;
      case 'video': return <Video className="w-8 h-8 text-[#8B5CF6]" />;
      case 'archive': return <Archive className="w-8 h-8 text-[#F59E0B]" />;
      default: return <FileText className="w-8 h-8 text-[#3B82F6]" />;
    }
  };

  const getFileIconSmall = (type: string) => {
    switch (type) {
      case 'image': return <ImageIcon className="w-4 h-4 text-[#B6FF2E]" />;
      case 'video': return <Video className="w-4 h-4 text-[#8B5CF6]" />;
      case 'archive': return <Archive className="w-4 h-4 text-[#F59E0B]" />;
      default: return <FileText className="w-4 h-4 text-[#3B82F6]" />;
    }
  };

  const FOLDERS = [
    { id: 'all', name: 'All Files', icon: FolderOpen },
    { id: 'image', name: 'Images', icon: ImageIcon },
    { id: 'video', name: 'Videos', icon: Video },
    { id: 'document', name: 'Documents', icon: FileText },
    { id: 'archive', name: 'Archives', icon: Archive },
  ];

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col" style={{ animation: 'fade-in-up 500ms ease-out' }}>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 flex items-center justify-center text-[#8B5CF6]">
              <Folder className="w-5 h-5" />
            </div>
            <h1 className="text-3xl font-black text-[var(--color-text-primary)] tracking-tight">{t('files.title')}</h1>
          </div>
          <p className="text-[var(--color-text-muted)] text-sm">{t('files.subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="primary" icon={<Upload className="w-4 h-4" />}>
            {t('files.upload')}
          </Button>
        </div>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        
        {/* Left Sidebar */}
        <Card padding="md" className="w-64 hidden lg:flex flex-col border-white/5 bg-black/20 shrink-0">
          <h3 className="text-xs font-bold text-white/30 uppercase tracking-wider mb-4">Locations</h3>
          <div className="space-y-1">
            {FOLDERS.map(folder => {
              const Icon = folder.icon;
              const isActive = activeFolder === folder.id;
              return (
                <button
                  key={folder.id}
                  onClick={() => setActiveFolder(folder.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                    isActive 
                      ? 'bg-white/10 text-white shadow-sm' 
                      : 'text-white/50 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#B6FF2E]' : 'opacity-70'}`} />
                    <span className="text-sm font-semibold">{folder.name}</span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-8 pt-6 border-t border-white/5">
            <h3 className="text-xs font-bold text-white/30 uppercase tracking-wider mb-4">Storage Usage</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/50 font-medium">45.2 GB used</span>
                <span className="text-white/30">100 GB</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#B6FF2E] w-[45%] rounded-full shadow-[0_0_10px_rgba(182,255,46,0.5)]"></div>
              </div>
              <p className="text-[10px] text-white/30 pt-1">54.8 GB available</p>
            </div>
          </div>
        </Card>

        {/* Main Content */}
        <Card padding="none" className="flex-1 flex flex-col border-white/5 bg-black/20 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#B6FF2E]/5 rounded-full blur-[100px] -mr-[250px] -mt-[250px] pointer-events-none"></div>
          
          {/* Top Bar */}
          <div className="p-4 border-b border-white/5 bg-white/[0.02] flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
            <div className="w-full max-w-sm">
              <Input
                placeholder="Search files..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                icon={<Search className="w-4 h-4" />}
                className="bg-black/40 border-white/10"
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-black/40 rounded-lg border border-white/10 p-1">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'}`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* File Grid/List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 relative z-10">
            {isLoading ? (
               <div className="h-full flex flex-col items-center justify-center text-white/30">
                 <div className="w-8 h-8 rounded-full border-2 border-[#B6FF2E] border-t-transparent animate-spin"></div>
               </div>
            ) : filteredFiles.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-white/30">
                <Search className="w-12 h-12 mb-4 opacity-20" />
                <p className="font-semibold text-white/50">No files found.</p>
                <p className="text-xs mt-1">Try adjusting your search or filters.</p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 auto-rows-max">
                {filteredFiles.map((file: any) => (
                  <div 
                    key={file.id} 
                    onClick={() => setSelectedFile(file.id === selectedFile ? null : file.id)}
                    className={`bg-white/[0.02] border hover:bg-white/[0.04] rounded-2xl p-4 transition-all cursor-pointer group flex flex-col ${
                      selectedFile === file.id 
                        ? 'border-[#B6FF2E] shadow-[0_0_20px_rgba(182,255,46,0.1)]' 
                        : 'border-white/5 hover:border-white/10'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-12 h-12 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        {getFileIcon(file.type)}
                      </div>
                      <button className="text-white/20 hover:text-white transition-colors p-1">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="mt-auto">
                      <h4 className="text-sm font-bold text-white truncate mb-1 group-hover:text-[#B6FF2E] transition-colors" title={file.name}>
                        {file.name}
                      </h4>
                      <div className="flex items-center justify-between text-[11px] font-medium text-white/40">
                        <span>{formatBytes(file.size)}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(file.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    {/* Hover Actions (Overlay) */}
                    {selectedFile === file.id && (
                      <div className="mt-4 pt-4 border-t border-white/10 flex justify-between gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
                        <Button variant="outline" size="sm" className="flex-1 px-0 h-8" icon={<Download className="w-3 h-3" />} />
                        <Button variant="outline" size="sm" className="flex-1 px-0 h-8" icon={<Share2 className="w-3 h-3" />} />
                        <Button variant="outline" size="sm" className="flex-1 px-0 h-8 hover:bg-red-500/20 hover:text-red-500 hover:border-red-500/50" icon={<Trash2 className="w-3 h-3" />} onClick={() => handleDelete(file.id)} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="w-full bg-black/20 border border-white/5 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-white/[0.02] border-b border-white/[0.06]">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-white/40">Name</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-white/40">Size</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-white/40">Owner</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-white/40">Uploaded</th>
                      <th className="px-6 py-4 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06]">
                    {filteredFiles.map((file: any) => (
                      <tr key={file.id} className="hover:bg-white/[0.02] transition-colors group cursor-pointer">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                              {getFileIconSmall(file.type)}
                            </div>
                            <span className="text-sm font-semibold text-white group-hover:text-[#B6FF2E] transition-colors">{file.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs font-medium text-white/50">{formatBytes(file.size)}</td>
                        <td className="px-6 py-4 text-xs font-medium text-white/50">{file.uploadedBy?.name || 'Unknown'}</td>
                        <td className="px-6 py-4 text-xs font-medium text-white/50">{new Date(file.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white/10 text-white/40 hover:text-white transition-colors">
                              <Download className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-red-500/20 text-[#F87171]/60 hover:text-[#F87171] transition-colors"
                              onClick={(e) => { e.stopPropagation(); handleDelete(file.id); }}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
