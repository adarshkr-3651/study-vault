import { motion } from 'framer-motion';
import { FileSearch, FolderOpen, Search, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  type: 'no-resources' | 'no-results' | 'no-favorites';
  onClearFilters?: () => void;
}

export function EmptyState({ type, onClearFilters }: EmptyStateProps) {
  const configs = {
    'no-resources': {
      icon: FolderOpen,
      title: 'No Resources Yet',
      description: 'Resources uploaded by contributors will appear here. Check back soon!',
      action: null,
    },
    'no-results': {
      icon: Search,
      title: 'No Results Found',
      description: 'Try adjusting your search or filters to find what you\'re looking for.',
      action: (
        <Button variant="outline" onClick={onClearFilters}>
          Clear Filters
        </Button>
      ),
    },
    'no-favorites': {
      icon: BookOpen,
      title: 'No Favorites Yet',
      description: 'Click the heart icon on any resource to add it to your favorites for quick access.',
      action: null,
    },
  };

  const config = configs[type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 px-4"
    >
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
        <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20">
          <Icon className="w-10 h-10 text-primary" />
        </div>
      </div>
      
      <h3 className="text-xl font-semibold text-foreground mb-2">
        {config.title}
      </h3>
      <p className="text-muted-foreground text-center max-w-md mb-6">
        {config.description}
      </p>
      
      {config.action}
    </motion.div>
  );
}
