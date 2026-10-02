import { useState, type ChangeEvent } from "react";
import {
  useUnitPhotoUpload,
  type UploadedUnitPhoto,
} from "./useUnitPhotoUpload";

export type { UploadedUnitPhoto } from "./useUnitPhotoUpload";

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
  const [isOpen, setIsOpen] = useState(false);
  const {
    selectedPhotos,
    validationErrors,
    uploadErrors,
    progressByPhoto,
    isUploading,
    appendFiles,
    removeSelected,
    uploadSelected,
  } = useUnitPhotoUpload({
    unitId,
    onPhotoUploaded,
  });

  const handleSelection = (event: ChangeEvent<HTMLInputElement>) => {
    appendFiles(event.currentTarget.files);
    event.currentTarget.value = "";
  };

  return (
    <div className="unit-photo-upload">
      <button
        <Button
        className="unit-photo-toggle"
          variant="secondary"
          size="small"
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
              disabled={isUploading}
              onChange={handleSelection}
            />
          </label>
          <p className="unit-photo-help">
            JPEG, PNG, or WebP · up to 5 MB per image
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
                {selectedPhotos.map((selected, index) => (
                  <div className="unit-photo-item" key={selected.id}>
                    <img
                      src={selected.previewUrl}
                      alt={`Selected photo preview ${index + 1}`}
                    />
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
                    <Button
                      size="small"
                      type="button"
                      disabled={isUploading}
                      onClick={() => removeSelected(selected.id)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                variant="primary"
                type="button"
                disabled={isUploading || !selectedPhotos.length}
                onClick={() => void uploadSelected()}
              >
                {isUploading ? "Uploading..." : "Upload photos"}
              </Button>
            </>
          )}

          {photos.length > 0 && (
            <div className="unit-uploaded-photos">
              <h4>Uploaded photos</h4>
              <div className="unit-photo-grid">
                {photos.map(({ photo, fileName }, index) => (
                  <figure className="unit-photo-item ui-surface" key={photo.id}>
                    <img
                      src={photo.url}
                      alt={`Uploaded photo preview ${index + 1}`}
                    />
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
