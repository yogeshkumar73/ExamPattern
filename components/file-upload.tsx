"use client"

import type React from "react"

import { useCallback, useState, useRef, useId } from "react"
import { Upload, FileText, ImageIcon, X, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

type FileUploadProps = {
  onFileUpload: (file: File) => void
  id?: string
  title?: string
  description?: string
  autoUpload?: boolean
}

export default function FileUpload({
  onFileUpload,
  id,
  title = "Drop your paper here",
  description = "Drag and drop your file or browse files",
  autoUpload = true,
}: FileUploadProps) {
  const generatedId = useId()
  const inputId = id || `file-upload-${generatedId.replace(/:/g, "")}`
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const processFile = useCallback((file: File) => {
    setSelectedFile(file)
    if (autoUpload) {
      onFileUpload(file)
      // reset file input value so same file can be re-selected if removed
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }, [autoUpload, onFileUpload])

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
      processFile(e.dataTransfer.files[0])
    }
  }, [processFile])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0])
    }
  }

  const handleManualUpload = () => {
    if (selectedFile) {
      onFileUpload(selectedFile)
      setSelectedFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleBrowseClick = () => {
    fileInputRef.current?.click()
  }

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) return <ImageIcon className="w-10 h-10" />
    return <FileText className="w-10 h-10" />
  }

  return (
    <div className="w-full">
      <div
        className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all duration-300 ${
          dragActive 
            ? "border-primary bg-primary/10 scale-[1.01] shadow-2xl shadow-primary/20" 
            : "border-muted-foreground/20 hover:border-primary/40 hover:bg-muted/30"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          id={inputId}
          className="hidden"
          accept=".pdf,.txt,.md,.doc,.docx,.jpg,.jpeg,.png,.webp"
          onChange={handleChange}
        />

        {!selectedFile || autoUpload ? (
          <div className="flex flex-col items-center gap-4">
            <div 
              onClick={handleBrowseClick}
              className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center ring-8 ring-primary/5 cursor-pointer hover:scale-105 transition-transform"
            >
              <Upload className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="text-xl font-bold tracking-tight mb-1">{title}</p>
              <p className="text-muted-foreground text-xs max-w-[260px] mx-auto">
                {description}
              </p>
            </div>
            <Button 
              type="button" 
              onClick={handleBrowseClick}
              size="default" 
              className="rounded-full px-6 shadow-md shadow-primary/20 font-bold text-xs"
            >
              Select from Computer
            </Button>
            <div className="flex flex-wrap justify-center gap-2 mt-1">
               <Badge variant="secondary" className="bg-muted text-[10px] uppercase font-bold tracking-widest">PDF</Badge>
               <Badge variant="secondary" className="bg-muted text-[10px] uppercase font-bold tracking-widest">TXT / MD</Badge>
               <Badge variant="secondary" className="bg-muted text-[10px] uppercase font-bold tracking-widest">JPG / PNG</Badge>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in-95">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
              {getFileIcon(selectedFile)}
            </div>
            <div className="space-y-1">
              <p className="text-lg font-bold tracking-tight">{selectedFile.name}</p>
              <p className="text-muted-foreground font-mono text-xs">{(selectedFile.size / 1024).toFixed(2)} KB</p>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleManualUpload} size="default" className="rounded-full px-8 shadow-md shadow-primary/20 font-bold text-xs">
                <Upload className="w-4 h-4 mr-2" />
                Analyze File
              </Button>
              <Button 
                variant="ghost" 
                size="default" 
                onClick={() => {
                  setSelectedFile(null)
                  if (fileInputRef.current) fileInputRef.current.value = ""
                }} 
                className="rounded-full text-muted-foreground hover:text-destructive text-xs"
              >
                <X className="w-4 h-4 mr-1.5" />
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
