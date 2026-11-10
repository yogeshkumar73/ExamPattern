"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Building2, 
  Wind, 
  HardHat, 
  ShieldCheck, 
  Phone, 
  Mail, 
  MapPin, 
  GraduationCap, 
  CheckCircle2, 
  FileCheck, 
  Calendar, 
  Compass, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink,
  Layers,
  Wrench,
  Check
} from "lucide-react"

export function CivilEngineerCard({ isInitiallyExpanded = false }: { isInitiallyExpanded?: boolean }) {
  const [isExpanded, setIsExpanded] = useState(isInitiallyExpanded)

  return (
    <Card className="border-2 border-amber-500/30 hover:border-amber-500/60 shadow-2xl glass-morphism overflow-hidden transition-all duration-300">
      {/* Top Banner with Background Glow */}
      <div className="h-44 sm:h-52 bg-gradient-to-br from-amber-950 via-slate-900 to-indigo-950 relative border-b border-amber-500/20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/20 via-transparent to-transparent" />
        
        {/* Badge in top right */}
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <Badge className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-black uppercase px-3 py-1 flex items-center gap-1.5 shadow-sm">
            <Wind className="w-3.5 h-3.5 text-amber-400" /> Wind & Pile Foundation
          </Badge>
        </div>

        {/* Large Profile Picture */}
        <div className="absolute -bottom-16 sm:-bottom-20 inset-x-0 flex justify-center">
          <div className="w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-full border-4 border-background shadow-2xl overflow-hidden bg-muted ring-4 ring-amber-500/40 hover:ring-amber-500/70 transition-all duration-500 relative">
            <img 
              src="/devendra-kumar.jpg" 
              alt="Devendra Kumar" 
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = "https://ui-avatars.com/api/?name=Devendra+Kumar&background=d97706&color=fff&size=256"
              }}
            />
          </div>
        </div>
      </div>

      {/* Main Profile Header */}
      <CardHeader className="text-center pt-20 sm:pt-24 pb-3 px-6 space-y-2">
        <div className="flex items-center justify-center gap-2">
          <CardTitle className="text-2xl sm:text-3xl font-black tracking-tight">DEVENDRA KUMAR</CardTitle>
          <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" title="Verified Civil Engineer" />
        </div>

        <div>
          <Badge className="bg-gradient-to-r from-amber-600 to-yellow-600 text-white font-black text-xs uppercase px-3.5 py-1 shadow-md border-none">
            Civil Site Engineer
          </Badge>
        </div>

        <p className="text-xs sm:text-sm text-muted-foreground font-semibold italic pt-1">
          "Site Engineer • 2+ Years Experience in Wind Energy Foundation Projects & Deep Pile Foundation"
        </p>

        {/* Quick Contact & Location Badges */}
        <div className="flex flex-wrap justify-center gap-2 pt-2 text-xs">
          <a 
            href="tel:6393231233" 
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/60 hover:bg-muted text-foreground font-bold border border-border/60 transition-all"
          >
            <Phone className="w-3 h-3 text-emerald-500" /> 6393231233
          </a>
          <a 
            href="mailto:kapildevendra578@gmail.com" 
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/60 hover:bg-muted text-foreground font-bold border border-border/60 transition-all"
          >
            <Mail className="w-3 h-3 text-indigo-400" /> kapildevendra578@gmail.com
          </a>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/60 text-muted-foreground font-bold border border-border/60">
            <MapPin className="w-3 h-3 text-rose-500" /> Hamirpur, Uttar Pradesh
          </span>
        </div>
      </CardHeader>

      {/* Highlights Bar */}
      <div className="px-6 py-2 grid grid-cols-3 gap-2 text-center border-y border-border/40 bg-muted/10 my-2">
        <div className="p-2">
          <div className="text-base sm:text-lg font-black text-amber-500">2+ Years</div>
          <div className="text-[10px] uppercase font-bold text-muted-foreground">Site Execution</div>
        </div>
        <div className="p-2 border-x border-border/40">
          <div className="text-base sm:text-lg font-black text-amber-500">926+ MW</div>
          <div className="text-[10px] uppercase font-bold text-muted-foreground">Wind Projects</div>
        </div>
        <div className="p-2">
          <div className="text-base sm:text-lg font-black text-amber-500">IS Code</div>
          <div className="text-[10px] uppercase font-bold text-muted-foreground">QA/QC Standard</div>
        </div>
      </div>

      {/* Top Skills Preview */}
      <div className="px-6 py-3 flex flex-wrap justify-center gap-1.5">
        {[
          "Wind Foundation Execution",
          "RCC Structures",
          "Deep Pile Foundation",
          "Auto Leveling",
          "QA/QC & Safety Management",
          "Concrete Cube & Slump Testing"
        ].map((skill) => (
          <Badge key={skill} variant="secondary" className="text-[11px] font-bold bg-muted/70 hover:bg-amber-500/10">
            {skill}
          </Badge>
        ))}
      </div>

      {/* Collapsible Dossier */}
      <div 
        className={`transition-all duration-500 ease-in-out overflow-hidden px-6 ${
          isExpanded ? "max-h-[2000px] opacity-100 pt-4 pb-2" : "max-h-0 opacity-0 py-0"
        }`}
      >
        <div className="space-y-6 pt-3 border-t border-border/50 text-left">
          {/* Professional Summary */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-black uppercase text-amber-500 tracking-wider">
              <HardHat className="w-4 h-4 text-amber-500" /> Professional Summary
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium leading-relaxed bg-muted/20 p-4 rounded-xl border border-border/40">
              Site engineer civil engineer with over 2 years wind foundation project in execution and supervision. Strong expertise in wind project pile foundation, RCC structures site execution, QA/QC, safety management, and contractor coordination. Proven capability to manage construction activities from foundation to finishing while ensuring compliance with approved engineering drawings.
            </p>
          </div>

          {/* Professional Work Experience */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-black uppercase text-amber-500 tracking-wider">
              <Building2 className="w-4 h-4 text-amber-500" /> Professional Work Experience
            </div>
            
            <div className="space-y-3">
              {/* Pratik Construction */}
              <div className="p-4 rounded-xl bg-card border border-amber-500/20 space-y-1.5 shadow-sm">
                <div className="flex justify-between items-start flex-wrap gap-1">
                  <div>
                    <h4 className="font-black text-sm text-foreground">PRATIK CONSTRUCTION</h4>
                    <p className="text-xs font-bold text-amber-400">Site Engineer • Client: KP ENERGY</p>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-bold border-amber-500/40 text-amber-400">
                    370 MW Wind Project
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  <strong>Foundation:</strong> SENVION (4.2) | <strong>Location:</strong> Vagara, Bharuch, Gujarat
                </p>
                <p className="text-xs text-muted-foreground">
                  Responsible for wind turbine foundation casting, reinforcement detail checking, shuttering, and site QA/QC coordination.
                </p>
              </div>

              {/* Prakash Developers */}
              <div className="p-4 rounded-xl bg-card border border-amber-500/20 space-y-1.5 shadow-sm">
                <div className="flex justify-between items-start flex-wrap gap-1">
                  <div>
                    <h4 className="font-black text-sm text-foreground">PRAKASH DEVELOPERS</h4>
                    <p className="text-xs font-bold text-amber-400">Site Engineer • Client: JSW ENERGY</p>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-bold border-amber-500/40 text-amber-400">
                    556 MW + 300 MW Dolvi
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  <strong>Foundation:</strong> SANY (4.4), ENVISION (3.3), SUZLON (2.1) | <strong>Location:</strong> Tuljapur, Lohara, Ausa, Maharashtra
                </p>
                <p className="text-xs text-muted-foreground">
                  Supervised multi-turbine wind foundation site execution, contractor teams, concrete pour schedules, and structural compliance.
                </p>
              </div>

              {/* BMS Project */}
              <div className="p-4 rounded-xl bg-card border border-amber-500/20 space-y-1.5 shadow-sm">
                <div className="flex justify-between items-start flex-wrap gap-1">
                  <div>
                    <h4 className="font-black text-sm text-foreground">BMS PROJECT</h4>
                    <p className="text-xs font-bold text-amber-400">Trainee Engineer</p>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-bold border-border text-muted-foreground">
                    Jetty Pile Foundation
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  <strong>Specialization:</strong> Jetty pile foundation, SANY (4), ENVISION (3.3), SUZLON (2.1) | <strong>Location:</strong> Okha, Gujarat
                </p>
              </div>
            </div>
          </div>

          {/* QA/QC & Technical Lab Inspection Profile */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-black uppercase text-amber-500 tracking-wider">
              <FileCheck className="w-4 h-4 text-amber-500" /> QA/QC & Lab Inspection Capabilities
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                "Concrete Cube & Slump Testing with logs",
                "Silt Content & Sieve Analysis",
                "Flakiness & Elongation Index Testing",
                "Water Absorption & Cement Fineness Tests",
                "Field Density Test (FDD) by Core Cutter",
                "Batching Plant Lab Testing & Core Cutting",
                "IS Code Curing Protocol Verification",
                "Equipment Calibration Report Verification",
                "Steel Cutting & Bending as per Drawing",
                "Shuttering & Cover Block Inspection"
              ].map((test, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-muted-foreground bg-muted/20 p-2 rounded-lg border border-border/30">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>{test}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Education & Certification Table */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-black uppercase text-amber-500 tracking-wider">
              <GraduationCap className="w-4 h-4 text-amber-500" /> Education & Certification
            </div>
            <div className="overflow-x-auto rounded-xl border border-border/50">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/40 text-muted-foreground uppercase font-black">
                  <tr>
                    <th className="py-2.5 px-3">Qualification</th>
                    <th className="py-2.5 px-3">Board / University</th>
                    <th className="py-2.5 px-3">Year</th>
                    <th className="py-2.5 px-3">Percentage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 font-semibold">
                  <tr className="bg-card">
                    <td className="py-2 px-3 font-bold text-foreground">Diploma in Civil Engineering</td>
                    <td className="py-2 px-3 text-muted-foreground">Lucknow Board</td>
                    <td className="py-2 px-3 text-muted-foreground">2024</td>
                    <td className="py-2 px-3 text-amber-400 font-bold">65%</td>
                  </tr>
                  <tr className="bg-card">
                    <td className="py-2 px-3 font-bold text-foreground">12th Standard (Intermediate)</td>
                    <td className="py-2 px-3 text-muted-foreground">UP Board</td>
                    <td className="py-2 px-3 text-muted-foreground">2021</td>
                    <td className="py-2 px-3 text-amber-400 font-bold">72%</td>
                  </tr>
                  <tr className="bg-card">
                    <td className="py-2 px-3 font-bold text-foreground">10th Standard (High School)</td>
                    <td className="py-2 px-3 text-muted-foreground">UP Board</td>
                    <td className="py-2 px-3 text-muted-foreground">2019</td>
                    <td className="py-2 px-3 text-amber-400 font-bold">73%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Areas of Interest & Communication */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="space-y-1.5">
              <div className="text-xs font-black uppercase text-muted-foreground tracking-wider flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-amber-500" /> Areas of Interest
              </div>
              <div className="flex flex-wrap gap-1.5">
                {["Wind Projects", "Building Projects", "Solar Power Projects", "Highway Projects"].map((area) => (
                  <Badge key={area} variant="secondary" className="text-xs font-bold bg-muted/80">
                    {area}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="text-xs font-black uppercase text-muted-foreground tracking-wider">
                Languages & Details
              </div>
              <div className="flex gap-2">
                <Badge variant="outline" className="text-xs font-bold border-amber-500/30 text-foreground">
                  Hindi (Native)
                </Badge>
                <Badge variant="outline" className="text-xs font-bold border-amber-500/30 text-foreground">
                  English (Professional)
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Fold / Unfold Action Button */}
      <div className="p-4 pt-3 border-t border-border/40 mt-3 bg-muted/10">
        <Button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          variant="ghost"
          className={`w-full h-10 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 ${
            isExpanded 
              ? "bg-amber-500/15 text-amber-400 hover:bg-amber-500/25" 
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          {isExpanded ? (
            <>
              Fold Engineering Dossier <ChevronUp className="w-4 h-4 text-amber-500" />
            </>
          ) : (
            <>
              Unfold Full Civil Engineering Dossier <ChevronDown className="w-4 h-4 text-amber-500" />
            </>
          )}
        </Button>
      </div>
    </Card>
  )
}
