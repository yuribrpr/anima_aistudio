
import React from 'react';
import { Database, Terminal } from 'lucide-react';
import { Button } from './ui/Button';

interface SqlSetupProps {
  tableName: string;
  sqlCommand: string;
  onRetry: () => void;
}

export const SqlSetup: React.FC<SqlSetupProps> = ({ tableName, sqlCommand, onRetry }) => {
  return (
    <div className="flex-1 p-12 flex flex-col items-center justify-center space-y-6">
      <div className="bg-zinc-900 border border-yellow-500/30 rounded-lg p-8 max-w-2xl w-full shadow-2xl">
        <div className="flex items-center gap-3 text-yellow-500 mb-4">
          <Database className="h-8 w-8" />
          <h2 className="text-xl font-bold">Tabela '{tableName}' Necessária</h2>
        </div>
        <p className="text-zinc-400 mb-6">
          Para utilizar esta funcionalidade, precisamos criar a tabela <code>{tableName}</code> no seu Supabase.
          Execute o comando abaixo no <strong>SQL Editor</strong>:
        </p>
        
        <div className="bg-black border border-zinc-800 rounded-md p-4 relative group">
          <div className="absolute top-2 right-2 text-xs text-zinc-600 font-mono">SQL</div>
          <pre className="text-sm font-mono text-green-400 overflow-x-auto whitespace-pre-wrap">
            {sqlCommand}
          </pre>
        </div>

        <div className="mt-8 flex justify-end gap-4">
          <Button onClick={() => window.open('https://supabase.com/dashboard/project/_/sql', '_blank')} variant="outline">
            Abrir Supabase SQL Editor <Terminal className="ml-2 h-4 w-4" />
          </Button>
          <Button onClick={onRetry}>
            Já executei, tentar novamente
          </Button>
        </div>
      </div>
    </div>
  );
};
