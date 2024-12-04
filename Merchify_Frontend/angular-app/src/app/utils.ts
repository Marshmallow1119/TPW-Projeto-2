export function base64toBlob(base64Data: string, contentType: string): Blob {
    const byteCharacters = atob(base64Data);
    const byteArrays: Uint8Array[] = [new Uint8Array(byteCharacters.length)];
    for (let i = 0; i < byteCharacters.length; i++) {
      byteArrays[0][i] = byteCharacters.charCodeAt(i);
    }
    return new Blob(byteArrays, { type: contentType });
  }
  
  export function getBase64(file: File): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  }