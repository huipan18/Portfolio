import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ExternalLink, Globe, Calendar, Code, Layers, Info } from 'lucide-react';
import { projects, Project } from '@/Constants/projects';


// macOS-style spring transition
const springTransition = {
  type: "spring" as const,
  stiffness: 400,
  damping: 30,
  mass: 0.8
};

// Animation variants for the slide transitions
const slideVariants = {
  // Grid view animations
  gridInitial: { x: 0 },
  gridExitToLeft: { x: '-100%' },
  gridEnterFromLeft: { x: '-100%' },
  gridCenter: { x: 0 },
  
  // Detail view animations
  detailEnterFromRight: { x: '100%' },
  detailCenter: { x: 0 },
  detailExitToRight: { x: '100%' }
};

export default function Test() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
  };

  const handleBack = () => {
    setSelectedProject(null);
  };

  const handleVisitProject = () => {
    if (!selectedProject) return;
    window.open(selectedProject.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="relative w-full min-h-screen h-full">
      <AnimatePresence>
        {!selectedProject ? (
          // Grid View
          <motion.div
            key="grid"
            initial={slideVariants.gridEnterFromLeft}
            animate={slideVariants.gridCenter}
            exit={slideVariants.gridExitToLeft}
            transition={springTransition}
            className="absolute inset-0"
          >
            <div className="grid grid-cols-[repeat(auto-fill,minmax(450px,1fr))] gap-6 max-w-7xl mx-auto">
              {projects.map((project) => (
                <motion.div
                  key={project.id}
                  onClick={() => handleProjectClick(project)}
                  className="grid place-items-center w-full aspect-video group bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden relative cursor-pointer select-none border border-white/10 shadow-[0px_10px_40px_rgba(0,0,0,0.3)]"
                  whileHover={{ 
                    scale: 1.02,
                    y: -4,
                    boxShadow: "0px 20px 60px rgba(0,0,0,0.4)"
                  }}
                  whileTap={{ 
                    scale: 0.98,
                    transition: { duration: 0.1 }
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <img
                    src={project.src}
                    alt={project.alt}
                    className="object-cover w-full min-h-full transition-transform duration-700 group-hover:scale-110"
                    onContextMenu={(e) => e.preventDefault()}
                  />
                  <div className="absolute top-0 left-0 translate-y-full group-hover:translate-y-0 transition-all duration-500 ease-out w-full h-full bg-gradient-to-b from-transparent/20 via-black/60 to-black/90 grid place-items-center">
                    <div className="flex flex-col gap-3 text-center text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-100">
                      <h3 className="text-2xl font-bold px-10">{project.name}</h3>
                      <p className="text-sm opacity-90 px-5 font-medium text-blue-300">{project.type}</p>
                      <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-200">
                        <span className="text-xs bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                          Click to explore
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          // Detail View
          <motion.div
            key="detail"
            initial={slideVariants.detailEnterFromRight}
            animate={slideVariants.detailCenter}
            exit={slideVariants.detailExitToRight}
            transition={springTransition}
            className="absolute inset-0"
          >
            <div className="">
              {/* Header with back button */}
              <div className="sticky top-0 left-0 pb-3 z-10 flex items-center justify-between w-full">
                <motion.button
                  onClick={handleBack}
                  className="flex items-center aspect-square gap-2 px-3 py-2.5 bg-gray-300/8 backdrop-blur-xl rounded-full border border-white/15 text-white font-medium transition-all duration-200 cursor-pointer"
                  whileHover={{ 
                    scale: 1.02,
                    backgroundColor: "rgba(255,255,255,0.12)"
                  }}
                  title="Return to Projects"
                  whileTap={{ scale: 0.98 }}
                >
                  <ArrowLeft size={18} />
                </motion.button>
                <motion.button
                  onClick={handleVisitProject}
                  className="flex items-center aspect-square gap-2 px-3 py-2.5 bg-gray-300/8 backdrop-blur-xl rounded-full border border-white/15 text-white font-medium transition-all duration-200 cursor-pointer"
                  whileHover={{ 
                    scale: 1.02,
                    backgroundColor: "rgba(255,255,255,0.12)"
                  }}
                  title="Visit Project"
                  whileTap={{ scale: 0.98 }}
                >
                  <ExternalLink size={18} />
                </motion.button>
              </div>

              {/* Project image */}
              <div className="relative w-full aspect-video rounded overflow-hidden mb-4 shadow-2xl bg-black/20">
                <img
                  src={selectedProject.src}
                  alt={selectedProject.alt}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </div>

              {/* Project details */}
              <div className="flex flex-wrap gap-8 p-6">
                {/* Main content */}
                <div className="flex-1 min-w-md space-y-8">
                  <div>
                    <h1 className="text-2xl font-semibold text-white mb-1 tracking-tight">
                      {selectedProject.name}
                    </h1>
                    <p className="text-blue-300 mb-4 opacity-80 font-medium">
                      {selectedProject.type}
                    </p>
                    <p className="text-gray-300 leading-relaxed opacity-80">
                      {selectedProject.description}
                    </p>
                  </div>

                  {/* Features */}
                  <div>
                    <h3 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
                      <Layers size={24} className="text-blue-400" />
                      Key Features
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedProject.features.map((feature, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10"
                        >
                          <div className="w-2.5 h-2.5 bg-blue-400 rounded-full flex-shrink-0" />
                          <span className="text-gray-300 font-medium">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6 w-full max-w-sm">
                  {/* Project info */}
                  <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
                    <h3 className="text-lg font-semibold text-white mb-3 opacity-80"><Info /> Project Details</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white/8 rounded-lg border border-white/10 flex items-center justify-center">
                          <Calendar size={18} />
                        </div>
                        <div>
                          <p className="text-sm text-gray-400 font-medium">Year</p>
                          <p className="text-white font-semibold">{selectedProject.year}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white/8 rounded-lg border border-white/10 flex items-center justify-center">
                          <Globe size={18} />
                        </div>
                        <div>
                          <p className="text-sm text-gray-400 font-medium">Category</p>
                          <p className="text-white font-semibold">{selectedProject.category}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Technologies */}
                  <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
                    <h3 className="text-lg font-semibold text-white mb-3 opacity-80 flex items-center gap-2">
                      <Code size={20} className="text-green-400" />
                      Technologies
                    </h3>
                    <div className="flex flex-wrap gap-2.5">
                      {selectedProject.technologies.map((tech, index) => (
                        <span
                          key={index}
                          className="px-3 py-1.5 bg-white/8 rounded-lg border border-white/10 text-white text-sm font-medium"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}