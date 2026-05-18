"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Camera, UserCircle, Save, LogOut } from "lucide-react"

export function StudentProfile() {
  const [profile, setProfile] = useState({
    id: "",
    name: "",
    email: "",
    phone: "",
    branch: "",
    bio: "",
    photoUrl: ""
  })
  
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem("aura_session")
    if (saved) {
      const session = JSON.parse(saved)
      if (session?.user) {
        // Load additional details from another localStorage key to simulate DB
        const savedProfile = localStorage.getItem(`profile_${session.user.id}`)
        if (savedProfile) {
          setProfile({ ...session.user, ...JSON.parse(savedProfile) })
        } else {
          setProfile({
            ...profile,
            id: session.user.id || "",
            name: session.user.name || "",
            email: session.user.email || "",
            phone: session.user.phone || ""
          })
        }
      }
    }
  }, [])
  
  const handleSave = async () => {
    setIsEditing(false)
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: profile.id,
          email: profile.email,
          name: profile.name,
          phone: profile.phone,
          branch: profile.branch,
          bio: profile.bio,
          photoUrl: profile.photoUrl
        })
      })
      if (res.ok) {
        const data = await res.json()
        if (data.user) {
          // Merge back any new server-side fields (like isLabApproved or status)
          const updatedProfile = { ...profile, ...data.user }
          setProfile(updatedProfile)
          localStorage.setItem(`profile_${profile.id}`, JSON.stringify(updatedProfile))
          
          // Also sync global session in case name changed
          const savedSession = localStorage.getItem("aura_session")
          if (savedSession) {
            const session = JSON.parse(savedSession)
            session.user = { ...session.user, ...data.user }
            localStorage.setItem("aura_session", JSON.stringify(session))
          }
        }
        alert("Profile saved successfully!")
      } else {
        alert("Failed to sync profile changes with server.")
      }
    } catch (e) {
      console.warn("Could not connect to server, saving locally:", e)
      localStorage.setItem(`profile_${profile.id}`, JSON.stringify(profile))
      alert("Saved locally!")
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("aura_session")
    window.location.reload()
  }

  return (
    <div className="container mx-auto py-12 max-w-4xl animate-in zoom-in duration-500">
      <h1 className="text-4xl font-black mb-8 flex items-center gap-3">
        <UserCircle className="w-10 h-10 text-primary" /> STUDENT PROFILE
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="col-span-1 border-2 shadow-xl border-dashed h-fit">
          <CardHeader className="text-center">
            <div className="relative mx-auto w-32 h-32 rounded-full border-4 border-primary/20 bg-muted/50 flex items-center justify-center overflow-hidden mb-4 group cursor-pointer">
              {profile.photoUrl ? (
                <img src={profile.photoUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <UserCircle className="w-20 h-20 text-muted-foreground group-hover:text-primary transition-colors" />
              )}
              <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-8 h-8 text-white mb-1" />
                <span className="text-[10px] text-white font-bold uppercase tracking-widest">Update</span>
              </div>
            </div>
            <CardTitle className="text-xl font-black">{profile.name || "Student"}</CardTitle>
            <CardDescription className="font-bold text-primary">{profile.branch || "Branch not set"}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleLogout} variant="destructive" className="w-full font-bold gap-2">
              <LogOut className="w-4 h-4" /> Sign Out
            </Button>
          </CardContent>
        </Card>

        <Card className="col-span-1 md:col-span-2 border-2 shadow-2xl">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Personal Details</CardTitle>
              <Button variant={isEditing ? "default" : "outline"} onClick={() => isEditing ? handleSave() : setIsEditing(true)}>
                {isEditing ? <><Save className="w-4 h-4 mr-2" /> Save Changes</> : "Edit Profile"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="font-bold">Full Name</Label>
                <Input 
                  disabled={!isEditing} 
                  value={profile.name} 
                  onChange={e => setProfile({...profile, name: e.target.value})} 
                  className="font-medium"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold">Email Address</Label>
                <Input 
                  disabled={!isEditing} 
                  value={profile.email} 
                  onChange={e => setProfile({...profile, email: e.target.value})} 
                  className="font-medium"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold">Phone Number</Label>
                <Input 
                  disabled={!isEditing} 
                  value={profile.phone} 
                  onChange={e => setProfile({...profile, phone: e.target.value})} 
                  className="font-medium"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold">Branch / Department</Label>
                <Input 
                  disabled={!isEditing} 
                  value={profile.branch} 
                  onChange={e => setProfile({...profile, branch: e.target.value})} 
                  className="font-medium"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="font-bold">Bio</Label>
              <Textarea 
                disabled={!isEditing} 
                value={profile.bio} 
                onChange={e => setProfile({...profile, bio: e.target.value})} 
                className="resize-none font-medium"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
