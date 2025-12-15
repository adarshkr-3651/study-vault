import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Download, 
  Eye, 
  Heart, 
  MoreVertical, 
  Calendar,
  HardDrive,
  Share2,
  Bookmark,
  ExternalLink
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FileTypeIcon } from '@/components/icons/FileTypeIcon';
import { formatFileSize } from '@/lib/types';
import { Resource, toggleFavorite, incrementDownloadCount } from '@/hooks/useResources';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface ResourceCardProps {
  resource: Resource;
  isFavorite: boolean;
  onPreview?: (resource: Resource) => void;
  viewMode?: 'grid' | 'list';
}

export function ResourceCard({ resource, isFavorite, onPreview, viewMode = 'grid' }: ResourceCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setFavoriteLoading(true);
    try {
      await toggleFavorite(resource.id, isFavorite);
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites');
    } catch (error) {
      toast.error('Failed to update favorites');
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await incrementDownloadCount(resource.id);
      // In a real app, this would get a signed URL from storage
      toast.success('Download started');
      queryClient.invalidateQueries({ queryKey: ['resources'] });
    } catch (error) {
      toast.error('Failed to download');
    }
  };

  const handlePreview = () => {
    onPreview?.(resource);
  };

  const courseColor = resource.course?.color || '#14b8a6';

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.005 }}
        className="group"
      >
        <Card 
          className="glass-card cursor-pointer border-border/50 hover:border-primary/30 transition-all duration-300"
          onClick={handlePreview}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              {/* Icon */}
              <div 
                className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${courseColor}20` }}
              >
                <FileTypeIcon type={resource.type} size={24} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-foreground truncate">{resource.title}</h3>
                  {resource.course && (
                    <Badge 
                      variant="secondary" 
                      className="text-xs"
                      style={{ backgroundColor: `${courseColor}20`, color: courseColor }}
                    >
                      {resource.course.code || resource.course.name}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <HardDrive className="h-3 w-3" />
                    {formatFileSize(resource.size)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(resource.created_at), 'MMM d, yyyy')}
                  </span>
                  <span className="flex items-center gap-1">
                    <Download className="h-3 w-3" />
                    {resource.download_count}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={handleFavorite}
                  disabled={favoriteLoading}
                >
                  <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={handleDownload}
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={handlePreview}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group"
    >
      <Card 
        className="glass-card cursor-pointer overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-300 h-full"
        onClick={handlePreview}
      >
        {/* Preview/Icon Area */}
        <div 
          className="relative h-36 flex items-center justify-center"
          style={{ 
            background: `linear-gradient(135deg, ${courseColor}15 0%, ${courseColor}05 100%)` 
          }}
        >
          <FileTypeIcon type={resource.type} size={48} />
          
          {/* Quick Actions Overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center gap-2"
          >
            <Button
              size="icon"
              variant="secondary"
              className="h-10 w-10 rounded-full"
              onClick={handlePreview}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="h-10 w-10 rounded-full"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant={isFavorite ? "default" : "secondary"}
              className="h-10 w-10 rounded-full"
              onClick={handleFavorite}
              disabled={favoriteLoading}
            >
              <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
            </Button>
          </motion.div>

          {/* Course Badge */}
          {resource.course && (
            <Badge 
              className="absolute top-3 left-3 text-xs"
              style={{ backgroundColor: courseColor, color: 'white' }}
            >
              {resource.course.code || resource.course.name}
            </Badge>
          )}

          {/* More Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handlePreview}>
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleFavorite}>
                <Bookmark className="h-4 w-4 mr-2" />
                {isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </DropdownMenuItem>
              <DropdownMenuItem>
                <ExternalLink className="h-4 w-4 mr-2" />
                Open in new tab
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <CardContent className="p-4">
          {/* Title */}
          <h3 className="font-semibold text-foreground mb-2 line-clamp-2 leading-tight">
            {resource.title}
          </h3>

          {/* Tags */}
          {resource.tags && resource.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {resource.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs px-2 py-0">
                  {tag}
                </Badge>
              ))}
              {resource.tags.length > 3 && (
                <Badge variant="outline" className="text-xs px-2 py-0">
                  +{resource.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Meta */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <HardDrive className="h-3 w-3" />
              {formatFileSize(resource.size)}
            </span>
            <span className="flex items-center gap-1">
              <Download className="h-3 w-3" />
              {resource.download_count}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {format(new Date(resource.created_at), 'MMM d')}
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
