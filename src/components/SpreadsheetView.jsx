import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  ExternalLink, 
  RefreshCw, 
  Search, 
  CheckCircle2, 
  Plus, 
  ChevronDown, 
  Filter, 
  Share2, 
  Sparkles 
} from 'lucide-react';
import { exportToCsv, syncAllGrievancesToSheets } from '../lib/googleSheets';

export default function SpreadsheetView({ issues, onSyncSuccess }) {
  const [selectedCell, setSelectedCell] = useState({ row: 1, col: 'C', value: issues[0]?.title || '' });
  const [syncing, setSyncing] = useState(false);
  const [filterText, setFilterText] = useState('');

  const handleCellClick = (row, col, value) => {
    setSelectedCell({ row, col, value });
  };

  const handleBulkSync = async () => {
    setSyncing(true);
    try {
      await syncAllGrievancesToSheets(issues);
      if (onSyncSuccess) onSyncSuccess();
    } finally {
      setSyncing(false);
    }
  };

  const filtered = filterText 
    ? issues.filter(i => (i.title + i.location + i.category).toLowerCase().includes(filterText.toLowerCase()))
    : issues;

  // Fill up to at least 15 rows for authentic spreadsheet look
  const totalRows = Math.max(12, filtered.length);

  return (
    <div className="bg-[#0B0E17] border border-white/[0.1] rounded-2xl overflow-hidden shadow-2xl flex flex-col font-sans">
      
      {/* 1. Google Sheets Header & Controls */}
      <div className="bg-[#121622] px-4 py-3 border-b border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-white tracking-tight">
                Municipal Grievances Master Sync.xlsx
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                GOOGLE SHEETS LIVE
              </span>
            </div>
            {/* Fake Google Sheets Menus */}
            <div className="hidden sm:flex items-center space-x-3 text-[11px] text-slate-400 mt-0.5">
              <span className="hover:text-white cursor-pointer">File</span>
              <span className="hover:text-white cursor-pointer">Edit</span>
              <span className="hover:text-white cursor-pointer">View</span>
              <span className="hover:text-white cursor-pointer">Insert</span>
              <span className="hover:text-white cursor-pointer">Format</span>
              <span className="hover:text-white cursor-pointer">Data</span>
              <span className="hover:text-white cursor-pointer">Tools</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleBulkSync}
            disabled={syncing}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Syncing...' : 'Sync Webhook Now'}</span>
          </button>

          <button
            onClick={() => exportToCsv(issues)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#1A2030] text-slate-200 border border-white/[0.1] hover:bg-[#222A40] transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 2. Formula Bar */}
      <div className="bg-[#0E121D] px-4 py-2 border-b border-white/[0.06] flex items-center space-x-3 text-xs font-mono">
        <div className="w-10 px-2 py-0.5 rounded bg-white/[0.04] text-slate-400 text-center font-bold">
          {selectedCell.col}{selectedCell.row}
        </div>
        <span className="text-slate-500 font-bold italic">fx</span>
        <div className="flex-1 text-slate-200 bg-[#090C14] px-3 py-1 rounded border border-white/[0.06] truncate">
          {selectedCell.value || '""'}
        </div>
      </div>

      {/* 3. The Spreadsheet Grid */}
      <div className="overflow-x-auto max-h-[520px] overflow-y-auto bg-[#090C14]">
        <table className="w-full border-collapse text-left text-xs">
          
          {/* Column Letters Header (A, B, C, D...) */}
          <thead className="bg-[#121624] text-slate-400 font-mono text-[11px] sticky top-0 z-20 select-none">
            <tr>
              <th className="w-10 p-2 text-center border-r border-b border-white/[0.08] bg-[#0E121E]">#</th>
              <th className="p-2 border-r border-b border-white/[0.08] min-w-[130px]">A (Timestamp)</th>
              <th className="p-2 border-r border-b border-white/[0.08] min-w-[90px]">B (Ticket ID)</th>
              <th className="p-2 border-r border-b border-white/[0.08] min-w-[240px]">C (Grievance Headline)</th>
              <th className="p-2 border-r border-b border-white/[0.08] min-w-[140px]">D (Category)</th>
              <th className="p-2 border-r border-b border-white/[0.08] min-w-[90px]">E (Priority)</th>
              <th className="p-2 border-r border-b border-white/[0.08] min-w-[110px]">F (Status)</th>
              <th className="p-2 border-r border-b border-white/[0.08] min-w-[180px]">G (Location Landmark)</th>
              <th className="p-2 border-r border-b border-white/[0.08] min-w-[120px]">H (Reported By)</th>
              <th className="p-2 border-r border-b border-white/[0.08] min-w-[160px]">I (Email Address)</th>
              <th className="p-2 border-r border-b border-white/[0.08] min-w-[70px] text-center">J (Votes)</th>
            </tr>
          </thead>

          {/* Grid Rows */}
          <tbody className="divide-y divide-white/[0.04] text-[11px]">
            {Array.from({ length: totalRows }).map((_, idx) => {
              const issue = filtered[idx];
              const rowNum = idx + 1;
              const isSelectedRow = selectedCell.row === rowNum;

              if (!issue) {
                // Empty trailing spreadsheet row
                return (
                  <tr key={idx} className="hover:bg-white/[0.02]">
                    <td className="p-2 text-center text-slate-600 font-mono bg-[#0E121E] border-r border-white/[0.06] select-none">
                      {rowNum}
                    </td>
                    <td className="p-2 border-r border-white/[0.04]"></td>
                    <td className="p-2 border-r border-white/[0.04]"></td>
                    <td className="p-2 border-r border-white/[0.04]"></td>
                    <td className="p-2 border-r border-white/[0.04]"></td>
                    <td className="p-2 border-r border-white/[0.04]"></td>
                    <td className="p-2 border-r border-white/[0.04]"></td>
                    <td className="p-2 border-r border-white/[0.04]"></td>
                    <td className="p-2 border-r border-white/[0.04]"></td>
                    <td className="p-2 border-r border-white/[0.04]"></td>
                    <td className="p-2 border-r border-white/[0.04]"></td>
                  </tr>
                );
              }

              const ticketCode = issue.id.startsWith('g-') 
                ? `CP-${issue.id.replace('g-', '')}` 
                : `CP-${issue.id.slice(0, 5).toUpperCase()}`;

              const timestamp = issue.created_at ? new Date(issue.created_at).toLocaleString() : 'N/A';

              return (
                <tr key={issue.id} className="hover:bg-purple-500/[0.03] transition-colors">
                  
                  {/* Row Number Column */}
                  <td className="p-2 text-center font-mono text-slate-500 bg-[#0E121E] border-r border-white/[0.06] select-none font-semibold">
                    {rowNum}
                  </td>

                  {/* A: Timestamp */}
                  <td 
                    onClick={() => handleCellClick(rowNum, 'A', timestamp)}
                    className={`p-2 border-r border-white/[0.04] whitespace-nowrap text-slate-400 font-mono text-[10px] cursor-cell ${
                      selectedCell.row === rowNum && selectedCell.col === 'A' ? 'outline outline-2 outline-emerald-500 bg-emerald-500/10' : ''
                    }`}
                  >
                    {timestamp}
                  </td>

                  {/* B: Ticket ID */}
                  <td 
                    onClick={() => handleCellClick(rowNum, 'B', ticketCode)}
                    className={`p-2 border-r border-white/[0.04] whitespace-nowrap font-mono font-bold text-sky-400 cursor-cell ${
                      selectedCell.row === rowNum && selectedCell.col === 'B' ? 'outline outline-2 outline-emerald-500 bg-emerald-500/10' : ''
                    }`}
                  >
                    #{ticketCode}
                  </td>

                  {/* C: Title */}
                  <td 
                    onClick={() => handleCellClick(rowNum, 'C', issue.title)}
                    className={`p-2 border-r border-white/[0.04] text-white font-medium cursor-cell ${
                      selectedCell.row === rowNum && selectedCell.col === 'C' ? 'outline outline-2 outline-emerald-500 bg-emerald-500/10' : ''
                    }`}
                  >
                    {issue.title}
                  </td>

                  {/* D: Category */}
                  <td 
                    onClick={() => handleCellClick(rowNum, 'D', issue.category)}
                    className={`p-2 border-r border-white/[0.04] text-slate-300 cursor-cell ${
                      selectedCell.row === rowNum && selectedCell.col === 'D' ? 'outline outline-2 outline-emerald-500 bg-emerald-500/10' : ''
                    }`}
                  >
                    {issue.category}
                  </td>

                  {/* E: Priority */}
                  <td 
                    onClick={() => handleCellClick(rowNum, 'E', issue.priority)}
                    className={`p-2 border-r border-white/[0.04] whitespace-nowrap cursor-cell ${
                      selectedCell.row === rowNum && selectedCell.col === 'E' ? 'outline outline-2 outline-emerald-500 bg-emerald-500/10' : ''
                    }`}
                  >
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      issue.priority === 'Critical' ? 'bg-rose-500/20 text-rose-300' :
                      issue.priority === 'High' ? 'bg-orange-500/20 text-orange-300' :
                      'bg-slate-700 text-slate-300'
                    }`}>
                      {issue.priority}
                    </span>
                  </td>

                  {/* F: Status */}
                  <td 
                    onClick={() => handleCellClick(rowNum, 'F', issue.status)}
                    className={`p-2 border-r border-white/[0.04] whitespace-nowrap cursor-cell ${
                      selectedCell.row === rowNum && selectedCell.col === 'F' ? 'outline outline-2 outline-emerald-500 bg-emerald-500/10' : ''
                    }`}
                  >
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center space-x-1 w-max ${
                      issue.status === 'Resolved' ? 'bg-emerald-500/20 text-emerald-300' :
                      issue.status === 'In Progress' ? 'bg-sky-500/20 text-sky-300' :
                      'bg-amber-500/20 text-amber-300'
                    }`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      <span>{issue.status}</span>
                    </span>
                  </td>

                  {/* G: Location */}
                  <td 
                    onClick={() => handleCellClick(rowNum, 'G', issue.location)}
                    className={`p-2 border-r border-white/[0.04] text-slate-300 cursor-cell truncate max-w-[200px] ${
                      selectedCell.row === rowNum && selectedCell.col === 'G' ? 'outline outline-2 outline-emerald-500 bg-emerald-500/10' : ''
                    }`}
                  >
                    {issue.location}
                  </td>

                  {/* H: Reported By */}
                  <td 
                    onClick={() => handleCellClick(rowNum, 'H', issue.reported_by_name)}
                    className={`p-2 border-r border-white/[0.04] text-slate-300 cursor-cell ${
                      selectedCell.row === rowNum && selectedCell.col === 'H' ? 'outline outline-2 outline-emerald-500 bg-emerald-500/10' : ''
                    }`}
                  >
                    {issue.reported_by_name || 'Citizen'}
                  </td>

                  {/* I: Email */}
                  <td 
                    onClick={() => handleCellClick(rowNum, 'I', issue.reported_by_email)}
                    className={`p-2 border-r border-white/[0.04] text-slate-400 font-mono text-[10px] cursor-cell ${
                      selectedCell.row === rowNum && selectedCell.col === 'I' ? 'outline outline-2 outline-emerald-500 bg-emerald-500/10' : ''
                    }`}
                  >
                    {issue.reported_by_email}
                  </td>

                  {/* J: Upvotes */}
                  <td 
                    onClick={() => handleCellClick(rowNum, 'J', String(issue.upvotes || 0))}
                    className={`p-2 border-r border-white/[0.04] text-center font-mono font-bold text-white cursor-cell ${
                      selectedCell.row === rowNum && selectedCell.col === 'J' ? 'outline outline-2 outline-emerald-500 bg-emerald-500/10' : ''
                    }`}
                  >
                    {issue.upvotes || 0}
                  </td>

                </tr>
              );
            })}
          </tbody>

        </table>
      </div>

      {/* 4. Bottom Sheets Tab Bar (Authentic Google Sheets Tab) */}
      <div className="bg-[#121624] px-4 py-1.5 border-t border-white/[0.08] flex items-center justify-between text-xs">
        <div className="flex items-center space-x-1">
          <div className="flex items-center space-x-2 px-3 py-1 rounded-t bg-[#0B0E17] text-white font-semibold border-b-2 border-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Grievances Sync (Sheet1)</span>
          </div>
          <div className="p-1 rounded text-slate-500 hover:text-white cursor-pointer">
            <Plus className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="text-[11px] text-slate-400 flex items-center space-x-2">
          <span>{filtered.length} rows synchronized with Google Apps Script Webhook</span>
        </div>
      </div>

    </div>
  );
}
