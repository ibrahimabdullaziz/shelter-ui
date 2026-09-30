import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { uploadUnitPhoto } from "../../../api/units";
import { getApiErrorMessage } from "../../../lib/getApiErrorMessage";
import { unitKeys } from "../../../queries/unitKeys";
import type { UnitPhoto } from "../../../types/api";

const maxFileSize = 5 * 1024 * 1024;
const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export interface SelectedPhoto {
  id: string;
  file: File;
  previewUrl: string;
}

export interface UploadedUnitPhoto {
  photo: UnitPhoto;
  fileName: string;
}

interface UseUnitPhotoUploadOptions {
  unitId: string;
  onPhotoUploaded: (photo: UploadedUnitPhoto) => void;
}

function validateFile(file: File): string | null {
  if (!allowedTypes.has(file.type)) {
    return `${file.name}: choose a JPEG, PNG, or WebP image.`;
  }
  if (file.size > maxFileSize) {
    return `${file.name}: images must be 5 MB or less.`;
  }
  return null;
}

export function useUnitPhotoUpload({
  unitId,
  onPhotoUploaded,
}: UseUnitPhotoUploadOptions) {
  const queryClient = useQueryClient();
  const [selectedPhotos, setSelectedPhotos] = useState<SelectedPhoto[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});
  const [progressByPhoto, setProgressByPhoto] = useState<
    Record<string, number>
  >({});
  const [isUploading, setIsUploading] = useState(false);
  const previewUrlsRef = useRef(new Set<string>());
  const uploadLockRef = useRef(false);
  const onPhotoUploadedRef = useRef(onPhotoUploaded);
  const idRef = useRef(0);

  useEffect(() => {
    onPhotoUploadedRef.current = onPhotoUploaded;
  }, [onPhotoUploaded]);

  const uploadMutation = useMutation({
    mutationKey: unitKeys.photoUpload(unitId),
    mutationFn: ({
      file,
      onProgress,
    }: {
      file: File;
      onProgress: (progress: number) => void;
    }) => uploadUnitPhoto(unitId, file, onProgress),
  });

  useEffect(
    () => () => {
      previewUrlsRef.current.forEach((previewUrl) => {
        URL.revokeObjectURL(previewUrl);
      });
      previewUrlsRef.current.clear();
    },
    [],
  );

  const revokePreview = (previewUrl: string) => {
    URL.revokeObjectURL(previewUrl);
    previewUrlsRef.current.delete(previewUrl);
  };

  const appendFiles = (files: FileList | readonly File[] | null) => {
    if (!files) return;
    const validPhotos: SelectedPhoto[] = [];
    const nextErrors: string[] = [];

    Array.from(files).forEach((file) => {
      const validationError = validateFile(file);
      if (validationError) {
        nextErrors.push(validationError);
        return;
      }

      idRef.current += 1;
      const previewUrl = URL.createObjectURL(file);
      previewUrlsRef.current.add(previewUrl);
      validPhotos.push({
        id: `photo-${idRef.current}`,
        file,
        previewUrl,
      });
    });

    setSelectedPhotos((current) => [...current, ...validPhotos]);
    setValidationErrors(nextErrors);
    setUploadErrors((current) => {
      const next = { ...current };
      validPhotos.forEach(({ id }) => delete next[id]);
      return next;
    });
  };

  const removeSelected = (id: string) => {
    const removed = selectedPhotos.find((photo) => photo.id === id);
    if (removed) revokePreview(removed.previewUrl);

    setSelectedPhotos((current) => current.filter((photo) => photo.id !== id));
    setUploadErrors((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
    setProgressByPhoto((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
  };

  const uploadSelected = async () => {
    if (uploadLockRef.current || !selectedPhotos.length) return;
    uploadLockRef.current = true;
    setIsUploading(true);
    setUploadErrors({});

    try {
      for (const selected of [...selectedPhotos]) {
        setProgressByPhoto((current) => ({ ...current, [selected.id]: 0 }));
        try {
          const photo = await uploadMutation.mutateAsync({
            file: selected.file,
            onProgress: (progress) =>
              setProgressByPhoto((current) => ({
                ...current,
                [selected.id]: progress,
              })),
          });
          onPhotoUploadedRef.current({ photo, fileName: selected.file.name });
          await queryClient.invalidateQueries({ queryKey: unitKeys.all });
          revokePreview(selected.previewUrl);
          setSelectedPhotos((current) =>
            current.filter((photo) => photo.id !== selected.id),
          );
          setProgressByPhoto((current) => {
            const next = { ...current };
            delete next[selected.id];
            return next;
          });
        } catch (error) {
          setUploadErrors((current) => ({
            ...current,
            [selected.id]: getApiErrorMessage(error),
          }));
        }
      }
    } finally {
      uploadLockRef.current = false;
      setIsUploading(false);
    }
  };

  return {
    selectedPhotos,
    validationErrors,
    uploadErrors,
    progressByPhoto,
    isUploading,
    appendFiles,
    removeSelected,
    uploadSelected,
  };
}
