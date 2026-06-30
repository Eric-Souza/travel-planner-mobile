import { Platform } from 'react-native';

export type PickedFile = {
  uri: string;
  name: string;
  mimeType: string;
};

/**
 * Append a picked document to FormData.
 * Native: React Native { uri, name, type } blob shape.
 * Web: real File/Blob (RN shape is serialized as a string and breaks FastAPI UploadFile).
 */
export async function appendFileToFormData(form: FormData, file: PickedFile): Promise<void> {
  if (Platform.OS === 'web') {
    const response = await fetch(file.uri);
    if (!response.ok) {
      throw new Error('Could not read the selected file for upload.');
    }
    const blob = await response.blob();
    const type = file.mimeType || blob.type || 'application/octet-stream';
    form.append('file', new File([blob], file.name, { type }));
    return;
  }

  form.append('file', {
    uri: file.uri,
    name: file.name,
    type: file.mimeType || 'application/octet-stream',
  } as unknown as Blob);
}
