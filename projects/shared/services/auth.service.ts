import {inject, Inject, Injectable} from '@angular/core';
import {
  Auth,
  UserCredential,
  authState,
  idToken,
  user,
  createUserWithEmailAndPassword,
  applyActionCode,
  sendEmailVerification,
  confirmPasswordReset,
  signInWithCustomToken,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  fetchSignInMethodsForEmail, signInWithPopup,
  GoogleAuthProvider, updateEmail,
  User, updatePassword,
} from '@angular/fire/auth';
import {MatSnackBar} from '@angular/material/snack-bar';
import {from, map, Observable, of, switchMap} from 'rxjs';
import {FunctionsService} from '@shared/services/functions.service';
import {FirebaseError} from '@angular/fire/app';
import {Product} from '@shared/enums';
import {AuthenticationComponent} from '@shared/dialogs';
import {DialogConfigService} from '@shared/services/dialog-config.service';
import {MatDialog} from '@angular/material/dialog';
import {Router} from '@angular/router';


@Injectable({
  providedIn: 'root',
})
export class AuthService {
  readonly user$: Observable<User | null>;
  readonly authState$: Observable<any>;
  readonly idToken$: Observable<string | null>;
  readonly customClaims$: Observable<Record<string, any> | null>;
  private googleAuthProvider = new GoogleAuthProvider();

  constructor(
    @Inject(Auth) public auth: Auth,
    private snackBar: MatSnackBar,
    private functions: FunctionsService,
    private dialogConfig: DialogConfigService,
    public dialog: MatDialog,
    private router: Router
  ) {
    this.user$ = user(this.auth);
    this.authState$ = authState(this.auth);
    this.idToken$ = idToken(this.auth);
    this.customClaims$ = this.idToken$.pipe(
      map((token) => (token ? this.decodeJwt(token) : null))
    );
  }

  async emailExists(email: string): Promise<string[]> {
    return fetchSignInMethodsForEmail(this.auth, email);
  }

  private decodeJwt(token: string): Record<string, any> {
    return JSON.parse(atob(token.split('.')[1]));
  }

  emailPassLogin(email: string, password: string): Promise<UserCredential> {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  getToken(): Observable<string | null> {
    return this.user$.pipe(
      switchMap((user) => (
        user ? from(user.getIdToken()) as Observable<string> : of(null)
      ))
    );
  }

  async getEmail(uid: string): Promise<string | null> {
    try {
      const response = await this.functions.call('getEmailByUid2ndGen', {uid});
      return response.data.email;
    } catch (error) {
      console.error('Error fetching email:', error);
      return null;
    }
  }

  async tokenSignIn(token: string): Promise<UserCredential | null> {
    try {
      return await signInWithCustomToken(this.auth, token);
    } catch (error) {
      this.snackBar.open('Error signing in.', 'X', {duration: 4000});
      return null;
    }
  }

  async addUser(email: string, password: string): Promise<UserCredential | null> {
    try {
      return await createUserWithEmailAndPassword(this.auth, email, password);
    } catch (error) {
      this.snackBar.open('Error adding new user.', 'X', {duration: 4000});
      console.error(error);
      return null;
    }
  }

  async applyCode(oobCode: string): Promise<boolean> {
    try {
      await applyActionCode(this.auth, oobCode);
      return true;
    } catch (error) {
      this.snackBar.open('Error applying the code.', 'X', {duration: 4000});
      console.error(error);
      return false;
    }
  }

  login() {
    const config = this.dialogConfig.getConfig(); // Get the default config
    config.width = '460px';
    config.data = {link: false, product: Product.Website};
    this.dialog.open(AuthenticationComponent, config).afterClosed().subscribe(success => {
      if (!success) return;
      this.router.navigate(['console']).then()
    });
  }

  async logout(): Promise<void> {
    sessionStorage.removeItem('userWtfToken');
    await this.auth.signOut();
  }

  async sendEmailVerification(): Promise<void> {
    if (!this.auth.currentUser) return;
    try {
      await sendEmailVerification(this.auth.currentUser);
      this.snackBar.open('Verification link sent to your email.', 'X', {duration: 3000});
    } catch (error) {
      this.snackBar.open('Error sending email.', 'X', {duration: 4000});
      console.error(error);
    }
  }

  async sendPassResetEmail(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(this.auth, email);
    } catch (error) {
      this.snackBar.open('Error sending password reset email.', 'X', {duration: 4000});
      console.error(error);
    }
  }

  async confirmPassReset(oobCode: string, newPassword: string): Promise<void> {
    try {
      await confirmPasswordReset(this.auth, oobCode, newPassword);
    } catch (error) {
      this.snackBar.open('Error confirming the password reset.', 'X', {duration: 4000});
      console.error(error);
    }
  }

  // updateEmail is used in the console for changing email
  async updateEmail(newEmail: string) {
    const user = this.auth.currentUser;
    if (!user) return;
    try {
      await updateEmail(user, newEmail);
      await this.sendEmailVerification();
    } catch (error) {
      console.error('Error updating email:', error);
    }
  }

  // updatePassword is used in the console for changing password and it is different from
  // the password reset flow initiated by clicking on the 'forgot password' link.
  // In simple words, it doesn't go through the /auth/action link.
  async updatePassword(newPassword: string): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) return;
    try {
      await updatePassword(user, newPassword);
      this.snackBar.open('Password changed. Please log in again.', 'X', {duration: 3000});
    } catch (error) {
      this.snackBar.open('Error changing the password.', 'X', {duration: 4000});
      console.error('Error updating password:', error);
    }
  }

  getErrorMessage(error: unknown): string {
    if (error instanceof FirebaseError) {
      switch (error.code) {
        case 'auth/invalid-email':
          return 'Invalid email address format.';
        case 'auth/user-not-found':
          return 'No user found with this email.';
        case 'auth/wrong-password':
          return 'Incorrect password. Please try again.';
        case 'auth/user-disabled':
          return 'This account has been disabled. Contact support.';
        case 'auth/email-already-in-use':
          return 'This email is already in use. Try logging in instead.';
        case 'auth/weak-password':
          return 'Password is too weak. Use at least 6 characters.';
        case 'auth/too-many-requests':
          return 'Too many failed attempts. Try again later.';
        default:
          return 'An unexpected error occurred. Please try again.';
      }
    }
    return 'An unknown error occurred.';
  }

  async signInWithGoogle(): Promise<void> {
    try {
      await signInWithPopup(this.auth, this.googleAuthProvider);
    } catch (error) {
      console.error('Google Sign-In Error:', error);
    }
  }
}
