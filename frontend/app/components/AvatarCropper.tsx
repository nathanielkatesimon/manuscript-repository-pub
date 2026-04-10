"use client";

import React, { useState, useRef, useCallback } from "react";
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import Image from "next/image";

interface AvatarCropperProps {
  currentAvatarUrl: string | null;
  apiBaseUrl: string;
  onCropped: (blob: Blob) => void;
}

function centerAspectCrop(mediaWidth: number, mediaHeight: number): Crop {
  return centerCrop(
    makeAspectCrop({ unit: "%", width: 80 }, 1, mediaWidth, mediaHeight),
    mediaWidth,
    mediaHeight
  );
}

export default function AvatarCropper({ currentAvatarUrl, apiBaseUrl, onCropped }: AvatarCropperProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [imgSrc, setImgSrc] = useState("");
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<Crop>();
  const imgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const avatarSrc = currentAvatarUrl
    ? `${apiBaseUrl}${currentAvatarUrl}`
    : "/avatar_placeholder.png";

  function onSelectFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImgSrc(reader.result as string);
      setModalOpen(true);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    setCrop(centerAspectCrop(naturalWidth, naturalHeight));
  }

  const handleCropAndSave = useCallback(() => {
    if (!completedCrop || !imgRef.current) return;

    const canvas = document.createElement("canvas");
    const image = imgRef.current;
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const size = 400;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      size,
      size
    );

    canvas.toBlob((blob) => {
      if (!blob) return;
      onCropped(blob);
      setModalOpen(false);
      setImgSrc("");
    }, "image/jpeg", 0.9);
  }, [completedCrop, onCropped]);

  return (
    <div className="flex flex-col gap-3">
      {/* Avatar preview */}
      <div className="relative h-24 w-24">
        <div className="h-24 w-24 overflow-hidden rounded-full border-2 border-gray-200">
          <Image
            src={avatarSrc}
            alt="Profile avatar"
            width={96}
            height={96}
            unoptimized
            className="h-full w-full object-cover"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="w-fit rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:cursor-pointer transition-colors"
      >
        Change Avatar
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onSelectFile}
      />

      {/* Crop modal */}
      {modalOpen && imgSrc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="flex w-full max-w-md flex-col gap-4 rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-base font-semibold text-gray-900">Crop your avatar</h3>
            <div className="flex justify-center">
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={1}
                circularCrop
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  ref={imgRef}
                  src={imgSrc}
                  alt="Crop source"
                  style={{ maxHeight: "50vh", maxWidth: "100%" }}
                  onLoad={onImageLoad}
                />
              </ReactCrop>
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => { setModalOpen(false); setImgSrc(""); }}
                className="rounded-md border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCropAndSave}
                disabled={!completedCrop}
                className="rounded-md bg-primary px-5 py-2 text-sm font-bold text-white hover:opacity-90 hover:cursor-pointer disabled:opacity-40"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
