import React, { useState } from 'react';
import { allContentPacks } from '../contentPacks';
import { executeTestSuite } from '../services/sandbox/testRunner';
import { ContentPack, TestRunResult } from '../types/game';
import { ArrowLeft, Settings, CheckCircle2, Play, AlertCircle } from 'lucide-react';

interface AdminPacksPageProps {
  onBack: () => void;
}

export const AdminPacksPage: React.FC<AdminPacksPageProps> = ({ onBack }) => {
  const [validatingPackId, setValidatingPackId] = useState<string | null>(null);
  const [validationResults, setValidationResults] = useState<Record<string, TestRunResult>>({});

  const handleValidatePack = async (pack: ContentPack) => {
    setValidatingPackId(pack.id);
    
    // Create reference files snapshot
    const refFiles = pack.files.map(f => {
      const refCode = pack.referenceSolution[f.path];
      return {
        ...f,
        currentContent: refCode ? refCode : f.initialContent
      };
    });

    const res = await executeTestSuite(pack, refFiles, { id: 'admin', name: 'Validator' });
    setValidationResults(prev => ({ ...prev, [pack.id]: res }));
    setValidatingPackId(null);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-slate-200 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </button>

      <div className="bg-dark-800 border border-slate-800 rounded-2xl p-6 flex items-center justify-between shadow-xl">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 font-mono flex items-center gap-2">
            <Settings className="w-6 h-6 text-red-500" /> Admin Content Pack Manager
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Author, validate reference solutions, and publish flawed-project content packs.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {allContentPacks.map(pack => {
          const valRes = validationResults[pack.id];
          const isValidating = validatingPackId === pack.id;
          const isPassed = valRes && valRes.passedCount === valRes.totalCount;

          return (
            <div key={pack.id} className="bg-dark-800 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-lg">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-[10px] font-mono text-slate-300">
                      {pack.language.toUpperCase()}
                    </span>
                    <span className="text-xs font-mono text-cyan-400 font-bold">{pack.difficulty}</span>
                  </div>
                  <h3 className="text-lg font-bold font-mono text-slate-100">{pack.name}</h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{pack.description}</p>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleValidatePack(pack)}
                    disabled={isValidating}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white font-mono text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-md"
                  >
                    {isValidating ? (
                      <span>Validating Ref Solution...</span>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Validate Ref Solution</span>
                      </>
                    )}
                  </button>

                  <button
                    disabled={!isPassed}
                    className={`px-4 py-2 rounded-xl font-mono text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      isPassed
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md cursor-pointer'
                        : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Published</span>
                  </button>
                </div>
              </div>

              {/* Validation Result Box */}
              {valRes && (
                <div className={`p-4 rounded-xl border font-mono text-xs ${
                  isPassed ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-300' : 'bg-red-950/40 border-red-800/50 text-red-300'
                }`}>
                  <div className="flex items-center gap-2 font-bold mb-1">
                    {isPassed ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-red-400" />}
                    <span>
                      {isPassed ? 'Reference Solution Passed 100% of Tests!' : 'Reference Solution Failed Test Suite Validation'}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 block">
                    Passed {valRes.passedCount} / {valRes.totalCount} assertions in {valRes.durationMs}ms
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
