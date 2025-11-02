export enum AuthAction {
  // Firebase
  ResetPassword = 'resetPassword',
  RecoverEmail = 'recoverEmail',
  VerifyEmail = 'verifyEmail',

  // Custom
  EmailChanged = 'emailChanged',
  PasswordChanged = 'passwordChanged',
  EmailRecovered = 'emailRecovered',
}
