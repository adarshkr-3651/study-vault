import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { FilterBar } from '@/components/library/FilterBar';
import { ResourceCard } from '@/components/library/ResourceCard';
import { ResourcePreview } from '@/components/library/ResourcePreview';
import { StatsBar } from '@/components/library/StatsBar';
import { EmptyState } from '@/components/library/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { useResources, useCourses, useFavorites, Resource, ResourceType, SortOption } from '@/hooks/useResources';

export default function Library() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  
  // Filters state
  const [search, setSearch] = useState('');
  const [type, setType] = useState<ResourceType | 'all'>('all');
  const [courseId, setCourseId] = useState('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Preview state
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Queries
  const { data: resources = [], isLoading: resourcesLoading } = useResources({
    search,
    type,
    courseId,
    sortBy,
  });
  const { data: courses = [] } = useCourses();
  const { data: favorites = [] } = useFavorites();

  // Calculate stats for quick filters
  const typeStats = useMemo(() => {
    const stats: Record<ResourceType, number> = {
      pdf: 0, video: 0, image: 0, audio: 0, note: 0,
      archive: 0, software: 0, code: 0, other: 0,
    };
    
    resources.forEach(r => {
      if (stats[r.type] !== undefined) {
        stats[r.type]++;
      }
    });

    return Object.entries(stats).map(([type, count]) => ({
      type: type as ResourceType,
      count,
    }));
  }, [resources]);

  const handlePreview = (resource: Resource) => {
    setSelectedResource(resource);
    setPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setPreviewOpen(false);
    setTimeout(() => setSelectedResource(null), 200);
  };

  const clearFilters = () => {
    setSearch('');
    setType('all');
    setCourseId('all');
    setSortBy('newest');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Resource Library
          </h1>
          <p className="text-muted-foreground">
            Browse, search, and download study materials shared by the community
          </p>
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <StatsBar 
            stats={typeStats}
            selectedType={type}
            onTypeClick={setType}
          />
        </motion.div>

        {/* Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <FilterBar
            search={search}
            onSearchChange={setSearch}
            type={type}
            onTypeChange={setType}
            courseId={courseId}
            onCourseChange={setCourseId}
            sortBy={sortBy}
            onSortChange={setSortBy}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            courses={courses}
            totalResults={resources.length}
          />
        </motion.div>

        {/* Content */}
        {resourcesLoading ? (
          <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className={viewMode === 'grid' ? 'h-64' : 'h-20'} />
            ))}
          </div>
        ) : resources.length === 0 ? (
          <EmptyState 
            type={search || type !== 'all' || courseId !== 'all' ? 'no-results' : 'no-resources'}
            onClearFilters={clearFilters}
          />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}
          >
            {resources.map((resource, index) => (
              <motion.div
                key={resource.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <ResourceCard
                  resource={resource}
                  isFavorite={favorites.includes(resource.id)}
                  onPreview={handlePreview}
                  viewMode={viewMode}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>

      {/* Preview Modal */}
      <ResourcePreview
        resource={selectedResource}
        isOpen={previewOpen}
        onClose={handleClosePreview}
        isFavorite={selectedResource ? favorites.includes(selectedResource.id) : false}
      />
    </div>
  );
}
