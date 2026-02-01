# 📌 Business Gap Finder – Agentic AI Decision Intelligence Platform

##  Problem Statement
Organizations rely on dashboards and static reports, but decision-making is still manual, slow, and reactive. Early business opportunities and risks remain hidden across fragmented data such as location density, existing businesses, and infrastructure access.

The goal is to build an intelligent system that can observe data, analyze trends, simulate decisions, and recommend actions—moving toward autonomous, agent-driven business decision-making.

---

User (Dashboard / Chatbot)
        ↓
Frontend (Next.js + Tailwind)
        ↓
API Layer (Next.js API Routes)
        ↓
Data Sources
• OpenStreetMap (Places)
• Geocoding API
• Logistics & Road Data
        ↓
Analysis Engine
• Gap Score Calculator
• Trend Analyzer
• Rule-based Decision Logic
        ↓
Decision Output
• Opportunity Ranking
• Recommendations
• Confidence Scores
• Chatbot Explanations


##  Tech Stack
**Frontend**
- Next.js (App Router)
- TypeScript
- Tailwind CSS

**Backend / APIs**
- Next.js API Routes
- REST APIs

**Data Sources**
- OpenStreetMap (business & places data)
- Geocoding services
- Road and logistics indicators

**Visualization**
- Chart.js / Recharts (trend visualization)

**Deployment**
- Vercel

**Version Control**
- GitHub

---

##  Setup Instructions
```bash
git clone <repository-url>
npm install
npm run dev

http://localhost:3000

AI Tools Used

Current implementation uses rule-based AI logic:

Demand vs supply gap analysis

Area density scoring

Logistics and accessibility scoring

Deterministic recommendation engine

The architecture is designed to support future integration of LLM-based agents such as GPT, Gemini, or Claude.

Prompt Strategy Summary

The chatbot currently follows a deterministic, prompt-style intent classification system.

Supported Intents

Business comparison

Location comparison

Opportunity discovery

Recommendation explanation

Strategy

Normalize user input

Identify intent keywords

Map intent to predefined response templates

Generate explanation-style responses with confidence indicators

Source Code Structure

app/analyze – Business gap analysis dashboard

app/api – Data fetching and processing routes

app/demo – Demo and presentation layer

app/layout.tsx – Global layout

app/globals.css – Global styling

tailwind.config.ts – UI configuration

Complete source code with commit history is available in this repository

Final Output

The system delivers:

Ranked business opportunities (e.g., Gym, Café)

Confidence scores (0–100)

Trend visualization dashboard

Chatbot explanations for recommendations

Human-in-the-loop decision support

Outputs are accessible through the dashboard UI and chatbot interface
Build Reproducibility Instructions (Mandatory)

To reproduce the project:

Install Node.js (version 18 or higher)

Clone the repository

Run npm install

Run npm run dev

No paid APIs or environment variables required

Prompt Template Used and Prompts Used

Prompt Template Used
The system follows a single generic prompt template designed to simulate an AI-powered business decision assistant.

The template assumes the role of an assistant that receives location details, business density information, accessibility indicators, and user intent. The assistant analyzes demand versus supply, identifies underserved business categories, compares locations or business types when requested, and provides recommendations with reasoning and a confidence score between 0 and 100.

The responses are designed to be concise, explainable, decision-focused, and suitable for human review and approval.

⸻

Prompts Used During Development

Business Opportunity Identification
What business opportunities are missing in this area?
Suggest top underserved business categories for this location.

Location Comparison
Compare location A versus location B for business potential.
Which location is better to start a new business and why?

Business Type Comparison
Compare gym versus cafe in this area.
Which business has higher demand and lower competition here?

Decision Explanation
Why is this business recommended for this location?
Explain the reasoning behind the confidence score.

Risk and Feasibility Analysis
Is this business feasible based on existing competition?
What risks should be considered before starting this business here?

⸻

Additional Notes
The prompts were implemented using rule-based decision logic to simulate AI reasoning due to hackathon time constraints. The system architecture is prompt-ready and can be directly integrated with large language models such as GPT, Gemini, or Claude without structural changes. The prompt design ensures explainability, transparency, and human-in-the-loop governance.
