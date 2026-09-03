import React, { useState } from 'react';
import { ContentFile, Player } from '../types/game';
import { Edit3, Lock, FileCode, Copy, Check, ShieldCheck } from 'lucide-react';

interface CodeEditorProps {
  file: ContentFile;
  onChange: (newContent: string) => void;
  activePlayers: Player[];
  readOnly?: boolean;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  file,
  onChange,
  activePlayers,
  readOnly = false
}) => {
  const [copied, setCopied] = useState(false);
  const isFileReadOnly = readOnly || file.readOnly;
  const lines = file.currentContent.split('\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(file.currentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 h-full flex flex-col bg-[#0B0D12] border-r border-[#2C3242] relative select-none font-mono">
      {/* Editor Header Tab Bar */}
      <div className="h-9 bg-[#151822] border-b border-[#2C3242] px-4 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          <FileCode className="w-4 h-4 text-[#FFC341]" />
          <span className="font-mono text-[#F3F5FA] font-medium">{file.name}</span>
          {isFileReadOnly ? (
            <span className="px-2 py-0.5 rounded-[2px] bg-[#1E2230] text-[#AAB2C8] text-[10px] flex items-center gap-1">
              <Lock className="w-3 h-3" /> READ ONLY
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-[2px] bg-[#123829] text-[#2EE6A6] text-[10px] flex items-center gap-1 border border-[#2EE6A6]/40">
              <Edit3 className="w-3 h-3" /> EDITABLE
            </span>
          )}
        </div>

        {/* Presence & Quick Actions */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handleCopy}
            title="Copy Code"
            className="p-1 rounded-[2px] hover:bg-[#1E2230] text-[#AAB2C8] hover:text-[#F3F5FA] transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#2EE6A6]" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <div className="flex items-center space-x-2">
            <span className="text-[11px] text-[#AAB2C8] font-mono hidden md:inline">ACTIVE CO-EDITORS:</span>
            <div className="flex -space-x-1.5 overflow-hidden">
              {activePlayers.slice(0, 4).map(p => (
                <div
                  key={p.id}
                  title={`${p.displayName} is viewing this file`}
                  className={`w-5 h-5 rounded-full ${p.avatarColor} text-white font-bold text-[10px] flex items-center justify-center ring-2 ring-[#0B0D12] uppercase`}
                >
                  {p.displayName.charAt(0)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Editor Main Body */}
      <div className="flex-1 relative flex overflow-hidden font-mono text-xs">
        {/* Line Numbers Gutter */}
        <div className="w-12 bg-[#151822]/80 py-3 text-right pr-3 select-none text-[#5B6478] border-r border-[#2C3242] leading-6 shrink-0 font-mono">
          {lines.map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>

        {/* Interactive Textarea Code Editor */}
        <div className="flex-1 relative h-full">
          <textarea
            value={file.currentContent}
            onChange={(e) => !isFileReadOnly && onChange(e.target.value)}
            disabled={isFileReadOnly}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            className="w-full h-full bg-transparent text-[#F3F5FA] p-3 leading-6 font-mono resize-none focus:outline-none selection:bg-[#4A3812] tab-size-2"
            style={{
              fontFamily: "'IBM Plex Mono', 'ui-monospace', monospace",
              fontSize: '13px',
              lineHeight: '24px',
              tabSize: 2
            }}
          />
        </div>
      </div>

      {/* IDE Status Bar */}
      <div className="h-6 bg-[#151822] border-t border-[#2C3242] px-3 flex items-center justify-between text-[10px] font-mono text-[#AAB2C8] select-none">
        <div className="flex items-center space-x-3">
          <span className="flex items-center gap-1 text-[#2EE6A6]">
            <ShieldCheck className="w-3 h-3" /> Sandbox Isolation: gVisor/Firecracker VM
          </span>
          <span>UTF-8</span>
          <span>Spaces: 2</span>
        </div>
        <div className="flex items-center space-x-3">
          <span>Lines: {lines.length}</span>
          <span>Chars: {file.currentContent.length}</span>
          <span className="uppercase text-[#FFC341]">{file.language}</span>
        </div>
      </div>
    </div>
  );

};
