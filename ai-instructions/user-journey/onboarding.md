# AI-Powered User Onboarding Journey

This document maps the technical implementation of the proactive, AI-driven user onboarding experience to our new hybrid architecture.

## The Proactive Onboarding Agent Flow

Instead of a static wizard, the user engages in a conversation with an "Onboarding Agent." The agent's goal is to intelligently set up the user's company with minimal friction, provide immediate value, and showcase the platform's AI capabilities.

1.  **Initiation:** The user starts the agent from the "Welcome" ticket.
2.  **Conversation & Discovery:** The agent converses to gather the company name and industry.
3.  **Proactive Suggestions:** Based on the industry, the agent proactively suggests a team structure and offers to generate branding assets (logos/banners).
4.  **Knowledge Ingestion:** The agent asks for existing business documents (files, URLs, videos) to analyze.
5.  **Automated Analysis & Creation:** If documents are provided, the agent performs process discovery, creates BPMN diagrams, and offers to build automated workflows.
6.  **Starter Packs:** If no documents are provided, the agent offers to install a pre-built, industry-specific "Starter Pack" containing playbooks, processes, and workflows.
7.  **Completion:** The agent summarizes its actions and guides the user to their newly configured company assets.

## Tool & Technology Mapping

This table details which technologies from our hybrid stack will be used to power each step of the onboarding journey.

| Feature/Step | Goal | Primary Tools & Implementation |
| :--- | :--- | :--- |
| **1. The Onboarding Agent (The Conductor)** | Manage the entire conversational onboarding flow, ask questions, and decide which tools to call. | **Orchestration:** **LangChain** will be used to create the agent, manage conversation history, and handle tool-calling logic.<br>**LLM:** A self-hosted **NVIDIA NIM** (e.g., Llama 3 8B) will power the conversation. It's cost-effective for this structured chat. |
| **2. AI-Powered Team Generation** | Intelligently suggest and create a team structure based on the user's industry and plan. | **Tool:** A LangChain tool named `generate_team`.<br>**LLM:** The Onboarding Agent's NIM will be prompted to return a JSON object defining the team structure. The tool then executes the Firestore writes. |
| **3. Multimodal Knowledge Ingestion** | Ingest and understand user-provided documents, links, or videos. | **Tool:** A LangChain tool named `ingest_source`.<br>**Logic:**<br>- **Text/URL:** Standard web scraping.<br>- **Audio/Video:** **NVIDIA Riva** for high-accuracy speech-to-text transcription. |
| **4. Process Discovery & BPMN Generation** | Analyze ingested content to identify business processes and create BPMN diagrams. | **Tool:** A LangChain tool named `discover_and_map_processes`.<br>**LLM (Discovery):** This is a high-reasoning task. We'll use our **Smart Router** to call the **Gemini 1.5 Pro API** for its large context window and analytical power. (Long-term: This will be a custom **NVIDIA NeMo** model).<br>**LLM (BPMN):** The structured process output will be fed to a smaller, self-hosted **NIM** with a specific prompt to generate the BPMN XML. |
| **5. Automated Workflow Suggestion** | Proactively offer to create a BPA workflow based on a discovered process. | **Tool:** A LangChain tool named `generate_workflow_from_bpmn`.<br>**LLM:** This is a complex creative task. The **Smart Router** will call the **Gemini 1.5 Pro API** to convert a BPMN structure into our BPA workflow JSON format. |
| **6. Starter Pack Implementation** | Install pre-built Playbooks, Processes, and Workflows for users without existing documents. | **Tool:** A LangChain tool named `install_starter_pack`.<br>**Logic:** This is a non-AI task. The tool simply executes a script to copy predefined Firestore collections to the user's company, saving AI tokens. |
