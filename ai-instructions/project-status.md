# Project Status & Next Steps

This document summarizes our recent progress and outlines the immediate next steps for our project.

## 1. High-Level Strategy: Hybrid AI Architecture

We have defined a new strategic direction for the platform's AI architecture. The goal is to evolve from a pure Google-centric model to a powerful and fundable hybrid architecture that leverages the **NVIDIA AI stack** for heavy computation, while retaining the existing Google Cloud/Firebase stack for the application layer.

This entire strategy, including the phased migration plan and technology choices, is documented in:
-   `@ai-instructions/architecture.md`

## 2. Current Focus: AI-Powered Onboarding Feature

We have begun implementing the first major feature using this new architecture: a proactive, conversational **Onboarding Agent**. This agent will guide new users through setting up their company, suggesting team structures, and ingesting their business knowledge.

The detailed technical plan and tool mapping for this feature are documented in:
-   `@ai-instructions/user-journey/onboarding.md`

## 3. Implementation Progress: Phase 1 Complete

We have fully completed **Phase 1: UI Foundation & Data Scaffolding** for the Onboarding Agent. The work is committed to the `develop` branch and includes:

-   **Initiation:** The "Welcome" ticket now contains a link to trigger the onboarding flow.
-   **UI Components:** A routable `OnboardingAgentComponent` has been created to act as a "launcher," which in turn opens the `OnboardingAgentDialogComponent` in a Material dialog.
-   **UI Service:** An `OnboardingAgentService` was created to manage the lifecycle of the dialog.
-   **UI Scaffold:** A basic, non-functional chat interface has been implemented within the dialog component.
-   **Data:** "Starter Pack" constants for team and playbook suggestions have been created and are ready for use.

## 4. Next Steps (Previous)

We are currently paused, awaiting user testing and confirmation of the Phase 1 UI scaffold.

Upon your approval, the immediate next step is to begin **Phase 2: Backend Agent & Local Tools**. This involves:

1.  Creating the `onboardingAgent` Firebase Function.
2.  Setting up a basic LangChain agent within that function.
3.  Implementing the first simple tool (`install_starter_pack`).
4.  Connecting the frontend chat UI to this backend function to bring the conversation to life.

## 5. Onboarding Agent: Detailed Chat Flow & Mocking Plan (Previous)

This section details the current conversational flow of the Onboarding Agent and the mocking strategy implemented to facilitate frontend development.

### 5.1. Current Conversational Flow (Frontend Mock)

The `OnboardingService` (`projects/website/src/app/console/onboarding-agent/onboarding.service.ts`) now orchestrates the mock conversation based on `onboardingSteps` and `collectedInfo`.

**Flow Steps:**

1.  **Initial Prompt:**
    *   **Agent:** "Please help me understand the nature of your business. Let me start by asking what your company name?"
    *   **Implementation:** `OnboardingService.getInitialPrompt()` provides this.

2.  **Company Name Collection:**
    *   **User:** Provides company name (e.g., "Acme Corp").
    *   **Agent:** "Thank you for providing your company name: Acme Corp. Now, please tell me, what industry are you in?"
    *   **Timeline Update:** "Company Name: Acme Corp" (Primary Color).

3.  **Industry Collection:**
    *   **User:** Provides industry (e.g., "Tech").
    *   **Agent:** "Great! Based on your industry (Tech), I can suggest a team structure. Would you like me to do that?"
    *   **Timeline Update:** "Industry: Tech" (Primary Color).

4.  **Team Structure Suggestion:**
    *   **User:** Responds to "Would you like me to do that?" (e.g., "Yes").
    *   **Agent:** Presents a mock org chart and asks for confirmation: "Here is a suggested team structure based on your industry. Does this look good? (Yes/No)

CTO
|-Fullstack Developer
|-UX/UI Designer

Total Members: 3"
    *   **Timeline Update:** "Team Structure: Suggested" (Primary Color).

5.  **Team Structure Confirmation:**
    *   **User:** Responds to confirmation (e.g., "Yes").
    *   **Agent:** "Great! Team structure approved. I can also help generate branding assets like logos and banners. Should I proceed?"
    *   **Timeline Update:** "Team Structure: Approved (3 members)" (Primary Color).

6.  **Team Structure Rejection/Skip:**
    *   **User:** Responds "No" to suggestion or confirmation.
    *   **Agent:** "No problem. We can skip the team structure for now. I can also help generate branding assets like logos and banners. Should I proceed?"
    *   **Timeline Update:** "Team Structure: Skipped/Rejected" (Primary Color).

### 5.2. Mocking Strategy

All interactions are currently handled by the `OnboardingService` which provides mock responses. This service is designed to be easily switchable to real API/function calls once the backend is ready.

**Key Components of the Mocking Strategy:**

*   **`OnboardingService` (`projects/website/src/app/console/onboarding-agent/onboarding.service.ts`):**
    *   Maintains the conversation state (`collectedInfo`).
    *   Determines the next question/action based on `collectedInfo`.
    *   Generates mock agent replies and updates `collectedInfo`.
    *   `processMessage` method simulates backend processing with a delay.
    *   `getInitialPrompt` provides the first message.
*   **`OnboardingAgentDialogComponent` (`projects/website/src/app/console/onboarding-agent/dialog/onboarding-agent-dialog/onboarding-agent-dialog.component.ts`):**
    *   Orchestrates the frontend flow.
    *   Receives user messages from `DiscussionsComponent`.
    *   Calls `OnboardingService.processMessage` to get agent's reply and updated state.
    *   Updates the chat display and `progressEvents` (timeline).
    *   Will be responsible for opening specific dialogs (e.g., `LogoPromptComponent`) based on `OnboardingService`'s future `action` responses.
*   **`DiscussionsComponent` (`projects/shared/components/discussions/discussions.component.ts`):**
    *   Purely presentational chat UI.
    *   Emits `messageSubmitted` event with user's message.
    *   Displays messages pushed to its `discussions` array.
    *   Renders custom timeline content provided by the parent.

### 5.3. Next Implementation Steps (UX/UI Focus)

The immediate next steps will focus on implementing the interactive UX/UI elements as outlined in the user journey, using mocks provided by `OnboardingService`.

1.  **Implement Mock for Branding Assets (Logo/Banner):**
    *   **`OnboardingService`:** When the agent asks about branding assets, if the user says "Yes", the service should return a response indicating an action to open the `LogoPromptComponent` dialog.
    *   **`OnboardingAgentDialogComponent`:**
        *   Detect the "openLogoDialog" action.
        *   Open `LogoPromptComponent` using `MatDialog`.
        *   Handle the dialog's `afterClosed()` event to get mock results (e.g., `logoUrl`).
        *   Update `OnboardingService` with the mock result.
        *   Update chat with agent confirmation and timeline.
    *   Repeat for `BannerPromptComponent`.

2.  **Implement Mock for Knowledge Ingestion:**
    *   **`OnboardingService`:** When the agent asks about knowledge ingestion, if the user says "Yes", the service should return a response indicating an action to open a file/link upload dialog.
    *   **`OnboardingAgentDialogComponent`:**
        *   Detect the "openUploadDialog" action.
        *   Open a mock dialog for file/link upload.
        *   Handle the dialog's `afterClosed()` event to get mock results.
        *   Update `OnboardingService` with the mock result.
        *   Update chat with agent confirmation and timeline.

3.  **Implement Mock for Process Discovery & BPMN Generation:**
    *   Similar pattern: `OnboardingService` indicates an action, `OnboardingAgentDialogComponent` opens a mock dialog/component, handles its result, and updates the flow.

---

## 6. Progress Update (As of Oct 18, 2025): UI Pivot & Stepper Implementation

To enhance user experience and reduce implementation complexity, a strategic decision was made to pivot from the initial conversational/chat-based onboarding to a more directive, stepper-based workflow. This ensures a robust and predictable journey for the user.

### 6.1. Implementation Summary

The initial chat-based UI (`DiscussionsComponent`) has been entirely replaced by the new `OnboardingStepperComponent`, which contains the complete, mocked-up user flow.

-   **UI Framework:** The onboarding flow is now built using the Angular Material Stepper.
-   **Team Structure:** The complex CSS-based org chart has been replaced with a functional and editable **Angular Material Tree**. This allows users to click on a team member or role to edit their name and job title directly, providing a much better UX. The mock data has been expanded to include a larger team (CEO, CTO, CMO, COO, and their respective reports) to facilitate testing.
-   **Branding & Knowledge Steps:** These steps have been significantly polished. The UI now features:
    -   Vertically stacked radio button options.
    -   Contextual controls (buttons, inputs) that appear next to each option.
    -   Controls are disabled unless their corresponding radio option is selected.
    -   A "file chip" UI that appears after an asset is generated or uploaded, showing the item's name and a delete icon to reset the state.
-   **Current Status:** The frontend implementation for the onboarding stepper is now complete from a UX/UI and mock-up perspective. All user interactions are handled within the component, ready for backend integration.

## 7. Next Steps: Backend Implementation (Previous)

With the frontend UI approved, the immediate next phase is to replace all mock data and interactions with live calls to a backend powered by Firebase Functions and the NVIDIA stack, as outlined in our architecture.

The high-level tasks are as follows:

1.  **Create the `onboardingAgent` Firebase Function:** This will serve as the primary backend endpoint for the `OnboardingStepperComponent`.

2.  **Implement `generate_team` Tool:**
    *   Replace the `suggestTeam()` mock method in the frontend.
    *   The frontend will call the `onboardingAgent` function with the user's selected industry.
    *   The function will execute a `generate_team` tool which calls a self-hosted **NVIDIA NIM** (e.g., Llama 3) with a prompt to return a JSON object representing the suggested team structure.
    *   The JSON response will be passed back to the frontend to populate the Material Tree.

3.  **Integrate Image Generation:**
    *   Wire up the `LogoPromptComponent` and `BannerPromptComponent`.
    *   These dialogs will call a dedicated Firebase Function (`generateImage`).
    *   This function will act as a secure proxy to the appropriate image generation model endpoint (e.g., another NIM or a third-party API).

4.  **Implement Knowledge Ingestion Backend:**
    *   **File Upload:** Implement the "From File" option to upload documents to a Google Cloud Storage bucket.
    *   **URL Scraping:** Implement the "From Link" option by creating a tool that scrapes and processes content from a given URL.
    -   **Starter Pack:** Implement the `install_starter_pack` tool, which will be a script that copies predefined collections from a template area in Firestore to the user's new company profile.

---

## 8. Onboarding Stepper: Detailed Implementation Plan (Previous)

This section provides a detailed, step-by-step implementation plan for connecting the `OnboardingStepperComponent` to the backend, based on the architecture defined in `@ai-instructions/architecture.md`.

### 8.1. Core Principles & File Paths

- **Firebase Functions as Proxies:** All interactions with the NVIDIA AI backend will be proxied through standard Firebase HTTPS Callable Functions. This decouples the client from the AI layer and keeps all sensitive keys and logic securely on the backend.
- **No Genkit for Orchestration:** The onboarding process will be orchestrated by the client (`OnboardingStepperComponent`). Backend calls will be discrete, single-purpose functions, not a single, overarching Genkit flow.
- **Standardized Paths:** All company-related data will be stored in Firestore and Google Cloud Storage using a standardized path structure derived from the user's profile and the selected company. The `CompanyService` (`@projects/shared/services/company.service.ts`) will be the source of truth for these paths.
  - **Path Structure:** `profiles/{profileId}/companies/{companyId}/`

### 8.2. Data Flow Diagrams by Step

#### **Step 1 & 2: Company Name & Industry**
- **Action:** User provides company name and industry.
- **Flow:**
  ```
  [Angular Client] --(Form Input)--> [Local Component State]
  ```
- **Implementation:** No backend calls. The data is held within the `OnboardingStepperComponent`'s form group state.

---

#### **Step 3: Team Structure Generation**
- **Action:** User clicks "Suggest Team".
- **Flow:**
  ```
  [Angular Client] --(AngularFire: call 'onboarding_generateTeam')--> [Firebase Function: onboarding_generateTeam]
                                                                      |
                                                                      v
                                         [NVIDIA NIM Endpoint: /generate_team] <--(HTTPS API Call)--
  ```
- **Implementation:**
  1.  **Frontend:** The `OnboardingStepperComponent` will call a new Firebase Function named `onboarding_generateTeam`, passing the `industry` from the form.
  2.  **Backend:** A new, standard HTTPS callable function `onboarding_generateTeam` will be created in `functions/src/onboarding/generateTeam.ts`. It will receive the `industry`, make a secure HTTPS call to the NVIDIA NIM endpoint (`/generate_team`), and return the resulting JSON team structure to the client.

---

#### **Step 4: Branding Assets**
- **Action:** User chooses to upload or generate branding assets.
- **Generate Flow:**
  ```
  [Angular Client] --(AngularFire: call 'generateImage')--> [Firebase Genkit Function: generateImage]
  ```
- **Generate Implementation:** This will use the **existing** `generateImage` Genkit flow. The `LogoPromptComponent` and `BannerPromptComponent` already handle this correctly.

- **Upload Flow:**
  ```
  [Angular Client: FileUploaderComponent] --(Firebase SDK)--> [Google Cloud Storage]
  ```
- **Upload Implementation:**
  1.  The `OnboardingStepperComponent` will utilize the existing `@projects/shared/components/file-uploader/` component.
  2.  The `path` for the uploader will be constructed using the `CompanyService` to point to `profiles/{profileId}/companies/{companyId}/assets`.

---

#### **Step 5: Knowledge Ingestion**

- **Action:** User selects an option to provide business knowledge.

- **From File Flow:**
  1.  **Upload:**
      ```
      [Angular Client: FileUploaderComponent] --(Firebase SDK)--> [Google Cloud Storage]
      ```
  2.  **Processing (Asynchronous):**
      ```
      [GCS Trigger: `onKnowledgeFileFinalized`] ---> [Firebase Function: onboarding_processKnowledgeFile]
                                                         |
                                                         v
                                 [NVIDIA Endpoint: /process_document] <--(HTTPS API Call)--
      ```
- **From File Implementation:**
  1.  **Frontend:** The `OnboardingStepperComponent` will again use the `FileUploaderComponent`. The storage path will be `profiles/{profileId}/companies/{companyId}/knowledge`.
  2.  **Backend:** A new Cloud Storage-triggered Firebase Function, `onboarding_processKnowledgeFile`, will be created. It will activate when a file upload is complete (`onFinalize`). This function will then make the call to the NVIDIA endpoint to begin the asynchronous analysis (Process Discovery, BPMN Generation).

- **From Link Flow:**
  ```
  [Angular Client] --(AngularFire: call 'onboarding_scrapeAndProcess')--> [Firebase Function: onboarding_scrapeAndProcess]
                                                                          |
                                                                          v
                                             [NVIDIA Endpoint: /scrape_and_process] <--(HTTPS API Call)--
  ```
- **From Link Implementation:**
  1.  **Frontend:** The client will call a new Firebase Function `onboarding_scrapeAndProcess`, passing the URL from the form.
  2.  **Backend:** This new HTTPS callable function will proxy the request to the NVIDIA endpoint, which will handle both scraping and initiating the asynchronous analysis.

- **Starter Pack Flow:**
  ```
  [Angular Client] --(AngularFire: call 'onboarding_installStarterPack')--> [Firebase Function: onboarding_installStarterPack]
  ```
- **Starter Pack Implementation:**
  1.  **Frontend:** The client will call a new, simple Firebase Function `onboarding_installStarterPack`.
  2.  **Backend:** This HTTPS callable function will contain only Firestore logic to copy the predefined starter pack collections. It will not involve any AI or NVIDIA calls.

## 9. Progress Update (As of Oct 21, 2025): NVIDIA NIM Integration & Frontend Wiring

We have successfully integrated the `OnboardingStepperComponent` with the Firebase Functions backend, which now communicates with a  self-hosted NVIDIA NIM instance. This marks a significant step towards realizing the hybrid AI architecture.

### 9.1. NVIDIA NIM Setup

*   **Instance Selection:** After initial network issues with a GCP-based L4 instance, a more robust **NVIDIA A100 (80GiB) instance** on Brev.dev (running on `massedcompute` in `beltsville-usa-1`) was provisioned. This instance resolved persistent network timeouts encountered during model weight downloads.
*   **Model Deployment:** The **Llama 3.1 8B Instruct NIM container** was successfully deployed on the A100 instance using Docker.
*   **Authentication:** `docker login nvcr.io` with `$oauthtoken` and an NVIDIA API key.
*   **Persistent API Key:** The `NGC_API_KEY` was permanently set in `~/.bashrc` on the Brev instance.
*   **Cache Volume:** The `docker run` command included a volume mount (`-v "$LOCAL_NIM_CACHE:/opt/nim/.cache"`) to cache model weights on the host, ensuring download resilience.
*   **NIM Server:** The model is serving requests via an OpenAI-compatible API on `http://<public_ip>:8000`.

### 9.2. Firebase Functions Backend Integration

The following Firebase Functions were implemented and configured to interact with the NVIDIA NIM:

*   **`functions/src/onboarding/generateTeam.ts`:**
*   **Purpose:** Generates a suggested team structure based on industry.
*   **NIM Integration:** Calls the NVIDIA NIM's `/v1/chat/completions` endpoint.
*   **Payload:** Uses OpenAI Chat Completion API format with a carefully crafted prompt to ensure strict JSON output.
*   **Protocol:** Uses Node.js `http` module to communicate with the NIM server (which is HTTP-only).
*   **Error Handling:** Includes robust JSON parsing with `try...catch` to log raw model responses for debugging.
*   **Status:** Successfully tested end-to-end.

*   **`functions/src/onboarding/scrapeAndProcess.ts`:**
*   **Purpose:** Scrapes and processes content from a given URL.
*   **NIM Integration:** Calls the NVIDIA NIM's `/v1/chat/completions` endpoint.
*   **Payload:** Uses OpenAI Chat Completion API format with a prompt for summarization/extraction.
*   **Protocol:** Uses Node.js `http` module.
*   **Status:** Backend logic implemented, pending end-to-end testing.

*   **`functions/src/onboarding/installStarterPack.ts`:**
*   **Purpose:** Copies predefined Firestore collections.
*   **Status:** Backend logic implemented, pending end-to-end testing.

*   **`functions/src/onboarding/processKnowledgeFile.ts`:**
*   **Purpose:** Cloud Storage-triggered function for knowledge file processing.
*   **Status:** Backend logic implemented, pending end-to-end testing.

**Configuration Details:**

*   **Environment Variables:** `NVIDIA_API_BASE` (e.g., `154.54.100.95:8000`) and `NVIDIA_API_KEY` are loaded from a `.env` file in  the `functions` directory for local emulator testing.
*   **`functions/tsconfig.json`:** Modified to include `"rootDir": "src"` for a cleaner `build/index.js` output structure.
*   **`functions/src/onboarding/index.ts`:** Exports functions with cleaner, camelCase names (e.g., `generateTeam`).
*   **`functions/package.json`:** `"main": "build/index.js"` remains correct with the `rootDir` change.

### 9.3. Frontend Integration (`OnboardingStepperComponent`)

The `projects/website/src/app/console/onboarding-agent/components/onboarding-stepper/onboarding-stepper.component.ts` was updated to integrate with the new Firebase Functions:

*   **Dependencies:** Injected `FunctionsService` (project's custom wrapper for Firebase Functions) and `Auth` service.
*   **`suggestTeam()`:** Now calls the `generateTeam` Firebase Function, processes the JSON response, and populates the Material Tree.
*   **`scrapeAndProcessUrl()`:** Calls the `scrapeAndProcess` Firebase Function.
*   **`installStarterPack()`:** Calls the `installStarterPack` Firebase Function.
*   **File Uploads:**
*   `onFileSelected()` (for knowledge ingestion) was corrected to use the proper storage path ( `profiles/{profileId}/companies/{companyId}/knowledge`).
*   Branding asset upload buttons were replaced with `lib-file-uploader` components, configured with `assetsPath` and `LOGO_MEDIA`/`BANNER_MEDIA`.
*   Conditional rendering (`@if`) was used for `lib-file-uploader` instead of a `[disabled]` input.

## 10. Current Status (As of Oct 22, 2025): Frontend UI Refinements Complete

All planned frontend UI refinements for the `OnboardingStepperComponent` have been completed. This includes:

-   Implementation of specific loading states (`isSuggestingTeam`, `isUploadingKnowledge`, `isScrapingUrl`, `isInstallingPack`).
-   Display of user-friendly error messages (`teamSuggestionError`, `knowledgeUploadError`, `scrapeUrlError`, `installPackError`).
-   Visual success indicators for completed actions.
-   A mechanism to reset knowledge-related states when the user changes options in the knowledge ingestion step.
-   Correction of HTML structural errors (`NG5002`) introduced during previous modifications.

## 11. Next Steps: Data Persistence & Onboarding Finalization

Addressing critical feedback, the immediate next phase will focus on ensuring all collected onboarding data is persistently stored and the user is correctly redirected upon completion.

### 11.1. Backend Implementation: `onboarding_finalizeCompanySetup` Function

1.  **Create New Firebase Function:** A new HTTPS callable Firebase Function, `onboarding_finalizeCompanySetup`, will be created in `functions/src/onboarding/finalizeCompanySetup.ts`.
2.  **Input Data:** This function will receive all consolidated data from the `OnboardingStepperComponent`, including:
    *   `companyName` (from `firstFormGroup`)
    *   `industry` (from `secondFormGroup`)
    *   `teamStructure` (the `dataSource.data` from `thirdFormGroup`)
    *   `logoUrl` and `bannerUrl` (from `fourthFormGroup`)
    *   `knowledgeFileName`, `knowledgeUrl`, or `starterPackInstalled` status (from `fifthFormGroup`)
3.  **Persistence Logic:** The function will be responsible for:
    *   Creating or updating the company document in Firestore (`profiles/{profileId}/companies/{companyId}/`).
    *   Storing the `teamStructure` as a subcollection or a field within the company document.
    *   Saving `logoUrl` and `bannerUrl` references.
    *   Recording the chosen knowledge ingestion method and relevant details (e.g., `knowledgeFileName`, `knowledgeUrl`).
    *   Potentially triggering any final asynchronous processing related to the knowledge base.

### 11.2. Frontend Implementation: Stepper Finalization & Redirection

1.  **Consolidate Data:** In the `OnboardingStepperComponent`, create a method (e.g., `finalizeOnboarding()`) that gathers all relevant data from the component's form groups and state properties.
2.  **Call Finalization Function:** Invoke the new `onboarding_finalizeCompanySetup` Firebase Function, passing the consolidated data.
3.  **Handle Loading/Errors:** Implement loading states and error handling for the finalization process.
4.  **Redirection:** Upon successful finalization, use the Angular Router to redirect the user to the newly created company's landing page (e.g., `/console/company/:companyId/dashboard`).

### 11.3. Prioritization & Verification

Before implementing the finalization step, ensure that the backend logic for all knowledge ingestion options (`scrapeAndProcess`, `installStarterPack`, `processKnowledgeFile`) is fully verified and working end-to-end. This will be a prerequisite for a successful finalization process.

**Tomorrow's Focus:** Begin implementing the `onboarding_finalizeCompanySetup` Firebase Function and the corresponding frontend logic to consolidate and persist data.