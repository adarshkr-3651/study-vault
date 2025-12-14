import { motion } from "framer-motion";
import { ArrowRight, Upload, Folder, Search, Shield, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const Hero = () => {
  const navigate = useNavigate();

  const features = [
    { icon: Upload, text: "Any file type" },
    { icon: Folder, text: "Organized folders" },
    { icon: Search, text: "Smart search" },
    { icon: Shield, text: "Secure storage" },
  ];

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">All your study resources in one place</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
              Your Digital
              <br />
              <span className="gradient-text">Study Vault</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-lg">
              Upload, organize, and access your study materials anywhere. 
              PDFs, videos, notes, code — everything in a structured folder system 
              built for students and teams.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="xl" 
                variant="gradient"
                onClick={() => navigate("/auth?mode=signup")}
                className="group"
              >
                Start Organizing
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button 
                size="xl" 
                variant="hero-outline"
                onClick={() => navigate("/auth")}
              >
                Sign In
              </Button>
            </div>

            <div className="flex flex-wrap gap-6 pt-4">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.text}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary">
                    <feature.icon className="h-4 w-4 text-primary" />
                  </div>
                  {feature.text}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right content - Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="relative">
              {/* Main preview card */}
              <div className="glass rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-destructive/60" />
                    <div className="w-3 h-3 rounded-full bg-warning/60" />
                    <div className="w-3 h-3 rounded-full bg-success/60" />
                  </div>
                  <div className="flex-1 h-6 rounded bg-secondary/50" />
                </div>

                <div className="grid grid-cols-4 gap-4">
                  {/* Sidebar preview */}
                  <div className="col-span-1 space-y-2">
                    {['HPC', 'Data Mining', 'AAIS', 'ML'].map((course, i) => (
                      <motion.div
                        key={course}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + i * 0.1 }}
                        className={`px-3 py-2 rounded-lg text-sm font-medium ${
                          i === 0 ? 'bg-primary/15 text-primary' : 'text-muted-foreground'
                        }`}
                      >
                        {course}
                      </motion.div>
                    ))}
                  </div>

                  {/* Content preview */}
                  <div className="col-span-3 grid grid-cols-2 gap-3">
                    {[
                      { type: 'pdf', name: 'Lecture Notes.pdf' },
                      { type: 'video', name: 'Tutorial.mp4' },
                      { type: 'code', name: 'Assignment.py' },
                      { type: 'image', name: 'Diagram.png' },
                    ].map((file, i) => (
                      <motion.div
                        key={file.name}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + i * 0.1 }}
                        className="p-3 rounded-lg bg-secondary/50 border border-border/50"
                      >
                        <div className={`w-8 h-8 rounded-lg mb-2 ${
                          file.type === 'pdf' ? 'bg-red-500/20' :
                          file.type === 'video' ? 'bg-purple-500/20' :
                          file.type === 'code' ? 'bg-blue-500/20' :
                          'bg-green-500/20'
                        }`} />
                        <p className="text-xs font-medium truncate">{file.name}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
                className="absolute -right-4 top-1/4 glass rounded-xl p-4 shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-success/20 flex items-center justify-center">
                    <Upload className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Upload Complete</p>
                    <p className="text-xs text-muted-foreground">3 files added</p>
                  </div>
                </div>
              </motion.div>

              {/* Stats card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="absolute -left-4 bottom-8 glass rounded-xl p-4 shadow-lg"
              >
                <p className="text-2xl font-bold gradient-text">1,234</p>
                <p className="text-xs text-muted-foreground">Resources organized</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
