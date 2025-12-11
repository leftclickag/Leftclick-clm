"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Upload, 
  X, 
  File, 
  Image, 
  FileText, 
  Film, 
  Music, 
  Archive,
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react";

// ============================================
// 📁 FILE UPLOAD COMPONENT
// ============================================

interface UploadedFile {
  id: string;
  file: File;
  preview?: string;
  progress: number;
  status: "uploading" | "complete" | "error";
  error?: string;
}

interface FileUploadProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in MB
  maxFiles?: number;
  onUpload?: (files: File[]) => Promise<void>;
  onChange?: (files: UploadedFile[]) => void;
  disabled?: boolean;
  className?: string;
}

export function FileUpload({
  accept = "image/*,application/pdf",
  multiple = true,
  maxSize = 10,
  maxFiles = 5,
  onUpload,
  onChange,
  disabled = false,
  className = "",
}: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <Image className="h-5 w-5" />;
    if (type.startsWith("video/")) return <Film className="h-5 w-5" />;
    if (type.startsWith("audio/")) return <Music className="h-5 w-5" />;
    if (type.includes("pdf")) return <FileText className="h-5 w-5" />;
    if (type.includes("zip") || type.includes("archive")) return <Archive className="h-5 w-5" />;
    return <File className="h-5 w-5" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const processFiles = useCallback(
    async (fileList: FileList | File[]) => {
      const newFiles: UploadedFile[] = [];

      for (const file of Array.from(fileList)) {
        // Check file count
        if (files.length + newFiles.length >= maxFiles) {
          alert(`Maximal ${maxFiles} Dateien erlaubt`);
          break;
        }

        // Check file size
        if (file.size > maxSize * 1024 * 1024) {
          alert(`${file.name} ist zu groß. Maximal ${maxSize}MB erlaubt.`);
          continue;
        }

        const uploadedFile: UploadedFile = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          file,
          progress: 0,
          status: "uploading",
        };

        // Create preview for images
        if (file.type.startsWith("image/")) {
          uploadedFile.preview = URL.createObjectURL(file);
        }

        newFiles.push(uploadedFile);
      }

      const updatedFiles = [...files, ...newFiles];
      setFiles(updatedFiles);
      onChange?.(updatedFiles);

      // Simulate upload progress
      for (const uploadedFile of newFiles) {
        await simulateUpload(uploadedFile.id);
      }

      // Call onUpload with actual files
      if (onUpload && newFiles.length > 0) {
        try {
          await onUpload(newFiles.map((f) => f.file));
        } catch (error) {
          // Mark files as error
          setFiles((prev) =>
            prev.map((f) =>
              newFiles.some((nf) => nf.id === f.id)
                ? { ...f, status: "error", error: "Upload fehlgeschlagen" }
                : f
            )
          );
        }
      }
    },
    [files, maxFiles, maxSize, onChange, onUpload]
  );

  const simulateUpload = async (fileId: string) => {
    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? { ...f, progress: i, status: i === 100 ? "complete" : "uploading" }
            : f
        )
      );
    }
  };

  const removeFile = (fileId: string) => {
    const file = files.find((f) => f.id === fileId);
    if (file?.preview) {
      URL.revokeObjectURL(file.preview);
    }
    const updatedFiles = files.filter((f) => f.id !== fileId);
    setFiles(updatedFiles);
    onChange?.(updatedFiles);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!disabled && e.dataTransfer.files) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  return (
    <div className={className}>
      {/* Drop Zone */}
      <motion.div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          isDragging
            ? "border-primary bg-primary/5"
            : disabled
            ? "border-muted cursor-not-allowed opacity-50"
            : "border-border hover:border-primary/50 cursor-pointer"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        animate={isDragging ? { scale: 1.02 } : { scale: 1 }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          disabled={disabled}
          className="hidden"
        />

        <motion.div
          animate={isDragging ? { y: -5 } : { y: 0 }}
          className="flex flex-col items-center"
        >
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Upload className="h-8 w-8 text-primary" />
          </div>
          <p className="text-foreground font-medium mb-1">
            {isDragging ? "Hier ablegen!" : "Dateien hochladen"}
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            Drag & Drop oder klicken zum Auswählen
          </p>
          <p className="text-xs text-muted-foreground">
            Max. {maxSize}MB pro Datei • Max. {maxFiles} Dateien
          </p>
        </motion.div>
      </motion.div>

      {/* File List */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 space-y-2"
          >
            {files.map((file) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
              >
                {/* Preview or Icon */}
                {file.preview ? (
                  <img
                    src={file.preview}
                    alt={file.file.name}
                    className="h-10 w-10 rounded object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 rounded bg-muted flex items-center justify-center text-muted-foreground">
                    {getFileIcon(file.file.type)}
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.file.size)}
                  </p>

                  {/* Progress Bar */}
                  {file.status === "uploading" && (
                    <div className="mt-1 h-1 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-primary"
                        initial={{ width: 0 }}
                        animate={{ width: `${file.progress}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Status */}
                <div className="flex-shrink-0">
                  {file.status === "uploading" && (
                    <Loader2 className="h-5 w-5 text-primary animate-spin" />
                  )}
                  {file.status === "complete" && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                  {file.status === "error" && (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>

                {/* Remove */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(file.id);
                  }}
                  className="p-1 hover:bg-muted rounded"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// 🖼️ IMAGE UPLOAD WITH CROP
// ============================================

interface ImageUploadProps {
  value?: string;
  onChange?: (url: string | null) => void;
  aspectRatio?: number;
  maxSize?: number;
  className?: string;
}

export function ImageUpload({
  value,
  onChange,
  aspectRatio = 1,
  maxSize = 5,
  className = "",
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate
    if (!file.type.startsWith("image/")) {
      alert("Nur Bilddateien erlaubt");
      return;
    }

    if (file.size > maxSize * 1024 * 1024) {
      alert(`Maximal ${maxSize}MB erlaubt`);
      return;
    }

    setIsLoading(true);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
      onChange?.(reader.result as string);
      setIsLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    setPreview(null);
    onChange?.(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className={`relative ${className}`}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {preview ? (
        <div className="relative group">
          <img
            src={preview}
            alt="Preview"
            className="w-full rounded-xl object-cover"
            style={{ aspectRatio }}
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2">
            <button
              onClick={() => inputRef.current?.click()}
              className="px-3 py-1.5 bg-white text-gray-900 rounded-lg text-sm font-medium"
            >
              Ändern
            </button>
            <button
              onClick={handleRemove}
              className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm font-medium"
            >
              Entfernen
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          disabled={isLoading}
          className="w-full border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center hover:border-primary/50 transition-colors"
          style={{ aspectRatio }}
        >
          {isLoading ? (
            <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
          ) : (
            <>
              <Image className="h-8 w-8 text-muted-foreground mb-2" />
              <span className="text-sm text-muted-foreground">Bild auswählen</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}

// ============================================
// 🎬 AVATAR UPLOAD
// ============================================

interface AvatarUploadProps {
  value?: string;
  onChange?: (url: string | null) => void;
  size?: number;
  className?: string;
}

export function AvatarUpload({
  value,
  onChange,
  size = 100,
  className = "",
}: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
      onChange?.(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <motion.button
        onClick={() => inputRef.current?.click()}
        className="relative rounded-full overflow-hidden group"
        style={{ width: size, height: size }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {preview ? (
          <img
            src={preview}
            alt="Avatar"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <Upload className="h-6 w-6 text-muted-foreground" />
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Upload className="h-6 w-6 text-white" />
        </div>
      </motion.button>
    </div>
  );
}

