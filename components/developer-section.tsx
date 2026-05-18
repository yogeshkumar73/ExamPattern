"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Github, Twitter, Linkedin, Code2, Terminal, Cpu } from "lucide-react"

export function DeveloperSection() {
  const developers = [
    {
      name: "Alex Rivera",
      role: "Lead Full-Stack Engineer",
      avatar: "https://i.pravatar.cc/150?u=alex",
      bio: "Specializes in Next.js, AI Integration, and highly scalable cloud architectures.",
      skills: ["React", "Node.js", "MongoDB", "AI Prompts"],
      github: "#",
      twitter: "#"
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
              <div className="flex flex-wrap justify-center gap-2">
                {dev.skills.map(skill => (
                  <Badge key={skill} variant="secondary" className="bg-muted/50 font-bold">{skill}</Badge>
                ))}
              </div>
              <div className="pt-4 flex justify-center gap-4 border-t">
                {dev.github && <a href={dev.github} className="text-muted-foreground hover:text-primary transition-colors"><Github className="w-5 h-5" /></a>}
                {dev.twitter && <a href={dev.twitter} className="text-muted-foreground hover:text-[#1DA1F2] transition-colors"><Twitter className="w-5 h-5" /></a>}
                {dev.linkedin && <a href={dev.linkedin} className="text-muted-foreground hover:text-[#0077B5] transition-colors"><Linkedin className="w-5 h-5" /></a>}
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
