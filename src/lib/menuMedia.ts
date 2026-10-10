import { supabase } from './supabase';

export const MENU_IMAGE_MAX_BYTES = 2 * 1024 * 1024;
export const MENU_VIDEO_MAX_BYTES = 20 * 1024 * 1024;

const LOOSE_MIME = new Set(['', 'application/octet-stream']);

export const MENU_IMAGE_OUTPUT_SIZE = 800;

const IMAGE_EXTENSIONS = /\.(jpe?g|png|gif|bmp|webp|avif)$/i;

export function isMenuImageFile(file: File): boolean {
  if (file.type === 'image/svg+xml') return false;
  if (file.type.startsWith('image/')) return true;
  return IMAGE_EXTENSIONS.test(file.name);
}

export function loadMenuImage(file: File): Promise<string> {
  if (!isMenuImageFile(file)) {
    return Promise.reject(new Error('Escolha uma imagem JPG, PNG, WebP, GIF ou AVIF.'));
  }

  const url = URL.createObjectURL(file);
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(url);
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Não foi possível ler essa imagem. Use JPG, PNG ou WebP.'));
    };
    image.src = url;
  });
}

export async function cropImageToWebp(
  imageSrc: string,
  area: { x: number; y: number; width: number; height: number }
): Promise<File> {
  const image = await decodeImage(imageSrc);
  const side = MENU_IMAGE_OUTPUT_SIZE;
  const canvas = document.createElement('canvas');
  canvas.width = side;
  canvas.height = side;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Não foi possível preparar a imagem.');

  const x = Math.max(0, area.x);
  const y = Math.max(0, area.y);
  const width = Math.max(1, Math.min(image.naturalWidth - x, area.width));
  const height = Math.max(1, Math.min(image.naturalHeight - y, area.height));

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  context.drawImage(image, x, y, width, height, 0, 0, side, side);

  let quality = 0.86;
  let blob = await canvasToWebp(canvas, quality);
  while (blob.size > MENU_IMAGE_MAX_BYTES && quality > 0.45) {
    quality = Math.round((quality - 0.08) * 100) / 100;
    blob = await canvasToWebp(canvas, quality);
  }

  if (blob.size > MENU_IMAGE_MAX_BYTES) {
    throw new Error('A imagem ficou maior que 2 MB. Escolha outra foto.');
  }

  return new File([blob], 'foto.webp', { type: 'image/webp' });
}

function decodeImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Não foi possível ler essa imagem.'));
    image.src = src;
  });
}

function canvasToWebp(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob || blob.type !== 'image/webp') {
          reject(new Error('Este navegador não conseguiu converter a imagem para WebP.'));
          return;
        }
        resolve(blob);
      },
      'image/webp',
      quality
    );
  });
}

export function validateMenuImage(file: File): string | null {
  const name = file.name.toLowerCase();
  const webpName = name.endsWith('.webp');
  const webpType = file.type === 'image/webp' || (webpName && LOOSE_MIME.has(file.type));
  if (!webpName || !webpType) {
    return 'A imagem precisa ser WebP (.webp).';
  }
  if (file.size > MENU_IMAGE_MAX_BYTES) {
    return 'A imagem pode ter no máximo 2 MB.';
  }
  return null;
}

export function validateMenuVideo(file: File): string | null {
  const name = file.name.toLowerCase();
  const mp4Name = name.endsWith('.mp4');
  const mp4Type = file.type === 'video/mp4' || (mp4Name && LOOSE_MIME.has(file.type));
  if (!mp4Name || !mp4Type) {
    return 'O vídeo precisa ser MP4 (.mp4).';
  }
  if (file.size > MENU_VIDEO_MAX_BYTES) {
    return 'O vídeo pode ter no máximo 20 MB.';
  }
  return null;
}

export async function uploadMenuImage(file: File): Promise<string> {
  const invalid = validateMenuImage(file);
  if (invalid) throw new Error(invalid);
  return uploadToBucket('menu-images', file, 'webp', 'image/webp');
}

export async function uploadMenuVideo(file: File): Promise<string> {
  const invalid = validateMenuVideo(file);
  if (invalid) throw new Error(invalid);
  return uploadToBucket('menu-videos', file, 'mp4', 'video/mp4');
}

async function uploadToBucket(
  bucket: string,
  file: File,
  extension: string,
  contentType: string
): Promise<string> {
  const path = `${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    contentType,
    upsert: false,
    cacheControl: '3600',
  });

  if (error) {
    const message = error.message.toLowerCase();
    if (message.includes('bucket') || message.includes('not found')) {
      throw new Error(
        'O armazenamento de mídia ainda não existe. Execute database/add_menu_media.sql no SQL Editor do Supabase.'
      );
    }
    if (message.includes('mime') || message.includes('type')) {
      throw new Error('Arquivo recusado. Use somente WebP para imagem e MP4 para vídeo.');
    }
    if (message.includes('size') || message.includes('limit') || message.includes('payload')) {
      throw new Error(
        bucket === 'menu-images'
          ? 'A imagem passou do limite de 2 MB.'
          : 'O vídeo passou do limite de 20 MB.'
      );
    }
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
