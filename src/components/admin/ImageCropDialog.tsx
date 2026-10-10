import React, { useCallback, useState } from 'react';
import Cropper, { type Area } from 'react-easy-crop';
import 'react-easy-crop/react-easy-crop.css';
import { cropImageToWebp } from '../../lib/menuMedia';

interface ImageCropDialogProps {
  imageSrc: string;
  onCancel: () => void;
  onConfirm: (file: File) => void;
}

export const ImageCropDialog: React.FC<ImageCropDialogProps> = ({
  imageSrc,
  onCancel,
  onConfirm,
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState<Area | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const onCropComplete = useCallback((_cropped: Area, pixels: Area) => {
    setArea(pixels);
  }, []);

  const confirm = async () => {
    if (!area) return;
    setSaving(true);
    setError('');
    try {
      const file = await cropImageToWebp(imageSrc, area);
      onConfirm(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível recortar a imagem.');
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4">
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white">
        <div className="px-5 pb-3 pt-5">
          <h3 className="text-lg font-bold text-gray-900">Ajustar foto</h3>
          <p className="mt-1 text-sm text-gray-500">
            A foto do cardápio é quadrada. Arraste e ajuste o zoom. Qualquer formato vira WebP ao confirmar.
          </p>
        </div>

        <div className="relative h-80 w-full bg-neutral-900">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={0}
            aspect={1}
            cropShape="rect"
            showGrid
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        <div className="space-y-4 px-5 py-4">
          <label className="block text-sm font-medium text-gray-700">
            Zoom
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(event) => setZoom(Number(event.target.value))}
              className="mt-2 w-full"
            />
          </label>

          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              className="flex-1 rounded-lg bg-gray-200 px-4 py-2 text-gray-800 hover:bg-gray-300 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={confirm}
              disabled={saving || !area}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Convertendo...' : 'Usar esta foto'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
