import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Download, 
  Heart, 
  Share2, 
  ExternalLink,
  Calendar,
  HardDrive,
  User,
  Tag,
  Folder,
  BookOpen,
  Eye,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { FileTypeIcon } from '@/components/icons/FileTypeIcon';
import { formatFileSize } from '@/lib/types';
import { Resource, toggleFavorite, incrementDownloadCount } from '@/hooks/useResources';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface ResourcePreviewProps {
  resource: Resource | null;
  isOpen: boolean;
  onClose: () => void;
  isFavorite: boolean;
}

export function ResourcePreview({ resource, isOpen, onClose, isFavorite }: ResourcePreviewProps) {
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const queryClient = useQueryClient();

  if (!resource) return null;

  const handleFavorite = async () => {
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

  const handleDownload = async () => {
    try {
      await incrementDownloadCount(resource.id);
      toast.success('Download started');
      queryClient.invalidateQueries({ queryKey: ['resources'] });
    } catch (error) {
      toast.error('Failed to download');
    }
  };

  const isWarningType = ['archive', 'software'].includes(resource.type);
  const courseColor = resource.course?.color || '#14b8a6';

  const renderPreview = () => {
    switch (resource.type) {
      case 'image':
        return (
          <div className="flex items-center justify-center bg-muted/20 rounded-xl p-8 min-h-[300px]">
            <div className="text-center">
              <FileTypeIcon type={resource.type} size={64} />
              <p className="mt-4 text-muted-foreground">Image preview</p>
              <p className="text-sm text-muted-foreground/60">(Full preview available after download)</p>
            </div>
          </div>
        );
      case 'video':
        return (
          <div className="flex items-center justify-center bg-muted/20 rounded-xl p-8 min-h-[300px]">
            <div className="text-center">
              <FileTypeIcon type={resource.type} size={64} />
              <p className="mt-4 text-muted-foreground">Video preview</p>
              <p className="text-sm text-muted-foreground/60">(Streaming available after setup)</p>
            </div>
          </div>
        );
      case 'pdf':
        return (
          <div className="flex items-center justify-center bg-muted/20 rounded-xl p-8 min-h-[300px]">
            <div className="text-center">
              <FileTypeIcon type={resource.type} size={64} />
              <p className="mt-4 text-muted-foreground">PDF Document</p>
              <p className="text-sm text-muted-foreground/60">Click download to view</p>
            </div>
          </div>
        );
      case 'audio':
        return (
          <div className="flex items-center justify-center bg-muted/20 rounded-xl p-8 min-h-[300px]">
            <div className="text-center">
              <FileTypeIcon type={resource.type} size={64} />
              <p className="mt-4 text-muted-foreground">Audio File</p>
              <p className="text-sm text-muted-foreground/60">Audio player coming soon</p>
            </div>
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center bg-muted/20 rounded-xl p-8 min-h-[300px]">
            <div className="text-center">
              <FileTypeIcon type={resource.type} size={64} />
              <p className="mt-4 text-muted-foreground capitalize">{resource.type} File</p>
              <p className="text-sm text-muted-foreground/60">Download to view contents</p>
            </div>
          </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 gap-0">
        {/* Header */}
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div 
                className="w-14 h-14 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${courseColor}20` }}
              >
                <FileTypeIcon type={resource.type} size={28} />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold">{resource.title}</DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  {resource.course && (
                    <Badge style={{ backgroundColor: courseColor, color: 'white' }}>
                      {resource.course.code || resource.course.name}
                    </Badge>
                  )}
                  <Badge variant="outline" className="capitalize">
                    {resource.type}
                  </Badge>
                  <Badge variant="secondary" className="capitalize">
                    {resource.visibility}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        <Separator />

        {/* Content */}
        <ScrollArea className="flex-1">
          <div className="p-6 space-y-6">
            {/* Warning for dangerous files */}
            {isWarningType && (
              <Alert variant="destructive" className="border-yellow-500/50 bg-yellow-500/10">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Security Warning</AlertTitle>
                <AlertDescription>
                  This file type ({resource.type}) may contain executable code. Only download files from trusted sources.
                </AlertDescription>
              </Alert>
            )}

            {/* Preview Area */}
            {renderPreview()}

            {/* Description */}
            {resource.description && (
              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-muted-foreground">{resource.description}</p>
              </div>
            )}

            {/* Tags */}
            {resource.tags && resource.tags.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Tags
                </h4>
                <div className="flex flex-wrap gap-2">
                  {resource.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="glass-card p-4 rounded-xl">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <HardDrive className="h-4 w-4" />
                  <span className="text-sm">Size</span>
                </div>
                <p className="font-semibold">{formatFileSize(resource.size)}</p>
              </div>
              <div className="glass-card p-4 rounded-xl">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">Uploaded</span>
                </div>
                <p className="font-semibold">{format(new Date(resource.created_at), 'MMM d, yyyy')}</p>
              </div>
              <div className="glass-card p-4 rounded-xl">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Download className="h-4 w-4" />
                  <span className="text-sm">Downloads</span>
                </div>
                <p className="font-semibold">{resource.download_count}</p>
              </div>
              <div className="glass-card p-4 rounded-xl">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Eye className="h-4 w-4" />
                  <span className="text-sm">Views</span>
                </div>
                <p className="font-semibold">{resource.view_count}</p>
              </div>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {resource.folder && (
                <div className="flex items-center gap-3 p-3 glass-card rounded-lg">
                  <Folder className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Folder</p>
                    <p className="font-medium">{resource.folder.name}</p>
                  </div>
                </div>
              )}
              {resource.semester && (
                <div className="flex items-center gap-3 p-3 glass-card rounded-lg">
                  <BookOpen className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Semester</p>
                    <p className="font-medium">{resource.semester} {resource.year}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        <Separator />

        {/* Footer Actions */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleFavorite}
              disabled={favoriteLoading}
            >
              <Heart className={`h-4 w-4 mr-2 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
              {isFavorite ? 'Favorited' : 'Add to Favorites'}
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <ExternalLink className="h-4 w-4 mr-2" />
              Open in New Tab
            </Button>
            <Button onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
