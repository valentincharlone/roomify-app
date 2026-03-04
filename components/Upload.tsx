import { CheckCircle2, ImageIcon, UploadIcon } from "lucide-react";
import React, { useState } from "react";
import { useOutletContext } from "react-router";
import {
  PROGRESS_INTERVAL_MS,
  PROGRESS_STEP,
  REDIRECT_DELAY_MS,
} from "lib/constants";

interface UploadProps {
  onComplete?: (dataUrl: string) => void;
}

export const Upload: React.FC<UploadProps> = ({ onComplete }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);

  const { isSignedIn } = useOutletContext<AuthContext>();

  const processFile = (selectedFile: File) => {
    if (!isSignedIn) return;

    setFile(selectedFile);
    setProgress(0);

    const reader = new FileReader();

    reader.onloadend = () => {
      const result = reader.result;
      if (typeof result !== "string") return;

      let currentProgress = 0;
      const intervalId = window.setInterval(() => {
        currentProgress = Math.min(currentProgress + PROGRESS_STEP, 100);
        setProgress(currentProgress);

        if (currentProgress >= 100) {
          window.clearInterval(intervalId);

          setTimeout(() => {
            onComplete?.(result);
          }, REDIRECT_DELAY_MS);
        }
      }, PROGRESS_INTERVAL_MS);
    };

    reader.readAsDataURL(selectedFile);
  };

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!isSignedIn) return;

    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!isSignedIn) return;

    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!isSignedIn) return;

    setIsDragging(false);

    const droppedFile = event.dataTransfer.files?.[0];
    if (droppedFile) {
      processFile(droppedFile);
    }
  };

  return (
    <div className="upload">
      {!file ? (
        <div
          className={`dropzone ${isDragging ? "is-dragging" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            className="drop-input"
            accept=".jpg,.jpeg,.png"
            disabled={!isSignedIn}
            onChange={handleInputChange}
          />

          <div className="drop-content">
            <div className="drop-icon">
              <UploadIcon size={20} />
            </div>
            <p>
              {isSignedIn
                ? "Hacé clic para subir o arrastrá tu archivo acá"
                : "Iniciá sesión con Puter para subir archivos"}
            </p>
            <p className="help">Tamaño máximo: 50&nbsp;MB.</p>
          </div>
        </div>
      ) : (
        <div className="upload-status">
          <div className="status-content">
            <div className="status-icon">
              {progress === 100 ? (
                <CheckCircle2 className="check" />
              ) : (
                <ImageIcon className="image" />
              )}
            </div>

            <h3>{file.name}</h3>

            <div className="progress">
              <div className="bar" style={{ width: `${progress}%` }} />
            </div>

            <p className="status-text">
              {progress < 100
                ? "Analizando plano..."
                : "Redirigiendo al editor..."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
