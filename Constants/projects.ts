import { profile } from "./profile";

export interface Project {
  id: string;
  name: string;
  type: string;
  src: string;
  alt: string;
  url: string;
  description: string;
  technologies: string[];
  category: string;
  year: string;
  features: string[];
  isFavorite?: boolean;
}

export const projects: Project[] = [
  {
    id: "project-cold-email-generator",
    name: "AI Cold Email Generator",
    type: "AI Product Prototype",
    src: "/snapshot.png",
    alt: "AI Cold Email Generator preview",
    url: profile.github,
    description:
      "An AI-powered app that extracts job descriptions from URLs and generates personalized outreach emails. It combines semantic search, prompt engineering, and a Streamlit workflow focused on practical job-hunting use cases.",
    technologies: ["Llama 3.1", "LangChain", "ChromaDB", "Streamlit", "Python"],
    category: "AI / LLM",
    year: "2026",
    features: [
      "Extracts role requirements from job links",
      "Matches opportunities with portfolio context using semantic search",
      "Generates personalized cold emails automatically",
      "Interactive UI built for quick experimentation",
    ],
    isFavorite: true,
  },
  {
    id: "project-blockchain-voting",
    name: "Blockchain-Based Voting System",
    type: "Blockchain Project",
    src: "/images/macos-monterey.jpg",
    alt: "Blockchain voting system",
    url: profile.github,
    description:
      "A voting workflow built with Ethereum smart contracts for voter registration, candidate listing, and vote casting. The goal was to explore transparent and tamper-resistant voting using local blockchain tooling.",
    technologies: ["Solidity", "Ethereum", "Ganache", "MetaMask"],
    category: "Blockchain",
    year: "2025",
    features: [
      "Smart contract based vote registration and casting",
      "MetaMask authentication and transaction signing",
      "Local testing with Ganache",
      "Transparent vote tracking flow",
    ],
    isFavorite: true,
  },
  {
    id: "project-tennis-game",
    name: "2D Tennis Game",
    type: "Systems / Game Project",
    src: "/images/bg.jpg",
    alt: "2D tennis game",
    url: profile.github,
    description:
      "A lightweight C++ game focused on real-time movement, collision handling, and gameplay logic. It was built to strengthen fundamentals in OOP, game loops, and clean modular design.",
    technologies: ["C++", "Raylib", "OOP"],
    category: "Game Development",
    year: "2025",
    features: [
      "Stable game loop and rendering flow",
      "Ball movement, collision detection, and scoring",
      "Modular OOP-based code structure",
      "Interactive keyboard-controlled gameplay",
    ],
  },
  {
    id: "project-file-uploader",
    name: "Multi-Format File Upload & Preview Interface",
    type: "Frontend Internship Project",
    src: "/file.svg",
    alt: "File upload interface",
    url: profile.github,
    description:
      "Built during the IIT Delhi internship, this React interface handled multi-format file uploads with drag-and-drop interactions and type-specific previewing.",
    technologies: ["React", "JavaScript", "HTML", "CSS"],
    category: "Frontend Engineering",
    year: "2024",
    features: [
      "Drag-and-drop file uploads",
      "Type-aware previews for uploaded files",
      "Responsive rendering across screen sizes",
      "Cleaner component structure for maintainability",
    ],
  },
];
