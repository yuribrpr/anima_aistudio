
import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronsUpDown, Search, X } from 'lucide-react';

interface Option {
  value: string;
  label: string;
  image?: string;
}

interface ComboboxProps {
  options: Option[];
  value: string | null | undefined;
  onChange: (value: string | null) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  label?: string;
  disabled?: boolean;
}

export const Combobox: React.FC<ComboboxProps> = ({
  options,
  value,
  onChange,
  placeholder = "Selecione...",
  searchPlaceholder = "Buscar...",
  label,
  disabled = false
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(search.toLowerCase())
  );

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="space-y-2 w-full relative group" ref={containerRef}>
      {label && <label className="text-sm font-medium leading-none text-zinc-400 group-focus-within:text-zinc-200 transition-colors">{label}</label>}
      
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setOpen(!open)}
          disabled={disabled}
          className={`
            flex h-10 w-full items-center justify-between rounded-md border bg-black px-3 py-2 text-sm shadow-sm 
            transition-all duration-200
            ${open 
              ? 'border-zinc-500 ring-2 ring-zinc-500/20' 
              : 'border-zinc-800 hover:border-zinc-600'
            }
            ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
          `}
        >
          <span className={`block truncate ${selectedOption ? 'text-zinc-50 font-medium' : 'text-zinc-500'}`}>
            {selectedOption ? (
              <div className="flex items-center gap-2.5">
                {selectedOption.image ? (
                   <img src={selectedOption.image} alt="" className="w-5 h-5 rounded-full object-cover ring-1 ring-white/10" />
                ) : (
                   <div className="w-5 h-5 rounded-full bg-zinc-800 ring-1 ring-white/10" />
                )}
                {selectedOption.label}
              </div>
            ) : (
              placeholder
            )}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50 text-zinc-400" />
        </button>

        {open && (
          <div className="absolute z-50 mt-2 max-h-60 w-full overflow-hidden rounded-lg border border-zinc-800 bg-black/95 backdrop-blur-xl shadow-2xl ring-1 ring-black/5 animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-150">
            <div className="flex items-center border-b border-zinc-800/50 px-3 pb-2 pt-2.5 sticky top-0 bg-black/50 backdrop-blur-md z-10">
              <Search className="mr-2 h-4 w-4 shrink-0 text-zinc-500" />
              <input
                className="flex h-6 w-full rounded-md bg-transparent py-1 text-sm outline-none placeholder:text-zinc-600 text-zinc-200"
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
              />
            </div>
            
            <div className="p-1.5 overflow-y-auto max-h-[200px] scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
              <div
                 className="relative flex cursor-pointer select-none items-center rounded-md px-2 py-2 text-sm outline-none hover:bg-zinc-900/80 hover:text-red-400 text-zinc-500 transition-colors mb-1"
                 onClick={() => {
                   onChange(null);
                   setOpen(false);
                 }}
              >
                <span className="flex-1 truncate text-xs font-medium uppercase tracking-wider pl-1">Remover Seleção</span>
                {value === null && <Check className="ml-auto h-3.5 w-3.5" />}
              </div>

              {filteredOptions.length === 0 ? (
                <div className="py-8 text-center text-sm text-zinc-600">Nenhum resultado encontrado.</div>
              ) : (
                filteredOptions.map((option) => (
                  <div
                    key={option.value}
                    className={`
                      relative flex cursor-pointer select-none items-center rounded-md px-2 py-2 text-sm outline-none 
                      transition-all duration-150
                      ${value === option.value 
                        ? 'bg-zinc-800 text-white font-medium' 
                        : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                      }
                    `}
                    onClick={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {option.image ? (
                        <div className="w-6 h-6 rounded-md overflow-hidden bg-zinc-800 shrink-0 ring-1 ring-white/10">
                           <img src={option.image} alt="" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                         <div className="w-6 h-6 rounded-md bg-zinc-800 shrink-0 ring-1 ring-white/10" />
                      )}
                      <span className="truncate">{option.label}</span>
                    </div>
                    {value === option.value && (
                      <Check className="ml-auto h-4 w-4 text-white" />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
