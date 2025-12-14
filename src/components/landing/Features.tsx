import { motion } from "framer-motion";
import { 
  FolderTree, 
  Upload, 
  Search, 
  Shield, 
  Share2, 
  FileVideo,
  Tags,
  Zap
} from "lucide-react";

const features = [
  {
    icon: FolderTree,
    title: "Nested Folder Structure",
    description: "Organize your resources in intuitive folders and subfolders. Create courses, modules, weeks, and topics.",
  },
  {
    icon: Upload,
    title: "Upload Any File Type",
    description: "PDFs, videos, images, audio, code, notes, archives, and even software installers. We support it all.",
  },
  {
    icon: Search,
    title: "Powerful Search",
    description: "Find anything instantly. Search by filename, tags, description, course, or file type with advanced filters.",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Your files are encrypted and secured with role-based permissions. Control who sees what.",
  },
  {
    icon: Share2,
    title: "Easy Sharing",
    description: "Share resources with classmates via links or direct invites. Set expiry dates for public links.",
  },
  {
    icon: FileVideo,
    title: "Built-in Previews",
    description: "Preview PDFs, stream videos, view images, and play audio right in the browser. No downloads needed.",
  },
  {
    icon: Tags,
    title: "Tags & Metadata",
    description: "Add tags, descriptions, semester info, and more. Keep everything categorized and discoverable.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Optimized for speed with resumable uploads, CDN delivery, and efficient storage architecture.",
  },
];

export const Features = () => {
  return (
    <section className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Everything You Need for
            <br />
            <span className="gradient-text">Organized Study</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Built with students in mind. All the features you need to keep your study materials 
            organized, accessible, and shareable.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="group p-6 rounded-xl bg-card border border-border/50 card-hover"
            >
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 transition-colors group-hover:bg-primary/20">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
