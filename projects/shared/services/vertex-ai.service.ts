import {inject, Injectable} from '@angular/core';
import {getGenerativeModel, VertexAI} from '@angular/fire/vertexai';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {GEMINI_15_FLASH, IMAGEN_3_FAST_ENDPOINT} from '@shared/constants';
import {firstValueFrom} from 'rxjs';
import {FunctionsService, StorageService} from '@shared/services';
import {MediaCategory} from '@shared/enums';
import {MatSnackBar} from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class VertexAiService {
  private vertexAiService = inject(VertexAI);
  private http = inject(HttpClient);
  private storageService = inject(StorageService);
  private functions = inject(FunctionsService);

  async generateImage(path: string, prompt: string, mediaCategory: MediaCategory) {
    try {
      return await this.functions.call('generateImage', {path, prompt, mediaCategory});
    } catch (error) {
      console.error('Error generating image:', error);
      return null;
    }
  }

  getModel(model: string = GEMINI_15_FLASH) {
    return getGenerativeModel(this.vertexAiService, {model});
  }

  async generate(prompt: string, model?: string): Promise<string> {
    const result = await this.getModel(model).generateContent(prompt);
    const response = result.response;
    return response.text();
  }

  async imagen(prompt: string, imageCount: number = 1): Promise<string[] | null> {
    try {
      // Get the token from the AuthService
      const token = ''; // ToDo get the token (in the future get the token from SDK, Firebase function, etc)

      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`,  // Use the token here
        'Content-Type': 'application/json; charset=utf-8',
      });

      const requestBody = {
        instances: [
          {
            prompt: prompt,
          },
        ],
        parameters: {
          sampleCount: imageCount, // Set the number of images to generate-topic
        },
      };

      const response = await firstValueFrom(
        this.http.post<{ predictions: Array<{ imageUri: string }> }>(IMAGEN_3_FAST_ENDPOINT, requestBody, { headers })
      );

      // Process the response and return base64-encoded images as data URIs
      return response.predictions.map((prediction: any) =>
        `data:${prediction.mimeType};base64,${prediction.bytesBase64Encoded}`
      );
    } catch (error) {
      console.error('Error generating images:', error);
      return null;
    }
  }

  async storeImage(base64Image: string, path: string): Promise<string | null> {
    try {
      const blob = this.base64ToBlob(base64Image); // Convert Base64 Image to Blob
      const ref = this.storageService.getRef(path); // Get a storage reference
      await this.storageService.upload(ref, blob); // Upload Image to Firebase Storage
      return await this.storageService.getLink(ref); // Get the download URL once upload is complete
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  }

  // Helper function to convert base64 data URL to Blob
  base64ToBlob(dataUrl: string): Blob {
    const byteString = atob(dataUrl.split(',')[1]);
    const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];
    const byteArray = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) {
      byteArray[i] = byteString.charCodeAt(i);
    }

    return new Blob([byteArray], { type: mimeString });
  }
}
