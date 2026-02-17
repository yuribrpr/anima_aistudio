
import React, { useState, useEffect } from 'react';
import { Enemy } from '../types';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Combobox } from './ui/Combobox';
import { Upload, AlertCircle, Coins, Sparkles } from 'lucide-react';

interface EnemyModalProps {
  initialData?: Enemy | null;
  onSave: (data: Omit<Enemy, 'id'>) => Promise<void>;
  onClose: () => void;
}

// Configuração de dificuldades sugeridas
const DIFFICULTY_RANGES = {
  Easy: { hp: [50, 100], atk: [5, 15], exp: [10, 30], bits: [5, 15] },
  Medium: { hp: [150, 300], atk: [20, 40], exp: [40, 80], bits: [20, 50] },
  Hard: { hp: [400, 800], atk: [50, 90], exp: [100, 200], bits: [60, 120] },
  Boss: { hp: [1000, 3000], atk: [100, 250], exp: [500, 1000], bits: [300, 800] }
};

export const EnemyModal: React.FC<EnemyModalProps> = ({ initialData, onSave, onClose }) => {
  const [formData, setFormData] = useState<Partial<Enemy>>({
    species: '',
    image_data: '',
    level: 'Easy',
    attack: 10,
    defense: 5,
    max_health: 100,
    attack_speed: 1.0,
    critical_chance: 5,
    reward_exp: 10,
    reward_bits: 5
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

  const generateRandomStats = (difficulty: string) => {
    // @ts-ignore
    const range = DIFFICULTY_RANGES[difficulty] || DIFFICULTY_RANGES.Easy;
    const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

    setFormData(prev => ({
      ...prev,
      level: difficulty,
      max_health: rand(range.hp[0], range.hp[1]),
      attack: rand(range.atk[0], range.atk[1]),
      reward_exp: rand(range.exp[0], range.exp[1]),
      reward_bits: rand(range.bits[0], range.bits[1]),
      defense: Math.floor(rand(range.atk[0], range.atk[1]) * 0.5),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!formData.species) throw new Error("O nome do inimigo é obrigatório.");
      await onSave(formData as Omit<Enemy, 'id'>);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erro ao salvar.');
    } finally {
      setLoading(false);
    }
  };

  const levelOptions = Object.keys(DIFFICULTY_RANGES).map(lvl => ({
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
          <label className="text-sm font-medium text-zinc-200">Visual</label>
          <div 
            className={`relative w-full aspect-square rounded-lg border border-dashed border-red-900/50 bg-red-950/10 hover:bg-red-950/20 hover:border-red-800 transition-all cursor-pointer flex flex-col items-center justify-center overflow-hidden group ${!previewImage ? 'p-4' : ''}`}
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
                <div className="h-10 w-10 bg-red-950 rounded-full flex items-center justify-center mx-auto border border-red-900">
                  <Upload className="h-5 w-5 text-red-500" />
                </div>
                <span className="text-xs text-red-400">Clique para upload</span>
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
                label="Nome do Inimigo"
                placeholder="Ex: Dark Slime"
                value={formData.species}
                onChange={e => setFormData({...formData, species: e.target.value})}
                required
              />

              <Combobox 
                label="Dificuldade Sugerida"
                placeholder="Selecione..."
                options={levelOptions}
                value={formData.level}
                onChange={(val) => val && generateRandomStats(val)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
               <h4 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Status de Combate</h4>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Input 
                label="HP Máximo"
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
                label="Velocidade"
                type="number"
                step="0.1"
                value={formData.attack_speed}
                onChange={e => setFormData({...formData, attack_speed: Number(e.target.value)})}
              />
            </div>
          </div>

          <div className="space-y-4 bg-zinc-900/30 p-4 rounded-lg border border-zinc-800">
            <div className="flex items-center gap-2 text-yellow-500 mb-2">
                <Coins className="h-4 w-4" />
                <h4 className="text-sm font-bold uppercase tracking-wider">Recompensas</h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input 
                label="Experiência (XP)"
                type="number"
                value={formData.reward_exp}
                onChange={e => setFormData({...formData, reward_exp: Number(e.target.value)})}
                className="text-indigo-400 font-bold"
              />
              <Input 
                label="Bits (Moeda)"
                type="number"
                value={formData.reward_bits}
                onChange={e => setFormData({...formData, reward_bits: Number(e.target.value)})}
                className="text-yellow-400 font-bold"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-zinc-800 mt-2">
        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
        <Button type="submit" isLoading={loading}>Salvar Inimigo</Button>
      </div>
    </form>
  );
};
