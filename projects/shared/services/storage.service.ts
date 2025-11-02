import { Injectable } from '@angular/core';
import {
  deleteObject,
  FullMetadata,
  getDownloadURL, getMetadata,
  listAll,
  ref,
  Storage,
  StorageReference,
  uploadBytesResumable,
  UploadTask
} from '@angular/fire/storage';
import {ListResult} from '@firebase/storage';


@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor(
    private storage: Storage
  ) { }

  getRef(path: string): StorageReference {
    return ref(this.storage, path);
  }

  getMeta(ref: StorageReference): Promise<FullMetadata> {
    return getMetadata(ref)
  }

  getLink(ref: StorageReference): Promise<string> {
    return getDownloadURL(ref);
  }

  listAll(ref: StorageReference): Promise<ListResult> {
    return listAll(ref);
  }

  upload(storageRef: StorageReference, file: any): UploadTask {
    // 'file' comes from the Blob or File API
    return uploadBytesResumable(storageRef, file);
  }

  delete(reference: StorageReference): void {
    console.log(reference);
    deleteObject(reference).then().catch();
  }

  resize(file: Blob, maxWidth = 400, maxHeight = 400): Promise<File> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => {
        const scale = Math.min(maxWidth / image.width, maxHeight / image.height);
        const width = Math.round(image.width * scale);
        const height = Math.round(image.height * scale);

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) return reject("Could not get canvas context");
        ctx.drawImage(image, 0, 0, width, height);

        canvas.toBlob(blob => {
          if (!blob) return reject("Failed to create blob");
          const resizedFile = new File([blob], file instanceof File? file.name:"resized.webp", {type: "image/webp"});
          resolve(resizedFile);
        }, "image/webp", 0.92); // quality: 0.92
      };

      image.onerror = reject;
      image.src = URL.createObjectURL(file);
    });
  }

}


