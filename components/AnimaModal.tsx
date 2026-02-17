
import React, { useState, useEffect } from 'react';
import { Anima, AnimaLevel } from '../types';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Combobox } from './ui/Combobox';
import { Upload, AlertCircle, Sparkles } from 'lucide-react';

interface AnimaModalProps {
  initialData?: Anima | null;
  existingAnimas: Anima[];
  onSave: (data: Omit<Anima, 'id'>) => Promise<void>;
  onClose: () => void;
}

// Configuração das faixas de poder por nível
const LEVEL_RANGES = {
  Rookie: { hp: [80, 150], atk: [10, 30], def: [5, 20], spd: [0.8, 1.5], crit: [0, 5] },
  Champion: { hp: [200, 450], atk: [40, 90], def: [30, 70], spd: [1.2, 2.2], crit: [5, 15] },
  Ultimate: { hp: [600, 1100], atk: [100, 180], def: [80, 140], spd: [2.0, 3.5], crit: [15, 25] },
  Mega: { hp: [1500, 3000], atk: [200, 400], def: [150, 300], spd: [3.0, 5.0], crit: [25, 50] }
};

export const AnimaModal: React.FC<AnimaModalProps> = ({ initialData, existingAnimas, onSave, onClose }) => {
  const [formData, setFormData] = useState<Partial<Anima>>({
    species: '',
    image_data: '',
    level: undefined,
    attack: 10,
    defense: 10,
    max_health: 100,
    attack_speed: 1.0,
    critical_chance: 5,
    next_evolution_id: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string>('');

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setPreviewImage(initialData.image_data || '');
    }
  }, [initialData]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024 * 2) {
        setError('A imagem deve ter menos de 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setPreviewImage(base64);
        setFormData(prev => ({ ...prev, image_data: base64 }));
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateRandomStats = (level: AnimaLevel) => {
    const range = LEVEL_RANGES[level];
    const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
    const randFloat = (min: number, max: number) => Number((Math.random() * (max - min) + min).toFixed(1));

    setFormData(prev => ({
      ...prev,
      level: level,
      max_health: rand(range.hp[0], range.hp[1]),
      attack: rand(range.atk[0], range.atk[1]),
      defense: rand(range.def[0], range.def[1]),
      attack_speed: randFloat(range.spd[0], range.spd[1]),
      critical_chance: rand(range.crit[0], range.crit[1]),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!formData.species) throw new Error("O nome da espécie é obrigatório.");
      
      await onSave(formData as Omit<Anima, 'id'>);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erro ao salvar. Verifique se a coluna "level" existe na tabela.');
    } finally {
      setLoading(false);
    }
  };

  // Opções para Combobox
  const evolutionOptions = existingAnimas
    .filter(a => a.id !== initialData?.id)
    .map(a => ({ value: a.id, label: a.species, image: a.image_data }));

  const levelOptions = Object.keys(LEVEL_RANGES).map(lvl => ({
    value: lvl,
    label: lvl
  }));

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 pb-20">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-md p-3 flex items-center gap-2 text-red-400 text-sm animate-in slide-in-from-top-2">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8">
        {/* Coluna Esquerda: Imagem */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-zinc-200">Avatar</label>
          <div 
            className={`relative w-full aspect-square rounded-lg border border-dashed border-zinc-700 bg-zinc-900/50 hover:bg-zinc-900 hover:border-zinc-500 transition-all cursor-pointer flex flex-col items-center justify-center overflow-hidden group ${!previewImage ? 'p-4' : ''}`}
          >
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
            />
            {previewImage ? (
              <>
                <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <Upload className="h-6 w-6 text-white" />
                </div>
              </>
            ) : (
              <div className="text-center space-y-2">
                <div className="h-10 w-10 bg-zinc-800 rounded-full flex items-center justify-center mx-auto">
                  <Upload className="h-5 w-5 text-zinc-400" />
                </div>
                <span className="text-xs text-zinc-500">Clique para upload</span>
              </div>
            )}
          </div>
        </div>

        {/* Coluna Direita: Dados */}
        <div className="space-y-6">
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-zinc-500 uppercase tracking-wider border-b border-zinc-800 pb-2">Informações Básicas</h4>
            <div className="grid gap-4">
              <Input 
                label="Nome da Espécie"
                placeholder="Ex: Cyber-Rex"
                value={formData.species}
                onChange={e => setFormData({...formData, species: e.target.value})}
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <Combobox 
                  label="Nível de Poder"
                  placeholder="Selecione..."
                  searchPlaceholder="Buscar nível..."
                  options={levelOptions}
                  value={formData.level}
                  onChange={(val) => val && generateRandomStats(val as AnimaLevel)}
                />
                
                <Combobox 
                  label="Próxima Evolução"
                  placeholder="Selecione..."
                  searchPlaceholder="Buscar..."
                  options={evolutionOptions}
                  value={formData.next_evolution_id}
                  onChange={(val) => setFormData({...formData, next_evolution_id: val})}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
               <h4 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Atributos de Combate</h4>
               {formData.level && (
                 <span className="text-xs text-indigo-400 flex items-center gap-1">
                   <Sparkles className="h-3 w-3" />
                   Status gerados para {formData.level}
                 </span>
               )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Input 
                label="Vida Máxima (HP)"
                type="number"
                value={formData.max_health}
                onChange={e => setFormData({...formData, max_health: Number(e.target.value)})}
              />
              <Input 
                label="Ataque (ATK)"
                type="number"
                value={formData.attack}
                onChange={e => setFormData({...formData, attack: Number(e.target.value)})}
              />
              <Input 
                label="Defesa (DEF)"
                type="number"
                value={formData.defense}
                onChange={e => setFormData({...formData, defense: Number(e.target.value)})}
              />
              <Input 
                label="Velocidade (SPD)"
                type="number"
                step="0.1"
                value={formData.attack_speed}
                onChange={e => setFormData({...formData, attack_speed: Number(e.target.value)})}
              />
            </div>
            
            <div className="space-y-3 pt-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium text-zinc-200">Chance Crítica</label>
                <span className="text-sm font-mono text-indigo-400">{formData.critical_chance}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white"
                value={formData.critical_chance}
                onChange={e => setFormData({...formData, critical_chance: Number(e.target.value)})}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-zinc-800 mt-2">
        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
        <Button type="submit" isLoading={loading}>Salvar Alterações</Button>
      </div>
    </form>
  );
};
