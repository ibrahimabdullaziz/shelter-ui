import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, type ChangeEvent } from "react";
import { deleteUnitPhoto } from "../../../api/units";
import { Modal } from "../../ui/Modal";
import { Button } from "../../ui/Button";
import { getApiErrorMessage } from "../../../lib/getApiErrorMessage";
import { unitKeys } from "../../../queries/unitKeys";
import {
  useUnitPhotoUpload,
  type UploadedUnitPhoto,
} from "./useUnitPhotoUpload";

export type { UploadedUnitPhoto } from "./useUnitPhotoUpload";

interface UnitPhotoUploadProps {
  unitId: string;
  photos: UploadedUnitPhoto[];
  onPhotoUploaded: (photo: UploadedUnitPhoto) => void;
  onPhotoDeleted: (photoId: string) => void;
}

export function UnitPhotoUpload({
  unitId,
  photos,
  onPhotoUploaded,
  onPhotoDeleted,
}: UnitPhotoUploadProps) {
  const queryClient = useQueryClient();
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
  const deletePhotoMutation = useMutation({
    mutationKey: [...unitKeys.mutations(), "photo-delete", unitId],
    mutationFn: deleteUnitPhoto,
    onSuccess: async (_result, photoId) => {
      onPhotoDeleted(photoId);
      await queryClient.invalidateQueries({ queryKey: unitKeys.all });
    },
  });

  const handleDeleteUploaded = (photoId: string) => {
    if (!window.confirm("Delete this uploaded photo? This cannot be undone.")) {
      return;
    }
    deletePhotoMutation.mutate(photoId);
  };

  const handleSelection = (event: ChangeEvent<HTMLInputElement>) => {
    appendFiles(event.currentTarget.files);
    event.currentTarget.value = "";
  };

  return (
    <div className="unit-photo-upload">
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
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        size="large"
        label="Manage unit photos"
      >
        <section className="unit-photo-panel" aria-label="Unit photos">
          <header className="unit-photo-heading">
            <p className="host-kicker">LISTING PHOTOS</p>
            <h2>Manage photos</h2>
            <p>Choose clear photos to show guests what this stay offers.</p>
          </header>
          <div className="unit-photo-picker">
            <input
              id={`unit-photo-input-${unitId}`}
              className="unit-photo-input"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              disabled={isUploading || deletePhotoMutation.isPending}
              onChange={handleSelection}
            />
            <label
              className="unit-photo-select-button"
              htmlFor={`unit-photo-input-${unitId}`}
            >
              <span aria-hidden="true">＋</span>
              Choose photos
            </label>
          </div>
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
                  <div className="unit-photo-item ui-surface" key={selected.id}>
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

          {deletePhotoMutation.isError && (
            <p className="unit-photo-error" role="alert">
              {getApiErrorMessage(deletePhotoMutation.error)}
            </p>
          )}
          {deletePhotoMutation.isSuccess && (
            <p className="unit-photo-success" role="status">
              Photo deleted.
            </p>
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
                    <Button
                      type="button"
                      variant="danger"
                      size="small"
                      disabled={isUploading || deletePhotoMutation.isPending}
                      aria-label={`Delete uploaded photo ${index + 1}`}
                      onClick={() => handleDeleteUploaded(photo.id)}
                    >
                      Delete
                    </Button>
                  </figure>
                ))}
              </div>
            </div>
          )}
        </section>
      </Modal>
    </div>
  );
}
