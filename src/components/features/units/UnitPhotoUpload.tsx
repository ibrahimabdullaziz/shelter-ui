import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { uploadUnitPhoto } from "../../../api/units";
import { getApiErrorMessage } from "../../../lib/getApiErrorMessage";
import type { UnitPhoto } from "../../../types/api";

const maxFileSize = 10 * 1024 * 1024;
const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

interface SelectedPhoto {
  id: string;
  file: File;
  previewUrl: string;
}

export interface UploadedUnitPhoto {
  photo: UnitPhoto;
  fileName: string;
}

interface UnitPhotoUploadProps {
  unitId: string;
  photos: UploadedUnitPhoto[];
  onPhotoUploaded: (photo: UploadedUnitPhoto) => void;
}

export function UnitPhotoUpload({
  unitId,
  photos,
  onPhotoUploaded,
}: UnitPhotoUploadProps) {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<SelectedPhoto[]>([]);
  const selectedPhotosRef = useRef<SelectedPhoto[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});
  const [progressByPhoto, setProgressByPhoto] = useState<
    Record<string, number>
  >({});

  const uploadMutation = useMutation({
    mutationFn: ({
      file,
      onProgress,
    }: {
      file: File;
      onProgress: (progress: number) => void;
    }) => uploadUnitPhoto(unitId, file, onProgress),
    onSuccess: async (photo, { file }) => {
      onPhotoUploaded({ photo, fileName: file.name });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["units"] }),
        queryClient.invalidateQueries({ queryKey: ["unit", unitId] }),
      ]);
    },
  });

  useEffect(
    () => () => {
      selectedPhotosRef.current.forEach(({ previewUrl }) => {
        URL.revokeObjectURL(previewUrl);
      });
    },
    [],
  );

  const handleSelection = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.currentTarget.files ?? []);
    event.currentTarget.value = "";

    selectedPhotosRef.current.forEach(({ previewUrl }) => {
      URL.revokeObjectURL(previewUrl);
    });

    const nextSelection: SelectedPhoto[] = [];
    const nextValidationErrors: string[] = [];

    files.forEach((file, index) => {
      if (!allowedTypes.has(file.type)) {
        nextValidationErrors.push(
          `${file.name}: choose a JPEG, PNG, or WebP image.`,
        );
      } else if (file.size > maxFileSize) {
        nextValidationErrors.push(
          `${file.name}: images must be 10 MB or less.`,
        );
      } else {
        nextSelection.push({
          id: `${file.name}-${file.lastModified}-${index}`,
          file,
          previewUrl: URL.createObjectURL(file),
        });
      }
    });

    selectedPhotosRef.current = nextSelection;
    setSelectedPhotos(nextSelection);
    setValidationErrors(nextValidationErrors);
    setUploadErrors({});
    setProgressByPhoto({});
  };

  const removeSelection = (id: string) => {
    const removed = selectedPhotosRef.current.find((photo) => photo.id === id);
    if (removed) URL.revokeObjectURL(removed.previewUrl);

    const nextSelection = selectedPhotosRef.current.filter(
      (photo) => photo.id !== id,
    );
    selectedPhotosRef.current = nextSelection;
    setSelectedPhotos(nextSelection);
    setProgressByPhoto((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
  };

  const uploadSelected = async () => {
    setUploadErrors({});

    for (const selected of selectedPhotosRef.current) {
      setProgressByPhoto((current) => ({ ...current, [selected.id]: 0 }));
      try {
        await uploadMutation.mutateAsync({
          file: selected.file,
          onProgress: (progress) =>
            setProgressByPhoto((current) => ({
              ...current,
              [selected.id]: progress,
            })),
        });
        removeSelection(selected.id);
      } catch (error) {
        setUploadErrors((current) => ({
          ...current,
          [selected.id]: getApiErrorMessage(error),
        }));
      }
    }
  };

  return (
    <div className="unit-photo-upload">
      <button
        className="unit-photo-toggle"
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        {isOpen
          ? "Close photos"
          : `Manage photos${photos.length ? ` (${photos.length})` : ""}`}
      </button>

      {isOpen && (
        <section className="unit-photo-panel" aria-label="Unit photos">
          <label className="host-form-field">
            Select photos
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              disabled={uploadMutation.isPending}
              onChange={handleSelection}
            />
          </label>
          <p className="unit-photo-help">
            JPEG, PNG, or WebP · up to 10 MB per image
          </p>

          {validationErrors.length > 0 && (
            <ul className="host-operation-error" role="alert">
              {validationErrors.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          )}

          {selectedPhotos.length > 0 && (
            <>
              <div
                className="unit-photo-grid"
                aria-label="Selected photo previews"
              >
                {selectedPhotos.map((selected) => (
                  <div className="unit-photo-item" key={selected.id}>
                    <img src={selected.previewUrl} alt={selected.file.name} />
                    <p title={selected.file.name}>{selected.file.name}</p>
                    {progressByPhoto[selected.id] !== undefined && (
                      <div className="unit-photo-progress">
                        <progress
                          max={100}
                          value={progressByPhoto[selected.id]}
                          aria-label={`Uploading ${selected.file.name}`}
                        />
                        <span>{progressByPhoto[selected.id]}%</span>
                      </div>
                    )}
                    {uploadErrors[selected.id] && (
                      <p className="unit-photo-error" role="alert">
                        {uploadErrors[selected.id]}
                      </p>
                    )}
                    <button
                      type="button"
                      disabled={uploadMutation.isPending}
                      onClick={() => removeSelection(selected.id)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              <button
                className="host-primary-button"
                type="button"
                disabled={uploadMutation.isPending || !selectedPhotos.length}
                onClick={() => void uploadSelected()}
              >
                {uploadMutation.isPending ? "Uploading..." : "Upload photos"}
              </button>
            </>
          )}

          {photos.length > 0 && (
            <div className="unit-uploaded-photos">
              <h4>Uploaded photos</h4>
              <div className="unit-photo-grid">
                {photos.map(({ photo, fileName }) => (
                  <figure className="unit-photo-item" key={photo.id}>
                    <img src={photo.url} alt={fileName} />
                    <figcaption title={fileName}>{fileName}</figcaption>
                  </figure>
                ))}
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
