import {Layout} from '@shared/interfaces';

export const PROFILE_ADDED: Layout = {
  heading: 'Profile Added Successfully!',
  subheading:'Welcome to Write The Future.',
  actions: [{label: 'Ok', icon: 'done'}]
};

export const FUNDED: Layout = {
  heading: 'You are all set!',
  subheading:'Welcome fund deposited to your wallet. Please check your profile for details.',
  actions: [{label: 'Ok', icon: 'done'}]
};

export const CONTACT_SUPPORT: Layout = {
  heading: 'Too Many Requests!',
  subheading:'Please contact support to resolve the issue.',
  actions: [{label: 'Support', icon: 'support'}]
};

export const ACTIVATE: Layout = {
  heading: 'Activation email sent!',
  subheading:'Please click on the activation link inside email to proceed.',
  actions: [{label: 'Ok', icon: 'done'}, {label: 'Resend', icon: 'email'}]
};


export const RESEND: Layout = {
  heading: 'Please Try Again.',
  subheading:'The verification link has expired. Please hit the resend button for a new verification email and check the spam folder if the email is not in your mail box.',
  actions: [
    {label: 'Resend', icon: 'email'},
    {label: 'Home', icon: 'home'},
  ]
};

export const RESENT: Layout = {
  heading: 'Another email sent!',
  subheading:'Please check the spam folder if the email is not in your mail box.',
  actions: [{label: 'Resend', icon: 'email'}]
};

export const PASSWORD_CHANGED: Layout = {
  heading: 'Password Changed Successfully!',
  subheading:'Please login with the new password.',
  actions: [{label: 'Login', icon: 'login'}]
};

export const RESEND_PASSWORD_LINK: Layout = {
  heading: 'Please Try Again.',
  subheading:'The reset link has expired. Please hit the resend button for a new password reset email and check the spam folder if the email is not in your mail box.',
  actions: [{label: 'Resend', icon: 'email'}]
};

export const EMAIL_RECOVERED: Layout = {
  heading: 'Email Recovered Successfully!',
  subheading:'Please login with the original email to continue.',
  actions: [{label: 'Login', icon: 'login'}]
};

export const EMAIL_RECOVERY_EXPIRED: Layout = {
  heading: 'The reset link has expired.',
  subheading:'The original email is still valid. Please login and try again via console if you wish to change your email.',
  actions: [
    {label: 'Home', icon: 'home'},
    {label: 'Login', icon: 'login'}
  ]};

export const EMAIL_CHANGED: Layout = {
  heading: 'Email Changed Successfully!',
  subheading:'Please login with the new email to continue.',
  actions: [{label: 'Login', icon: 'login'}]
}

export const EMAIL_VERIFIED: Layout = {
  heading: 'Email Verified Successfully!',
  subheading:'Please re-login to continue.',
  actions: [
    {label: 'Home', icon: 'home'},
    {label: 'Login', icon: 'login'}
  ]
}

export const CHECKING: Layout = {
  heading: 'Please Wait...',
  subheading:'Validating the action code.',
  actions: [{label: 'Checking', icon: 'hourglass_top'}]
}
