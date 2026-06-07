"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Github, Twitter, Linkedin, Instagram, MessageCircle, Code2, Cpu } from "lucide-react"

export function DeveloperSection() {

  const developers = [
    {
      
      name: "Devvrat Prajapatee",
      role: " Admin & Head of project",
      avatar: "https://i.ibb.co/tpxG7Pzt/Whats-App-Image-2026-06-07-at-1-29-03-PM.jpg",
      bio: "Technology leader with expertise in System Design, Full-Stack Development, AI Architecture, Product Strategy, and Team Leadership, delivering innovative solutions through strategic thinking, problem-solving, and cross-domain experience.",
      skills: ["System Design", "Full-Stack Development", "Ai Architecture", "Project Management", "Product Strategy", "Team Leadership", "Multiple Field Knowledge Holding", "Problem Solving", "Expreance in multiple field"],
      twitter: "#",
      linkedin: "#",
      github: "#"
      },
      {
      name: "Yogesh Kumar",
     role: "Lead Full-Stack Engineer",
    avatar: "https://i.ibb.co/1ffSb34W/Image-vf0km5vf0km5vf0k.png",
      bio: "Full-Stack Developer specializing in React, Node.js, MongoDB, Python, and AI technologies, with experience in NLP, LangChain, TensorFlow, and modern UI/UX design. Passionate about building scalable, intelligent, and user-focused solutions through innovation and problem-solving.",
     skills: ["React", "Node.js", "MongoDB", "AI Prompts","Python", "TensorFlow", "NLP", "LangChain", "Figma", "TailwindCSS", "Framer Motion","Problem Solving"],
     github: "https://github.com/yogeshkumar73",
     twitter: "#",
     linkedin: "www.linkedin.com/in/yogesh-kumar-824264253",
     whatsapp: "https://wa.me/message/QOZSUIA3FH4XH1"
    },
    {
     name: "Kuldeep Prajapatee",
     role: "Management  Head",
      avatar: "https://i.ibb.co/bMZRLtr2/Whats-App-Image-2025-11-03-at-12-39-19-PM-1.jpg",
      bio: "Experienced and versatile professional with strong expertise in Leadership, Strategic Planning, Management, AI Ethics, Communication, Problem Solving, and Team Coaching. Known for driving organizational growth, building high-performing teams, and delivering innovative solutions across multiple domains including technology, education, and business.",
     skills: ["Leadership", "Strategy", "Management", "AI Ethics","Communicater", "Problem Solving", "Team Coaching", "Multiple Field Knowledge Holding"],
      linkedin: "#",
      instagram: "instagram.com/kdsingh9140",
      whatsapp: "#"

    },
    {
      name: "Abhishek Prajapatee",
     role: "HelpSupport Head",
      avatar: "https://i.ibb.co/0RHdHkCq/Whats-App-Image-2026-06-07-at-5-11-25-PM.jpg",
      bio: "Customer-focused professional specializing in Technical Support, AI Troubleshooting, Problem Solving, Communication, and User Experience Enhancement. Experienced in leading teams, analyzing customer feedback, and supporting marketing and sales initiatives to improve customer satisfaction and business performance.",
     skills: ["Customer Support", "Technical Assistance", "Problem Solving", "Communication","Team Leadership", "AI Troubleshooting", "User Experience Enhancement", "Feedback Analysis","Marketing and Sales Support"],
      linkedin: "#",
      instagram: "https://www.instagram.com/abhishek_daksh9",
      whatsapp: "#"
    },
    {
      name: "Samantha Lee",
      role: "AI & ML Specialist",
      avatar: "https://i.pravatar.cc/150?u=sam",
      bio: "Focuses on fine-tuning LLaMA models for educational use cases and prompt engineering.",
      skills: ["Python", "TensorFlow", "NLP", "LangChain"],
      github: "#",
      linkedin: "#"
    },
    {
      name: "David Chen",
      role: "UI/UX Designer & Frontend",
      avatar: "https://i.pravatar.cc/150?u=david",
      bio: "Creates beautiful, glass-morphic interfaces tailored for student engagement.",
      skills: ["Figma", "TailwindCSS", "Framer Motion"],
      twitter: "#",
      linkedin: "#"
    }
  ]

  return (
    <div className="container mx-auto py-16 px-4 animate-in slide-in-from-bottom-10 duration-700">
      <div className="text-center mb-16 space-y-4">
        <h1 className="text-5xl font-black tracking-tighter flex justify-center items-center gap-4">
          <Code2 className="w-12 h-12 text-primary" /> 
          THE DEVELOPER CORE
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
          Meet the engineers building the next generation of AI-assisted education.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {developers.map((dev, i) => (
          <Card key={i} className="group overflow-hidden border-2 shadow-xl hover:shadow-primary/20 hover:border-primary/50 transition-all duration-300">
            <div className="h-32 bg-gradient-to-br from-primary/80 to-blue-600/80 relative">
              <div className="absolute -bottom-12 inset-x-0 flex justify-center">
                <div className="w-24 h-24 rounded-full border-4 border-background overflow-hidden bg-background">
                  <img src={dev.avatar} alt={dev.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
              </div>
            </div>
            <CardHeader className="text-center pt-16 pb-4">
              <CardTitle className="text-2xl font-black">{dev.name}</CardTitle>
              <CardDescription className="font-bold text-primary text-sm uppercase tracking-widest">{dev.role}</CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <p className="text-sm text-muted-foreground font-medium px-4">
                "{dev.bio}"
              </p>
              <p className="text-sm text-muted-foreground font-medium px-4">
                {dev.bio}
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {dev.skills.map(skill => (
                  <Badge key={skill} variant="secondary" className="bg-muted/50 font-bold">{skill}</Badge>
                ))}
              </div>
              <div className="pt-4 flex justify-center gap-4 border-t">
                {dev.github && <a href={dev.github} className="text-muted-foreground hover:text-primary transition-colors"><Github className="w-5 h-5" /></a>}
                {dev.twitter && <a href={dev.twitter} className="text-muted-foreground hover:text-[#1DA1F2] transition-colors"><Twitter className="w-5 h-5" /></a>}
                {dev.linkedin && <a href={dev.linkedin} className="text-muted-foreground hover:text-[#0077B5] transition-colors"><Linkedin className="w-5 h-5" /></a>}
                {dev.whatsapp && <a href={dev.whatsapp} className="text-muted-foreground hover:text-[#25D366] transition-colors"><MessageCircle className="w-5 h-5" /></a>}
                {dev.instagram && <a href={dev.instagram} className="text-muted-foreground hover:text-[#E1306C] transition-colors"><Instagram className="w-5 h-5" /></a>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="mt-20 max-w-4xl mx-auto">
        <Card className="border-2 border-dashed shadow-2xl bg-muted/10">
          <CardHeader className="flex flex-row items-center gap-4 bg-muted/30 border-b pb-6">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Cpu className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl font-black">System Architecture</CardTitle>
              <CardDescription>Aura Study AI v2.1.4-beta Stack</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-2"><div className="font-black text-xl text-primary">Next.js 14</div><div className="text-xs font-bold text-muted-foreground uppercase">Frontend & API</div></div>
            <div className="space-y-2"><div className="font-black text-xl text-primary">Mongoose</div><div className="text-xs font-bold text-muted-foreground uppercase">Database</div></div>
            <div className="space-y-2"><div className="font-black text-xl text-primary">LLaMA 3</div><div className="text-xs font-bold text-muted-foreground uppercase">AI Engine</div></div>
            <div className="space-y-2"><div className="font-black text-xl text-primary">Upstash</div><div className="text-xs font-bold text-muted-foreground uppercase">Rate Limiting</div></div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
