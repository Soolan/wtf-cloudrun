# AI Platform: New Hybrid Architecture & Strategy

## 1. Introduction & Strategic Shift

This document outlines the new strategic direction for our AI platform's architecture. The primary goal is to evolve from our initial Google-centric implementation (Angular, Firebase, Genkit) into a more powerful, scalable, and fundable hybrid architecture.

This strategic pivot is catalyzed by our acceptance into the **NVIDIA Inception program**. To align with our business goal of securing funding and leveraging the program's benefits, we are integrating NVIDIA's cutting-edge AI stack. This moves us beyond simple prompt-based GenAI functions toward a true, robust **Agentic AI platform**.

## 2. Core Architectural Principles

-   **Hybrid Cloud Model:** We will maintain our robust and familiar application stack on Google Cloud (Angular, Firebase Functions, Firestore) while offloading the heavy, specialized AI computation to a dedicated inference stack powered by NVIDIA.
-   **Right Tool for the Job:** We will adopt a poly-repo model for AI, using the best model or service for each task to optimize for cost, performance, and capability.
-   **Phased Migration:** The architecture will be evolved iteratively. We will augment and enhance our existing system in phases, not through a disruptive "big bang" rewrite.

## 3. The New Hybrid Technology Stack

Our architecture is split into two primary layers: the Application Layer and the AI Inference Layer.

### Application Layer (Google Cloud)

This layer remains the backbone of the user experience and business logic orchestration.

-   **Frontend:** Angular
-   **Backend-for-Frontend (BFF) & Orchestration:** Firebase Functions
-   **Database & Authentication:** Firestore & Firebase Authentication
-   **File Storage:** Google Cloud Storage

### AI Inference Layer (NVIDIA Stack)

This is the new, specialized "brain" of our platform, running on GPU-enabled servers (e.g., within GCP, paid for by NVIDIA credits).

-   **Deployment Engine:** **NVIDIA Triton™ Inference Server** and **NVIDIA Inference Microservices (NIMs)**. NIMs are pre-built, optimized containers that allow us to deploy open-source or custom models as secure, production-ready endpoints in minutes.
-   **Core Model Logic (The "Brains"):** **NVIDIA NeMo™** will be used to build, customize, and fine-tune generative AI models on our platform-specific data (e.g., training an agent on business process methodologies).
-   **Advanced RAG (The "Knowledge"):** We will build a state-of-the-art RAG pipeline using **NeMo Retriever** models for superior embeddings and run it on a GPU-accelerated vector database for high-speed lookups.
-   **Multimodal Input (The "Ears"):** **NVIDIA Riva** will be used for high-accuracy speech-to-text, allowing users to interact with the platform and generate content using their voice.
-   **Agentic Orchestration:** Frameworks like **LangChain** and **LlamaIndex**, which have deep integration with the NVIDIA stack, will be used to build the complex, multi-step reasoning and tool-use logic that defines a true AI agent.

## 4. Architectural Flow

The interaction between the layers is simple, secure, and scalable. The client is completely decoupled from the AI backend.

`[Angular Client] <--- (via AngularFire) ---> [Firebase Function] <--- (HTTPS API Call) ---> [NVIDIA Endpoint]`

1.  The **Angular Client** makes a request to a familiar Firebase Function (e.g., `clarifyToDo`).
2.  The **Firebase Function** acts as a secure proxy and orchestrator. It holds the necessary API keys and logic.
3.  The function then calls the appropriate backend endpoint—either a self-hosted model on our **NVIDIA NIM** server or a proprietary API like Gemini, depending on the task's requirements.
4.  The result is returned to the Firebase Function, which may perform additional logic (like saving data to Firestore) before sending a final response back to the client.

## 5. The Phased Migration Strategy

We will evolve to this new architecture through a deliberate, four-phase process.

### Phase 1: Augment, Don't Replace
-   **Action:** Deploy our first open-source model (e.g., Llama 3 8B) using a NIM for a high-volume, low-complexity task (like a simple chatbot).
-   **Goal:** Gain familiarity with the NVIDIA deployment workflow and immediately begin leveraging the cost benefits of our cloud credits.

### Phase 2: Implement a Smart Router
-   **Action:** Enhance our Firebase Functions to become intelligent "model routers."
-   **Goal:** Based on the nature of a request, the function will dynamically choose the most appropriate backend: a cost-effective self-hosted NIM for standard tasks, or a powerful proprietary API (like Gemini 1.5 Pro) for complex reasoning.

### Phase 3: Advanced Customization with NeMo
-   **Action:** Use NVIDIA NeMo to fine-tune models on our unique datasets (e.g., playbooks, business process examples).
-   **Goal:** Create highly specialized, custom models that form a defensible intellectual property moat for our platform.

### Phase 4: The Edge & Hybrid AI Future
-   **Action:** For mature, well-defined business domains, we will train and deploy Small Language Models (SLMs) to run directly on the user's device (in the browser).
-   **Goal:** Create a sophisticated, three-tiered AI system (On-Device SLMs, Self-Hosted LLMs, and State-of-the-Art APIs) that optimizes for cost, privacy, and performance, solidifying our long-term vision for a scalable and profitable platform.
