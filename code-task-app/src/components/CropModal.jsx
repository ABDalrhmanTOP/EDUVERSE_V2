import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import getCroppedImg from "../utils/cropImage";
import "../styles/CropModal.css";

const CropModal = ({ imageSrc, onComplete, onCancel }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    try {
      const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      onComplete(croppedImageBlob);
    } catch (e) {
      console.error("Cropping failed:", e);
    }
  };

  return (
    <div className="crop-modal-overlay">
      <div className="crop-modal-container">
        <div className="crop-container">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>
        <div className="crop-modal-buttons">
          <button onClick={handleSave} className="crop-modal-btn save">
            Save
          </button>
          <button onClick={onCancel} className="crop-modal-btn cancel">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CropModal;
