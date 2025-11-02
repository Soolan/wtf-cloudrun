import { Injectable, inject } from '@angular/core';
import { FunctionsService } from '@shared/services';
import { Entity } from '@shared/interfaces';

@Injectable({
  providedIn: 'root'
})
export class OnboardingService {
  private readonly functions = inject(FunctionsService);
  private collectedInfo: { [key: string]: any } = {};

  private onboardingSteps = [
    { label: 'Company Name', prompt: 'Please help me understand the nature of your business. Let me start by asking what your company name?' },
    { label: 'Industry', prompt: 'Thank you for providing your company name. Now, please tell me, what industry are you in?' },
    { label: 'Team Structure', prompt: 'Great! Based on your industry, I can suggest a team structure. Would you like me to do that?' },
    { label: 'Confirm Team Structure', prompt: 'Here is a suggested team structure based on your industry. Does this look good? (Yes/No)\n\nCTO\n|-Fullstack Developer\n|-UX/UI Designer\n\nTotal Members: 3' },
    { label: 'Branding Assets', prompt: 'I can also help generate branding assets like logos and banners. Should I proceed?' },
    // ... more steps
  ];

  constructor() { }

  getInitialPrompt(): string {
    return this.onboardingSteps[0].prompt;
  }

  async processMessage(userMessage: string, aiPersona: Entity, discussionPath: string): Promise<{ message: string, collectedInfo: { [key: string]: any } }> {
    // Simulate backend processing
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

    let agentReply = '';

    // Find the first piece of information that is *not yet collected*
    const currentQuestionIndex = this.onboardingSteps.findIndex(step => !this.collectedInfo[step.label]);

    if (currentQuestionIndex === -1) {
      // All information collected, or unknown state.
      agentReply = "It seems I have all the information I need for now. What else can I help you with?";
    } else {
      const answeredStepLabel = this.onboardingSteps[currentQuestionIndex].label;

      // Special handling for Team Structure suggestion
      if (answeredStepLabel === 'Team Structure') {
        if (userMessage.toLowerCase() === 'yes') {
          this.collectedInfo[answeredStepLabel] = 'Suggested'; // Mark as suggested
          // Move to the next step which is 'Confirm Team Structure'
          const newNextInfoToCollectIndex = this.onboardingSteps.findIndex(step => !this.collectedInfo[step.label]);
          const nextStep = this.onboardingSteps[newNextInfoToCollectIndex];
          agentReply = nextStep.prompt; // This will be the 'Confirm Team Structure' prompt
        } else {
          this.collectedInfo[answeredStepLabel] = 'Skipped';
          // Find the index of 'Branding Assets' and jump to it
          const brandingAssetsIndex = this.onboardingSteps.findIndex(step => step.label === 'Branding Assets');
          agentReply = "No problem. We can skip the team structure for now. " + this.onboardingSteps[brandingAssetsIndex].prompt;
        }
      } else if (answeredStepLabel === 'Confirm Team Structure') {
        if (userMessage.toLowerCase() === 'yes') {
          this.collectedInfo['Team Structure'] = 'Approved (3 members)'; // Final approval
          agentReply = "Great! Team structure approved. " + this.onboardingSteps[currentQuestionIndex + 1].prompt; // Move to Branding Assets
        } else {
          this.collectedInfo['Team Structure'] = 'Rejected';
          agentReply = "Understood. We can revisit this later. " + this.onboardingSteps[currentQuestionIndex + 1].prompt; // Move to Branding Assets
        }
      } else {
        // Default handling for other questions
        this.collectedInfo[answeredStepLabel] = userMessage;

        // Now, determine the *new* next question to ask
        const newNextInfoToCollectIndex = this.onboardingSteps.findIndex(step => !this.collectedInfo[step.label]);

        if (newNextInfoToCollectIndex === -1) {
          agentReply = "Thank you! I have gathered all the initial information. What would you like to do next?";
        } else {
          const nextStep = this.onboardingSteps[newNextInfoToCollectIndex];
          agentReply = nextStep.prompt;
        }
      }
    }

    return { message: agentReply, collectedInfo: this.collectedInfo };
  }
}
