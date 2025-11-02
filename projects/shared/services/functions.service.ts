import { Injectable } from '@angular/core';
import { Functions, httpsCallable, HttpsCallableResult } from '@angular/fire/functions';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class FunctionsService {
  constructor(
    private functions: Functions,
    private snackBar: MatSnackBar
  ) {}

  async call<T = any, R = any>(name: string, data: T): Promise<R | null> {
    const callable = httpsCallable<T, R>(this.functions, name);
    try {
      const result: HttpsCallableResult<R> = await callable(data);
      return result.data; // Ensuring we only return the `data` part
    } catch (error: unknown) {
      let message = 'An unexpected error occurred.';
      if (error instanceof Error) {
        message = error.message;
      }
      this.snackBar.open(message, 'Close', { duration: 3000 });
      return null;
    }
  }
}
