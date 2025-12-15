import { Search, SlidersHorizontal, Grid3X3, List, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { ResourceType, SortOption, Course } from '@/hooks/useResources';
import { FileTypeIcon } from '@/components/icons/FileTypeIcon';

interface FilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  type: ResourceType | 'all';
  onTypeChange: (value: ResourceType | 'all') => void;
  courseId: string;
  onCourseChange: (value: string) => void;
  sortBy: SortOption;
  onSortChange: (value: SortOption) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  courses: Course[];
  totalResults: number;
}

const resourceTypes: { value: ResourceType | 'all'; label: string }[] = [
  { value: 'all', label: 'All Types' },
  { value: 'pdf', label: 'PDFs' },
  { value: 'video', label: 'Videos' },
  { value: 'image', label: 'Images' },
  { value: 'audio', label: 'Audio' },
  { value: 'note', label: 'Notes' },
  { value: 'archive', label: 'Archives' },
  { value: 'software', label: 'Software' },
  { value: 'code', label: 'Code' },
  { value: 'other', label: 'Other' },
];

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'name', label: 'Name (A-Z)' },
  { value: 'size', label: 'Largest First' },
];

export function FilterBar({
  search,
  onSearchChange,
  type,
  onTypeChange,
  courseId,
  onCourseChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  courses,
  totalResults,
}: FilterBarProps) {
  const hasActiveFilters = type !== 'all' || courseId !== 'all' || search !== '';

  const clearFilters = () => {
    onSearchChange('');
    onTypeChange('all');
    onCourseChange('all');
    onSortChange('newest');
  };

  return (
    <div className="space-y-4">
      {/* Main Filter Row */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search resources by name, description, or tags..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-background/50 border-border/50 focus:border-primary/50"
          />
          {search && (
            <Button
              size="icon"
              variant="ghost"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6"
              onClick={() => onSearchChange('')}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Quick Filters */}
        <div className="flex gap-2">
          {/* Type Filter */}
          <Select value={type} onValueChange={(v) => onTypeChange(v as ResourceType | 'all')}>
            <SelectTrigger className="w-[140px] bg-background/50 border-border/50">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              {resourceTypes.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  <div className="flex items-center gap-2">
                    {t.value !== 'all' && <FileTypeIcon type={t.value as ResourceType} size={14} />}
                    {t.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Course Filter */}
          <Select value={courseId} onValueChange={onCourseChange}>
            <SelectTrigger className="w-[160px] bg-background/50 border-border/50">
              <SelectValue placeholder="Course" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              {courses.map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: course.color }} 
                    />
                    {course.code || course.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select value={sortBy} onValueChange={(v) => onSortChange(v as SortOption)}>
            <SelectTrigger className="w-[150px] bg-background/50 border-border/50">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Advanced Filters */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" className="bg-background/50 border-border/50">
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <h4 className="font-medium">Advanced Filters</h4>
                <Separator />
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium mb-2 block">File Type</label>
                    <div className="flex flex-wrap gap-2">
                      {resourceTypes.slice(1).map((t) => (
                        <Badge
                          key={t.value}
                          variant={type === t.value ? "default" : "outline"}
                          className="cursor-pointer hover:bg-primary/20 transition-colors"
                          onClick={() => onTypeChange(type === t.value ? 'all' : t.value as ResourceType)}
                        >
                          <FileTypeIcon type={t.value as ResourceType} size={12} className="mr-1" />
                          {t.label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                {hasActiveFilters && (
                  <>
                    <Separator />
                    <Button variant="outline" size="sm" className="w-full" onClick={clearFilters}>
                      Clear All Filters
                    </Button>
                  </>
                )}
              </div>
            </PopoverContent>
          </Popover>

          {/* View Mode Toggle */}
          <div className="flex border rounded-lg bg-background/50 border-border/50 overflow-hidden">
            <Button
              size="icon"
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              className="rounded-none h-10"
              onClick={() => onViewModeChange('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              className="rounded-none h-10"
              onClick={() => onViewModeChange('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Results & Active Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {totalResults} resource{totalResults !== 1 ? 's' : ''} found
          </span>
          
          {hasActiveFilters && (
            <>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex gap-2">
                {type !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    <FileTypeIcon type={type as ResourceType} size={12} />
                    {resourceTypes.find(t => t.value === type)?.label}
                    <X 
                      className="h-3 w-3 ml-1 cursor-pointer hover:text-destructive" 
                      onClick={() => onTypeChange('all')} 
                    />
                  </Badge>
                )}
                {courseId !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    {courses.find(c => c.id === courseId)?.code || 'Course'}
                    <X 
                      className="h-3 w-3 ml-1 cursor-pointer hover:text-destructive" 
                      onClick={() => onCourseChange('all')} 
                    />
                  </Badge>
                )}
                {search && (
                  <Badge variant="secondary" className="gap-1">
                    "{search}"
                    <X 
                      className="h-3 w-3 ml-1 cursor-pointer hover:text-destructive" 
                      onClick={() => onSearchChange('')} 
                    />
                  </Badge>
                )}
              </div>
            </>
          )}
        </div>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
            Clear all
          </Button>
        )}
      </div>
    </div>
  );
}
