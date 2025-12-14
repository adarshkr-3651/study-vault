import { 
  FileText, 
  Video, 
  Image, 
  Music, 
  FileEdit, 
  Archive, 
  Package, 
  Code, 
  File,
  type LucideProps 
} from "lucide-react";
import { ResourceType, getFileIconClass } from "@/lib/types";
import { cn } from "@/lib/utils";

interface FileTypeIconProps extends LucideProps {
  type: ResourceType;
  withBackground?: boolean;
}

const iconMap: Record<ResourceType, React.ComponentType<LucideProps>> = {
  pdf: FileText,
  video: Video,
  image: Image,
  audio: Music,
  note: FileEdit,
  archive: Archive,
  software: Package,
  code: Code,
  other: File,
};

export const FileTypeIcon = ({ 
  type, 
  withBackground = false, 
  className,
  ...props 
}: FileTypeIconProps) => {
  const Icon = iconMap[type];
  const colorClass = getFileIconClass(type);
  
  if (withBackground) {
    return (
      <div className={cn("file-icon p-2", colorClass)}>
        <Icon className={cn("h-5 w-5", className)} {...props} />
      </div>
    );
  }
  
  return <Icon className={cn(colorClass, className)} {...props} />;
};
