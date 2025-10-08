import ImageKit from "imagekit";

export const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
});

export function getImageKitAuthParams() {
  const authenticationEndpoint = "/api/imagekit/auth";
  return { authenticationEndpoint };
}

/**
 * Extracts the fileId from an ImageKit URL
 * ImageKit URLs typically look like: https://ik.imagekit.io/your-id/path/to/file_fileId.ext
 * The fileId is the last part of the path before the extension
 */
export function extractFileIdFromUrl(url: string): string | null {
  try {
    // ImageKit URLs contain the fileId in the path
    // Example: https://ik.imagekit.io/yourId/folder/filename_fileId.jpg
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    
    // Extract the last segment of the path (filename with fileId)
    const segments = pathname.split('/');
    const filename = segments[segments.length - 1];
    
    // The fileId is typically embedded in the filename or we can use the full path
    // For ImageKit, we'll use the filePath (path after the endpoint)
    return pathname;
  } catch (error) {
    console.error('Error extracting fileId from URL:', url, error);
    return null;
  }
}

/**
 * Deletes an image from ImageKit by its URL
 * This function searches for the file on ImageKit and deletes it by fileId
 */
export async function deleteImageKitFile(url: string): Promise<boolean> {
  try {
    // First, try to search for the file by URL
    // ImageKit's search can find files by URL
    const urlObj = new URL(url);
    const fileName = decodeURIComponent(urlObj.pathname.split('/').pop() || '');
    
    if (!fileName) {
      console.error('Could not extract filename from URL:', url);
      return false;
    }

    // Search for the file by name
    // Note: This may return multiple results if there are files with the same name in different folders
    const searchResults = await imagekit.listFiles({
      searchQuery: `name="${fileName}"`,
      limit: 10,
    });

    // Find the exact match by comparing full URLs
    const matchingFile = searchResults.find(file => {
      // ImageKit file.url should match our stored URL
      return file.url === url || file.url === decodeURIComponent(url);
    });

    if (matchingFile && matchingFile.fileId) {
      await imagekit.deleteFile(matchingFile.fileId);
      console.log('Successfully deleted ImageKit file:', fileName, 'fileId:', matchingFile.fileId);
      return true;
    }

    // If exact match not found, try searching by the full path
    const filePath = urlObj.pathname;
    const pathSearch = await imagekit.listFiles({
      path: filePath.substring(0, filePath.lastIndexOf('/')),
      limit: 100,
    });

    const fileByPath = pathSearch.find(f => f.name === fileName);
    if (fileByPath && fileByPath.fileId) {
      await imagekit.deleteFile(fileByPath.fileId);
      console.log('Successfully deleted ImageKit file by path:', fileName, 'fileId:', fileByPath.fileId);
      return true;
    }

    console.warn('Could not find file to delete on ImageKit:', url);
    return false;
  } catch (error: any) {
    // If the error is "File not found", that's okay - it might have been deleted already
    if (error?.message?.includes('No file found') || error?.message?.includes('not found')) {
      console.log('File already deleted or not found on ImageKit:', url);
      return true;
    }
    console.error('Error deleting ImageKit file:', url, error);
    return false;
  }
}

/**
 * Deletes multiple ImageKit images
 */
export async function deleteImageKitFiles(urls: string[]): Promise<void> {
  const deletePromises = urls.map(url => deleteImageKitFile(url));
  await Promise.allSettled(deletePromises);
}

