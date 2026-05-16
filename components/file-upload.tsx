"use client"

import type React from "react"

import { useCallback, useState } from "react"
import { Upload, FileText, ImageIcon, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

type FileUploadProps = {
  onFileUpload: (file: File) => void
}

export default function FileUpload({ onFileUpload }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      setSelectedFile(file)
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedFile(file)
    }
  }

  const handleUpload = () => {
    if (selectedFile) {
      onFileUpload(selectedFile)
    }
  }

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) return <ImageIcon className="w-10 h-10" />
    return <FileText className="w-10 h-10" />
  }

  return (
    <div className="w-full">
      <div
        className={`relative border-2 border-dashed rounded-2xl p-16 text-center transition-all duration-300 ${
          dragActive 
            ? "border-primary bg-primary/10 scale-[1.02] shadow-2xl shadow-primary/20" 
            : "border-muted-foreground/20 hover:border-primary/40 hover:bg-muted/30"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-upload"
          className="hidden"
          accept=".pdf,.txt,.jpg,.jpeg,.png"
          onChange={handleChange}
        />

        {!selectedFile ? (
          <div className="flex flex-col items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center ring-8 ring-primary/5 animate-pulse">
              <Upload className="w-10 h-10 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold tracking-tight mb-2">Drop your paper here</p>
              <p className="text-muted-foreground text-sm max-w-[200px] mx-auto">
                Drag and drop your file or <span className="text-primary font-semibold">browse files</span>
              </p>
            </div>
            <Button asChild size="lg" className="rounded-full px-8 shadow-lg shadow-primary/20">
              <label htmlFor="file-upload" className="cursor-pointer">
                Select from Computer
              </label>
            </Button>
            <div className="flex gap-4 mt-2">
               <Badge variant="secondary" className="bg-muted text-[10px] uppercase font-bold tracking-widest">PDF</Badge>
               <Badge variant="secondary" className="bg-muted text-[10px] uppercase font-bold tracking-widest">JPG</Badge>
               <Badge variant="secondary" className="bg-muted text-[10px] uppercase font-bold tracking-widest">PNG</Badge>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in-95">
            <div className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
              {getFileIcon(selectedFile)}
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold tracking-tight">{selectedFile.name}</p>
              <p className="text-muted-foreground font-mono">{(selectedFile.size / 1024).toFixed(2)} KB</p>
            </div>
            <div className="flex gap-4">
              <Button onClick={handleUpload} size="lg" className="rounded-full px-10 shadow-lg shadow-primary/20">
                <Upload className="w-4 h-4 mr-2" />
                Analyze Now
              </Button>
              <Button variant="ghost" size="lg" onClick={() => setSelectedFile(null)} className="rounded-full text-muted-foreground hover:text-destructive">
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
