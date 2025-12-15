import { motion } from 'framer-motion';
import { FileText, Video, Image, Music, Code, Archive, Package, File, Sparkles } from 'lucide-react';
import { ResourceType } from '@/hooks/useResources';

interface TypeStat {
  type: ResourceType;
  count: number;
}

interface StatsBarProps {
  stats: TypeStat[];
  selectedType: ResourceType | 'all';
  onTypeClick: (type: ResourceType | 'all') => void;
}

const typeConfig: Record<ResourceType, { icon: typeof FileText; color: string; label: string }> = {
  pdf: { icon: FileText, color: '#ef4444', label: 'PDFs' },
  video: { icon: Video, color: '#8b5cf6', label: 'Videos' },
  image: { icon: Image, color: '#10b981', label: 'Images' },
  audio: { icon: Music, color: '#f59e0b', label: 'Audio' },
  note: { icon: FileText, color: '#3b82f6', label: 'Notes' },
  code: { icon: Code, color: '#06b6d4', label: 'Code' },
  archive: { icon: Archive, color: '#6366f1', label: 'Archives' },
  software: { icon: Package, color: '#ec4899', label: 'Software' },
  other: { icon: File, color: '#64748b', label: 'Other' },
};

export function StatsBar({ stats, selectedType, onTypeClick }: StatsBarProps) {
  const totalCount = stats.reduce((sum, s) => sum + s.count, 0);
  const filteredStats = stats.filter(s => s.count > 0);

  return (
    <div className="glass-card rounded-2xl p-4 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Quick Filters</h3>
        <span className="text-sm text-muted-foreground">({totalCount} total)</span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {/* All Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onTypeClick('all')}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200
            ${selectedType === 'all' 
              ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25' 
              : 'bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground'
            }
          `}
        >
          <Sparkles className="h-4 w-4" />
          <span className="text-sm font-medium">All</span>
          <span className="text-xs opacity-70">{totalCount}</span>
        </motion.button>

        {/* Type Buttons */}
        {filteredStats.map((stat) => {
          const config = typeConfig[stat.type];
          const Icon = config.icon;
          const isSelected = selectedType === stat.type;

          return (
            <motion.button
              key={stat.type}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onTypeClick(stat.type)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200
                ${isSelected 
                  ? 'shadow-lg' 
                  : 'bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground'
                }
              `}
              style={isSelected ? {
                backgroundColor: config.color,
                color: 'white',
                boxShadow: `0 10px 25px -5px ${config.color}40`,
              } : {}}
            >
              <Icon className="h-4 w-4" style={!isSelected ? { color: config.color } : {}} />
              <span className="text-sm font-medium">{config.label}</span>
              <span className="text-xs opacity-70">{stat.count}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
