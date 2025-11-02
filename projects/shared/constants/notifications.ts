import {EmailNotification, WtfQuery} from '@shared/interfaces';

export const EMAIL_NOTIFICATIONS: WtfQuery = {
  path: 'notifications',
  limit: 200,
  where: {field: 'delivery.startTime', operator: '!=', value: null},
  orderBy: {field: 'delivery.startTime', direction: 'desc'}
};

export const MAILING_LISTS_COLLECTION: string = 'mailing_lists';
export const MAILING_LISTS_DAY1_DOC: string = 'day1';
export const MAILING_LISTS_DAY2_DOC: string = 'day2';

export const EMAIL_NOTIFICATION: EmailNotification = {
  to: '',
  message: {
    subject: '',
    html: ''
  }
};

export const DEFAULT_WTF_EMAIL: string = 'drink@wtf.pub ';
export const NO_REPLY_WTF_EMAIL: string = 'noreply@wtf.pub ';

export const WELCOME_EMAIL_NOTIFICATION: EmailNotification = {
  to: '',
  message: {
    subject: 'Welcome to Write The Future: Where AI Shapes Tomorrow! 🌟',
    html: `
<!DOCTYPE html>
<html>
  <head>
    <title>Welcome to Write The Future [WTF]!</title>
    <style>
    /* General styles */
    body {
      font-family: Arial, sans-serif;
      font-size: 19px;
      color:black;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #fdfffe;
    }
    .blank {
      margin-top: 70px;
    }
    .banner {
     border-radius: 30px
    }
    .block {
      border-radius: 30px;
      padding: 30px;
    }
    .green {
      background-color: #ebfbec;
    }
    .purple {
      background-color: #fbecfb;
    }
    img {
      max-width: 100%;
      height: auto;
      display: block;
      margin: 0 auto;
    }
    li {
      margin: 7px 0;
    }
    </style>
    </head>
  <body>
    <div class="container">
      <div class="block green">
      <!-- Banner -->
      <img src="https://firebasestorage.googleapis.com/v0/b/wtf-workspace-ad6a4.appspot.com/o/mailing-list%2Fwelcome-banner.png?alt=media&token=bc1ad7a0-8a72-431a-a01c-f8ff5013ca62" alt="Welcome Banner" class="banner">

        <!-- Email content -->
      <p>Dear <strong>[DisplayName]</strong>,</p>
      <p>Welcome to Write The Future! 🚀</p>
      <p>You're now one step closer to transforming your business with AI.
      With easy team creation, instant knowledge base generation, and an embedded Kanban board,
      getting started is a breeze.
      Plus, explore 100 free API integrations to power up your workflows effortlessly.</p>
      <p>Ready to dive in? Activate your account and start writing your AI-driven success story!</p>
      </div>
      <div class="blank">
      <!-- Activation Button -->
      <a href="[ActivationUrl]"
         style="display: inline-block; padding: 12px 20px; font-size: 16px; color: white; background-color: MediumSeaGreen; text-decoration: none; border-radius: 5px;">
         Activate Your Account
      </a>
      <p>Or copy and paste this link into your browser:</p>

      <!-- Plain Activation Link -->
      <p><a href="[ActivationUrl]" style="color: MediumSeaGreen;">[ActivationUrl]</a></p>
      </div>

      <hr>
      <!-- Signature -->
      <p>Best regards,<br>
      <a href="https://wtf.pub" target="_blank" style="color: MediumSeaGreen; text-decoration: none">
        Write The Future </a>
      </p>
    </div>
  </body>
</html>
`
  }
};

export const TEAM_INVITATION: EmailNotification = {
  to: '[UserEmail]',
  message: {
    subject: `You've been invited.`,
    html: `
     <p>Dear: [DisplayName]</p>
     <p>You have been invited by [Admin], to join [Company].</p>
     <p>Visit the following link if you wish to accept this invitation and join their team.</p>
     <div class="blank">
      <!-- Activation Button -->
      <a href="[InvitationUrl]"
         style="display: inline-block; padding: 12px 20px; font-size: 16px; color: white; background-color: MediumSeaGreen; text-decoration: none; border-radius: 5px;">
         Join the team
      </a>
      <p>Or copy and paste this link into your browser:</p>

      <!-- Plain Activation Link -->
      <p><a href="[InvitationUrl]" style="color: MediumSeaGreen;">[InvitationUrl]</a></p>

      <p>Or ignore this email because the invitation will be expired in 2 days.</p>

      </div>

      <hr>
      <!-- Signature -->
      <p>Best regards,<br>
      <a href="https://wtf.pub" target="_blank" style="color: MediumSeaGreen; text-decoration: none">
        Write The Future </a>
      </p>
    `
  }
};

export const ADMIN_NOTIFICATION_BUSINESS_SETUP_ISSUE: EmailNotification = {
  to: DEFAULT_WTF_EMAIL,
  message: {
    subject: '🚨 🚨 🚨 Issue with setting up business.',
    html: `
     <p>Profile Id: [ProfileId]</p>
     <p>step: [IssueStep]</p>
    `
  }
};

export const ADMIN_NOTIFICATION_TAG_SETUP_ISSUE: EmailNotification = {
  to: DEFAULT_WTF_EMAIL,
  message: {
    subject: '🚨 🚨 🚨 Issue with setting up user tag.',
    html: `
     <p>Profile Id: [ProfileId]</p>
     <p>response: [Response]</p>
    `
  }
};

export const ADMIN_NOTIFICATION_TOPIC_GENERATION_ISSUE: EmailNotification = {
  to: DEFAULT_WTF_EMAIL,
  message: {
    subject: '🚨 🚨 🚨 Issue with generating topic.',
    html: `
     <p>Flow Id: [FlowId]</p>
     <p>Error: [ErrorMessage]</p>
    `
  }
};

export const CONFIRM_WITHDRAWAL_REQUEST: EmailNotification = {
  to: '',
  message: {
    subject: 'Write The Future: Withdrawal Confirmation',
    html: `
    <div style="font: 12px Arial, sans-serif; background-color:#eee; color:#666; width: 90%; padding: 10px; margin: 10px auto">
    <p style="font-size: 14px">Safety Code: <strong>[SafetyCode]</strong></p>
    Please check the safety code (can be found in your advanced profile settings).<br/>
    If the codes do not match, please ignore the email and contact Write The Future Support immediately
    </div>
    <div style="font: 18px Arial, sans-serif; color:#444">
      <p>Dear <strong>[DisplayName]</strong>,</p>
      <p>You have a pending withdrawal request.</p>
      <p>[WithdrawalDetails]</p>
      <p>Please review the withdrawal details carefully. If the withdrawal address is incorrect,
      we will not be able to assist you in recovering your assets.</p>
      <p>To confirm the withdrawal, click the button below:</p>
      <a href=\"[ConfirmationLink]\" target="_blank">Confirm Withdrawal</a>
      <p>For security reasons, this link will expire in 30 minutes and the withdrawal will be auto-rejected.</p>
      <p>If you did not request this withdrawal, please contact us immediately so we can secure your account.</p>
      <p>Stay safe!</p>,
      <p>Write The Future.</p>
    </div>`
  }
}

export const ADMIN_WITHDRAWAL_NOTIFICATION: EmailNotification = {
  to: DEFAULT_WTF_EMAIL,
  message: {
    subject: 'Withdrawal Request',
    html: `
     <p>Secure code docId: [DocId]</p>
     <p>user: [DisplayName]</p>
     <p>email: [Email]</p>
     <p>details: </p>
     <p>[WithdrawalDetails]</p>
    `
  }
};

export const PENDING_JOIN_REQUEST: EmailNotification = {
  to: '',
  message: {
    subject: 'Pending Join Request! 🌟',
    html: ` wants you to join their team. \nClick here to join!`
  }
};

export const TEAM_REMOVAL_NOTICE: EmailNotification = {
  to: '',
  message: {
    subject: 'You have been removed from the team! 🌟',
    html: ` removed you from their team.`
  }
};

export const MIDTRANS_PAYMENT_SUCCESS: EmailNotification = {
  from: NO_REPLY_WTF_EMAIL,
  to: '',
  message: {
    subject: `We've received your payment! 🌟`,
    html: `hello #display_name, <br/>
        <p>This is to confirm that we've received your payment for #order_id.</p>
        <p>Thank you for using our services.</p>
        Best,<br/>
        Write The Future Team 🚀`
  }
};

export const MIDTRANS_PAYMENT_FAILED: EmailNotification = {
  from: NO_REPLY_WTF_EMAIL,
  to: '',
  message: {
    subject: `There was an error with your payment!`,
    html: `hello #display_name, <br/>
        There was an error with your payment for #order_id.
        <hr>
        <p>Please try again and reach out to us if the issue persists. Thank you for using our services.</p>
        Best,<br/>
        Write The Future Team 🚀`
  }
};

export const MIDTRANS_PAYMENT_PENDING: EmailNotification = {
  from: NO_REPLY_WTF_EMAIL,
  to: '',
  message: {
    subject: `Your payment is pending!`,
    html: `hello #display_name, <br/>
        There was an delay with your payment for #order_id.
        <hr>
        <p>Please wait for a while and reach out to us if the issue persists. Thank you for using our services.</p>
        Best,<br/>
        Write The Future Team 🚀`
  }
};

export const MIDTRANS_PAYMENT_ADMIN: EmailNotification = {
  from: NO_REPLY_WTF_EMAIL,
  to: 'sohail2d@gmail.com',
  message: {
    subject: `Someone made/attempted a payment!`,
    html: `hey man, <br/>
        A user (email: #email, name: #display_name) has made/attempted a payment for #order_id.
        And it #outcome.
        <hr>
        Have a lovely day. 🚀`
  }
};
