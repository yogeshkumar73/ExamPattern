"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Github, 
  Twitter, 
  Linkedin, 
  Instagram, 
  MessageCircle, 
  Code2, 
  Cpu, 
  ChevronDown, 
  ChevronUp, 
  ChevronsUpDown, 
  Sparkles, 
  ShieldCheck, 
  Award,
  Zap,
  HardHat,
  Building2,
  GraduationCap,
  MapPin,
  Phone,
  Mail,
  CheckCircle2,
  Wind
} from "lucide-react"

export interface DeveloperProfile {
  id: string
  name: string
  role: string
  tagline: string
  category: "software" | "civil" | "leadership"
  avatar: string
  bio: string
  skills: string[]
  badgeColor: string
  github?: string
  linkedin?: string
  twitter?: string
  instagram?: string
  whatsapp?: string
  phone?: string
  email?: string
  location?: string
  experience?: string
  projects?: Array<{
    company: string
    designation: string
    client: string
    foundation: string
    project: string
    location: string
  }>
  education?: Array<{
    qualification: string
    board: string
    year: string
    percentage: string
  }>
  testingScope?: string[]
}

export function DeveloperSection() {
  const [openCards, setOpenCards] = useState<Record<string, boolean>>({})
  const [allExpanded, setAllExpanded] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState<"all" | "software" | "civil">("all")

  const toggleCard = (id: string) => {
    setOpenCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  const toggleAll = () => {
    const nextState = !allExpanded
    setAllExpanded(nextState)
    const newOpenState: Record<string, boolean> = {}
    developers.forEach((dev) => {
      newOpenState[dev.id] = nextState
    })
    setOpenCards(newOpenState)
  }

  const developers: DeveloperProfile[] = [
    {
      id: "devvrat",
      name: "Devvrat Prajapatee",
      role: "Admin & Head of Project",
      tagline: "Architecting Next-Gen Educational Systems & AI Solutions",
      category: "leadership",
      avatar: "https://i.ibb.co/tpxG7Pzt/Whats-App-Image-2026-06-07-at-1-29-03-PM.jpg",
      bio: "Technology leader with expertise in System Design, Full-Stack Development, AI Architecture, Product Strategy, and Team Leadership, delivering innovative solutions through strategic thinking, problem-solving, and cross-domain experience.",
      skills: ["System Design", "Full-Stack Development", "AI Architecture", "Project Management", "Product Strategy", "Team Leadership", "Cross-Domain Engineering", "Algorithmic Problem Solving"],
      twitter: "#",
      linkedin: "#",
      github: "#",
      badgeColor: "from-blue-600 to-indigo-600"
    },
    {
      id: "yogesh",
      name: "Yogesh Kumar",
      role: "Lead Full-Stack Engineer",
      tagline: "Full-Stack Specialist • AI Prompt Engineering & Scalable Systems",
      category: "software",
      avatar: "https://i.ibb.co/1ffSb34W/Image-vf0km5vf0km5vf0k.png",
      bio: "Full-Stack Developer specializing in React, Node.js, MongoDB, Python, and AI technologies, with experience in NLP, LangChain, TensorFlow, and modern UI/UX design. Passionate about building scalable, intelligent, and user-focused solutions through innovation and problem-solving.",
      skills: ["React", "Node.js", "MongoDB", "AI Prompts", "Python", "TensorFlow", "NLP", "LangChain", "Figma", "TailwindCSS", "Framer Motion", "Problem Solving"],
      github: "https://github.com/yogeshkumar73",
      twitter: "#",
      linkedin: "https://www.linkedin.com/in/yogesh-kumar-824264253",
      badgeColor: "from-emerald-600 to-teal-600"
    },
    {
      id: "devendra",
      name: "Devendra Kumar",
      role: "Civil Site Engineer",
      tagline: "Wind Project Foundation & RCC Structures Site Specialist",
      category: "civil",
      avatar: "/images/devendra-kumar.jpg",
      bio: "Civil site engineer with 2+ years of on-site execution experience specializing in wind turbine foundations, pile foundations, RCC structures, QA/QC testing, and contractor supervision across major renewable energy projects.",
      skills: [
        "Auto Leveling & Leveling",
        "RCC & Structural Work",
        "Site Execution & Supervision",
        "QA/QC & Safety Management",
        "Pile Foundation Execution",
        "Contractor Coordination"
      ],
      phone: "6393231233",
      email: "kapildevendra578@gmail.com",
      location: "Hamirpur, UP, India",
      experience: "2+ Years in Execution, Supervision, Wind Projects & Pile Foundation",
      whatsapp: "916393231233",
      badgeColor: "from-amber-600 via-orange-600 to-yellow-600",
      projects: [
        {
          company: "Pratik Construction & Prakash Developers",
          designation: "Site Engineer",
          client: "KP ENERGY / JSW ENERGY",
          foundation: "Wind & Pile Foundations (SENVION / SANY / SUZLON)",
          project: "370MW & 556MW Wind Projects",
          location: "Gujarat & Maharashtra"
        }
      ],
      education: [
        { qualification: "Diploma in Civil Engineering", board: "Lucknow Board", year: "2024", percentage: "65%" }
      ],
      testingScope: [
        "Quality testing of Cube & Slump, Silt Content & Sieve Analysis",
        "Concrete Curing & Drawing Compliance (IS Code)"
      ]
    },
    {
      id: "kuldeep",
      name: "Kuldeep Prajapatee",
      role: "Management Head",
      tagline: "Strategic Leadership, AI Governance & Operational Excellence",
      category: "leadership",
      avatar: "https://i.ibb.co/bMZRLtr2/Whats-App-Image-2025-11-03-at-12-39-19-PM-1.jpg",
      bio: "Experienced and versatile professional with strong expertise in Leadership, Strategic Planning, Management, AI Ethics, Communication, Problem Solving, and Team Coaching. Known for driving organizational growth, building high-performing teams, and delivering innovative solutions across multiple domains including technology, education, and business.",
      skills: ["Leadership", "Strategic Planning", "Management", "AI Ethics", "Executive Communication", "Problem Solving", "Team Coaching", "Multi-Domain Strategy"],
      linkedin: "#",
      instagram: "https://instagram.com/kdsingh9140",
      whatsapp: "#",
      badgeColor: "from-purple-600 to-pink-600"
    },
    {
      id: "abhishek",
      name: "Abhishek Prajapatee",
      role: "Help & Support Head",
      tagline: "User Experience Champion & Technical Resolution Specialist",
      category: "leadership",
      avatar: "https://i.ibb.co/0RHdHkCq/Whats-App-Image-2026-06-07-at-5-11-25-PM.jpg",
      bio: "Customer-focused professional specializing in Technical Support, AI Troubleshooting, Problem Solving, Communication, and User Experience Enhancement. Experienced in leading teams, analyzing customer feedback, and supporting marketing and sales initiatives to improve customer satisfaction and business performance.",
      skills: ["Customer Support", "Technical Assistance", "Problem Solving", "Communication", "Team Leadership", "AI Troubleshooting", "UX Enhancement", "Feedback Analysis", "Growth Operations"],
      linkedin: "#",
      instagram: "https://www.instagram.com/abhishek_daksh9",
      whatsapp: "#",
      badgeColor: "from-amber-600 to-orange-600"
    },
    {
      id: "samantha",
      name: "Samantha Lee",
      role: "AI & ML Specialist",
      tagline: "Machine Learning Fine-Tuning & Knowledge Retrieval",
      category: "software",
      avatar: "https://i.pravatar.cc/300?u=sam",
      bio: "Focuses on fine-tuning foundational models for educational use cases, prompt engineering, semantic embeddings, and vector similarity search across diverse university syllabi.",
      skills: ["Python", "TensorFlow", "NLP", "LangChain", "Vector Embeddings", "RAG Pipeline"],
      github: "#",
      linkedin: "#",
      badgeColor: "from-indigo-600 to-cyan-600"
    },
    {
      id: "david",
      name: "David Chen",
      role: "UI/UX Designer & Frontend",
      tagline: "Design Systems & High-Fidelity Interaction Design",
      category: "software",
      avatar: "https://i.pravatar.cc/300?u=david",
      bio: "Creates beautiful, glass-morphic interfaces and responsive interaction flows tailored for maximum student engagement, accessibility, and high performance on all devices.",
      skills: ["Figma", "Design Systems", "TailwindCSS", "Framer Motion", "Accessibility", "Micro-Interactions"],
      twitter: "#",
      linkedin: "#",
      badgeColor: "from-rose-600 to-red-600"
    }
  ]

  const filteredDevelopers = developers.filter(dev => {
    if (selectedFilter === "all") return true
    if (selectedFilter === "software") return dev.category === "software" || dev.category === "leadership"
    if (selectedFilter === "civil") return dev.category === "civil"
    return true
  })

  return (
    <div className="container mx-auto py-16 px-4 animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-7xl">
      {/* Header */}
      <div className="text-center mb-10 space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black tracking-widest uppercase mb-2">
          <Sparkles className="w-3.5 h-3.5" /> Engineering & Infrastructure Leadership
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight flex justify-center items-center gap-3 bg-clip-text text-transparent bg-gradient-to-r from-foreground via-primary to-indigo-400">
          <Code2 className="w-10 h-10 sm:w-12 sm:h-12 text-primary shrink-0" /> 
          THE DEVELOPER CORE
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto font-medium">
          Meet the engineers building next-generation AI platforms, digital architectures, and civil infrastructure.
        </p>

        {/* Filter Pills & Global Fold / Unfold Control */}
        <div className="pt-4 flex flex-wrap justify-center items-center gap-3">
          <div className="inline-flex p-1 rounded-xl bg-muted/60 border border-border/60">
            <button
              onClick={() => setSelectedFilter("all")}
              className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-black transition-all ${
                selectedFilter === "all"
                  ? "bg-primary text-primary-foreground shadow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All Disciplines ({developers.length})
            </button>
            <button
              onClick={() => setSelectedFilter("software")}
              className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-black transition-all ${
                selectedFilter === "software"
                  ? "bg-primary text-primary-foreground shadow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Software & AI Systems
            </button>
            <button
              onClick={() => setSelectedFilter("civil")}
              className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
                selectedFilter === "civil"
                  ? "bg-amber-600 text-white shadow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <HardHat className="w-3.5 h-3.5" /> Civil & Infrastructure
            </button>
          </div>

          <Button
            type="button"
            onClick={toggleAll}
            variant="outline"
            className="h-9 px-4 text-xs font-black tracking-wider uppercase border-2 border-primary/30 hover:bg-primary/10 gap-2 transition-all shadow-sm rounded-xl"
          >
            <ChevronsUpDown className="w-4 h-4 text-primary" />
            {allExpanded ? "Fold All Profiles" : "Unfold All Profiles"}
          </Button>
        </div>
      </div>

      {/* Developers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredDevelopers.map((dev) => {
          const isOpen = !!openCards[dev.id]
          const isCivil = dev.category === "civil"

          return (
            <Card 
              key={dev.id} 
              className={`group overflow-hidden border-2 transition-all duration-300 shadow-xl flex flex-col justify-between ${
                isOpen 
                  ? isCivil 
                    ? "border-amber-500/60 shadow-amber-500/20 bg-card ring-1 ring-amber-500/20"
                    : "border-primary/60 shadow-primary/20 bg-card ring-1 ring-primary/20" 
                  : "border-border/80 hover:border-primary/40 hover:shadow-lg bg-card/60"
              }`}
            >
              <div>
                {/* Banner Header with Large Profile Picture */}
                <div className={`h-44 sm:h-48 relative border-b border-border/40 ${
                  isCivil 
                    ? "bg-gradient-to-br from-amber-950 via-slate-900 to-yellow-950" 
                    : "bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950"
                }`}>
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
                  
                  {isCivil && (
                    <div className="absolute top-3 left-4 z-10 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-amber-500/30 text-amber-400 text-[10px] font-black uppercase tracking-wider">
                      <HardHat className="w-3.5 h-3.5" /> Civil Infrastructure
                    </div>
                  )}

                  {/* Large Profile Picture */}
                  <div className="absolute -bottom-16 sm:-bottom-20 inset-x-0 flex justify-center">
                    <div className={`w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-full border-4 border-background shadow-2xl overflow-hidden bg-muted ring-4 transition-all duration-500 relative ${
                      isCivil 
                        ? "ring-amber-500/40 group-hover:ring-amber-500/70" 
                        : "ring-primary/30 group-hover:ring-primary/60"
                    }`}>
                      <img 
                        src={dev.avatar} 
                        alt={dev.name} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(dev.name)}&background=4f46e5&color=fff&size=256`
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Profile Header */}
                <CardHeader className="text-center pt-20 sm:pt-24 pb-3 px-6 space-y-2">
                  <div className="flex items-center justify-center gap-1.5">
                    <CardTitle className="text-2xl font-black tracking-tight">{dev.name}</CardTitle>
                    <ShieldCheck className={`w-5 h-5 shrink-0 ${isCivil ? "text-amber-500" : "text-emerald-500"}`} title="Verified Core Team" />
                  </div>
                  
                  <div>
                    <Badge className={`bg-gradient-to-r ${dev.badgeColor} text-white font-black text-xs uppercase px-3 py-1 shadow-sm border-none`}>
                      {dev.role}
                    </Badge>
                  </div>

                  <p className="text-xs text-muted-foreground font-semibold line-clamp-1 italic pt-1">
                    "{dev.tagline}"
                  </p>

                  {dev.experience && (
                    <p className="text-[11px] text-amber-400/90 font-bold flex items-center justify-center gap-1">
                      <Wind className="w-3.5 h-3.5" /> {dev.experience}
                    </p>
                  )}
                </CardHeader>

                {/* Top Skills Preview (Always visible in summary) */}
                <div className="px-6 py-2 flex flex-wrap justify-center gap-1.5">
                  {dev.skills.slice(0, 3).map(skill => (
                    <Badge key={skill} variant="secondary" className="text-[10px] font-bold bg-muted/60">
                      {skill}
                    </Badge>
                  ))}
                  {dev.skills.length > 3 && (
                    <Badge variant="outline" className="text-[10px] font-bold text-muted-foreground">
                      +{dev.skills.length - 3} more
                    </Badge>
                  )}
                </div>

                {/* Expandable / Collapsible Full Details */}
                <div 
                  className={`transition-all duration-500 ease-in-out overflow-hidden px-6 ${
                    isOpen ? "max-h-[1400px] opacity-100 pt-4 pb-2" : "max-h-0 opacity-0 py-0"
                  }`}
                >
                  <div className="space-y-5 pt-3 border-t border-border/50 text-left">
                    {/* Professional Bio */}
                    <div className="space-y-1.5">
                      <div className={`flex items-center gap-1.5 text-xs font-black uppercase tracking-wider ${
                        isCivil ? "text-amber-400" : "text-primary"
                      }`}>
                        <Award className="w-3.5 h-3.5" /> Professional Overview
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground font-medium leading-relaxed bg-muted/20 p-3 rounded-xl border border-border/40">
                        {dev.bio}
                      </p>
                    </div>

                    {/* Civil Engineering Projects (if applicable) */}
                    {dev.projects && dev.projects.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-black uppercase text-amber-400 tracking-wider">
                          <Building2 className="w-3.5 h-3.5" /> Wind & Foundation Projects
                        </div>
                        <div className="space-y-2.5">
                          {dev.projects.map((proj, pIdx) => (
                            <div key={pIdx} className="p-3 rounded-xl bg-muted/30 border border-border/50 space-y-1 text-xs">
                              <div className="flex justify-between items-start flex-wrap gap-1">
                                <span className="font-black text-foreground text-sm">{proj.company}</span>
                                <Badge variant="outline" className="text-[10px] border-amber-500/40 text-amber-400 font-bold">
                                  {proj.designation}
                                </Badge>
                              </div>
                              <div className="text-muted-foreground font-medium">
                                <span className="font-bold text-foreground">Client:</span> {proj.client} • <span className="font-bold text-foreground">Foundation:</span> {proj.foundation}
                              </div>
                              <div className="text-muted-foreground font-medium">
                                <span className="font-bold text-foreground">Project:</span> {proj.project}
                              </div>
                              <div className="flex items-center gap-1 text-[11px] text-muted-foreground pt-0.5">
                                <MapPin className="w-3 h-3 text-amber-500" /> {proj.location}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Education Credentials (if applicable) */}
                    {dev.education && dev.education.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-black uppercase text-amber-400 tracking-wider">
                          <GraduationCap className="w-3.5 h-3.5" /> Education & Board Credentials
                        </div>
                        <div className="grid grid-cols-1 gap-1.5">
                          {dev.education.map((edu, eIdx) => (
                            <div key={eIdx} className="p-2.5 rounded-lg bg-muted/20 border border-border/40 flex justify-between items-center text-xs">
                              <div>
                                <p className="font-black text-foreground">{edu.qualification}</p>
                                <p className="text-[11px] text-muted-foreground">{edu.board} • Year {edu.year}</p>
                              </div>
                              <Badge variant="secondary" className="font-black text-amber-400 bg-amber-500/10 border border-amber-500/30">
                                {edu.percentage}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* All Core Skills */}
                    <div className="space-y-1.5">
                      <div className={`flex items-center gap-1.5 text-xs font-black uppercase tracking-wider ${
                        isCivil ? "text-amber-400" : "text-primary"
                      }`}>
                        <Zap className="w-3.5 h-3.5" /> Core Competencies & Stack
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {dev.skills.map(skill => (
                          <Badge 
                            key={skill} 
                            variant="secondary" 
                            className="bg-muted/80 text-foreground font-bold text-xs py-0.5 px-2.5 hover:bg-primary/20 transition-colors"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Testing Scope for Civil Engineering */}
                    {dev.testingScope && dev.testingScope.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-black uppercase text-amber-400 tracking-wider">
                          <CheckCircle2 className="w-3.5 h-3.5" /> QA/QC & Material Testing Scope
                        </div>
                        <div className="space-y-1 bg-muted/20 p-3 rounded-xl border border-border/40">
                          {dev.testingScope.map((test, tIdx) => (
                            <div key={tIdx} className="flex items-start gap-1.5 text-xs text-muted-foreground font-medium">
                              <span className="text-amber-400 font-black">•</span>
                              <span>{test}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Social & Contact Links */}
                    <div className="space-y-1.5 pt-2 border-t border-border/40">
                      <div className="text-[11px] font-black uppercase text-muted-foreground tracking-wider">
                        Connect with {dev.name.split(" ")[0]}
                      </div>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {dev.phone && (
                          <a 
                            href={`tel:${dev.phone}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-muted hover:bg-muted/80 text-foreground transition-all border border-border"
                          >
                            <Phone className="w-3.5 h-3.5 text-amber-400" /> {dev.phone}
                          </a>
                        )}
                        {dev.email && (
                          <a 
                            href={`mailto:${dev.email}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-muted hover:bg-muted/80 text-foreground transition-all border border-border"
                          >
                            <Mail className="w-3.5 h-3.5 text-indigo-400" /> {dev.email}
                          </a>
                        )}
                        {dev.github && dev.github !== "#" && (
                          <a 
                            href={dev.github} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-muted hover:bg-muted/80 text-foreground transition-all border border-border"
                          >
                            <Github className="w-3.5 h-3.5" /> GitHub
                          </a>
                        )}
                        {dev.linkedin && dev.linkedin !== "#" && (
                          <a 
                            href={dev.linkedin.startsWith("http") ? dev.linkedin : `https://${dev.linkedin}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#0077B5]/15 hover:bg-[#0077B5]/25 text-[#0077B5] dark:text-[#38a0e8] transition-all border border-[#0077B5]/30"
                          >
                            <Linkedin className="w-3.5 h-3.5" /> LinkedIn
                          </a>
                        )}
                        {dev.instagram && dev.instagram !== "#" && (
                          <a 
                            href={dev.instagram.startsWith("http") ? dev.instagram : `https://${dev.instagram}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#E1306C]/15 hover:bg-[#E1306C]/25 text-[#E1306C] transition-all border border-[#E1306C]/30"
                          >
                            <Instagram className="w-3.5 h-3.5" /> Instagram
                          </a>
                        )}
                        {dev.whatsapp && dev.whatsapp !== "#" && (
                          <a 
                            href={dev.whatsapp.startsWith("http") ? dev.whatsapp : `https://wa.me/${dev.whatsapp}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#25D366] transition-all border border-[#25D366]/30"
                          >
                            <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                          </a>
                        )}
                        {dev.twitter && dev.twitter !== "#" && (
                          <a 
                            href={dev.twitter.startsWith("http") ? dev.twitter : `https://${dev.twitter}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#1DA1F2]/15 hover:bg-[#1DA1F2]/25 text-[#1DA1F2] transition-all border border-[#1DA1F2]/30"
                          >
                            <Twitter className="w-3.5 h-3.5" /> Twitter
                          </a>
                        )}
                      </div>
                      {dev.location && (
                        <p className="text-[11px] text-muted-foreground font-medium pt-1 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-amber-500" /> {dev.location}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Card Folding Toggle Button */}
              <div className="p-4 pt-3 border-t border-border/40 mt-3 bg-muted/10">
                <Button
                  type="button"
                  onClick={() => toggleCard(dev.id)}
                  variant="ghost"
                  className={`w-full h-10 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 ${
                    isOpen 
                      ? isCivil 
                        ? "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20" 
                        : "bg-primary/10 text-primary hover:bg-primary/20" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {isOpen ? (
                    <>
                      Fold Profile <ChevronUp className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      Unfold Full Profile <ChevronDown className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </Card>
          )
        })}
      </div>
      
      {/* Platform Infrastructure Architecture */}
      <div className="mt-20 max-w-4xl mx-auto">
        <Card className="border-2 border-indigo-500/20 shadow-2xl glass-morphism overflow-hidden">
          <CardHeader className="flex flex-row items-center gap-4 bg-muted/30 border-b pb-6">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Cpu className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl font-black">System & Engineering Architecture</CardTitle>
              <CardDescription>Aura Study AI v2.2.0 Multi-Discipline Engineering Core</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-2 p-3 rounded-xl bg-muted/20 border border-border/40">
              <div className="font-black text-xl text-primary">Next.js 16</div>
              <div className="text-xs font-bold text-muted-foreground uppercase">App Router & Turbopack</div>
            </div>
            <div className="space-y-2 p-3 rounded-xl bg-muted/20 border border-border/40">
              <div className="font-black text-xl text-primary">MongoDB Atlas</div>
              <div className="text-xs font-bold text-muted-foreground uppercase">Distributed Database</div>
            </div>
            <div className="space-y-2 p-3 rounded-xl bg-muted/20 border border-border/40">
              <div className="font-black text-xl text-amber-400">Wind & RCC</div>
              <div className="text-xs font-bold text-muted-foreground uppercase">Civil Foundation Execution</div>
            </div>
            <div className="space-y-2 p-3 rounded-xl bg-muted/20 border border-border/40">
              <div className="font-black text-xl text-primary">Google Gemini 2.5</div>
              <div className="text-xs font-bold text-muted-foreground uppercase">Neural AI Engine</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
