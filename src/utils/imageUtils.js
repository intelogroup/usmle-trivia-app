const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

/**
 * Creates a transformed image URL for Supabase Storage.
 * This is for PUBLIC buckets. For private buckets, you'd need to handle signed URLs.
 * @param {string} originalUrl - The full original public URL of the image.
 * @param {object} options - The transformation options.
 * @param {number} [options.width] - The target width of the image.
 * @param {number} [options.height] - The target height of the image.
 * @param {number} [options.quality=80] - The image quality (1-100).
 * @param {string} [options.resize='cover'] - The resize mode ('cover', 'contain', 'fill').
 * @returns {string} The new URL with transformation parameters.
 */
export function getTransformedUrl(originalUrl, options = {}) {
  if (!originalUrl || !SUPABASE_URL) {
    // Return a default placeholder or the original URL if it's not a Supabase URL
    return originalUrl || 'https://via.placeholder.com/150';
  }
  
  // Ensure we are not transforming an already transformed URL or external URL
  const urlObject = new URL(originalUrl);
  if (!urlObject.hostname.endsWith('supabase.co') || urlObject.searchParams.has('width')) {
    return originalUrl;
  }
  
  const {
    width,
    height,
    quality = 80,
    resize = 'cover',
  } = options;

  const params = new URLSearchParams();
  if (width) params.append('width', width);
  if (height) params.append('height', height);
  params.append('quality', quality);
  params.append('resize', resize);

  // Reconstruct the URL properly to avoid issues with existing query params
  // The path for Supabase storage transformations is typically /render/image/public/...
  const pathSegments = urlObject.pathname.split('/');
  const bucketName = pathSegments[pathSegments.length - 2];
  const objectPath = pathSegments[pathSegments.length - 1];

  if (!bucketName || !objectPath) {
    return originalUrl; // Invalid Supabase storage URL structure
  }
  
  // This constructs the URL in the format required by Supabase's new render endpoints.
  // Example: https://<project_ref>.supabase.co/storage/v1/render/image/public/<bucket>/<path>?width=100
  const storagePath = `/storage/v1/render/image/public/${bucketName}/${objectPath}`;
  
  return `${new URL(storagePath, SUPABASE_URL).href}?${params.toString()}`;
} 