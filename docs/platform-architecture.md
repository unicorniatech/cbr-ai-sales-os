# AI Sales OS Architecture

This product is designed as a multi-tenant AI sales platform.

CBR is the first tenant, not the whole system.

## Core Concepts

- `tenant`: a realtor, developer, architect, construction company, bank, or partner.
- `project`: a real estate or construction offer owned by a tenant.
- `agent`: the branded AI salesperson for a tenant or project.
- `knowledge_base`: tenant/project-specific answers and sales context.
- `lead`: a captured prospect with score, temperature, source, stage, and next action.
- `conversation`: messages between visitor, AI agent, and later human operators.
- `payment`: reservation, intro fee, savings contribution, or monthly payment.
- `buyer_portal`: the client-side experience where a buyer saves, learns, plans, pays, and tracks progress toward land and home ownership.
- `construction_profile`: optional developer or architect variables for house designs, material tiers, budget ranges, and build paths.

## First Tenant

Tenant ID: `cbr`

Brand:
Grupo Inmobiliario Castrejón Rodríguez

Agent:
Asesor IA CBR

Project:
Cumbres de Bendición

## Planned Supabase Tables

- `tenants`
- `tenant_settings`
- `agents`
- `projects`
- `properties`
- `knowledge_items`
- `leads`
- `lead_events`
- `conversations`
- `messages`
- `tasks`
- `payments`
- `buyer_profiles`
- `documents`
- `savings_goals`
- `construction_options`
- `design_concepts`
- `education_modules`
- `gamification_events`

Every table that stores customer data should include `tenant_id`.

## Planned Agent Tools

- `capture_lead`
- `qualify_lead`
- `score_lead`
- `enrich_lead`
- `create_follow_up_task`
- `send_whatsapp_handoff`
- `create_intro_payment`
- `record_payment_event`
- `retrieve_project_knowledge`
- `validate_property_readiness`
- `recommend_savings_plan`
- `suggest_construction_path`
- `unlock_buyer_milestone`

## Current Agent Runtime

The public advisor widget calls `POST /api/agent/chat`. That route uses the active tenant configuration as the initial knowledge base and returns structured JSON for the chat reply plus UI actions such as lead capture, calculator display, or WhatsApp handoff.

Required environment variables:

- `OPENAI_API_KEY`: server-only OpenAI API key.
- `OPENAI_AGENT_MODEL`: optional model override. Defaults to `gpt-5-mini`.
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL for lead persistence.
- `SUPABASE_SERVICE_ROLE_KEY`: server-only Supabase key for API routes.

If the key is missing, the widget keeps working with the local fallback knowledge responses.

Lead capture now posts to `POST /api/leads`. The admin dashboard reads `GET /api/admin/leads`. Both routes gracefully fall back when Supabase is not configured. Initial SQL is in `docs/supabase-schema.sql`.

## Product Direction

The public website can change per client, but the engine underneath should remain shared:

- branded landing page
- embeddable AI sales widget
- tenant admin dashboard
- buyer portal
- reporting
- payment and savings program
- WhatsApp human handoff

## Buyer Product Direction

The buyer experience should feel like a guided path toward ownership, not a one-time purchase. Many buyers cannot give a large amount at once, but can commit through smaller subscription-like payments, savings goals, education, reminders, and visible progress.

The platform should help buyers:

- understand whether a terrain can be bought safely
- save toward an intro fee, reservation, monthly payment, or construction goal
- learn what documents and risks matter before buying
- compare future construction paths by budget, material type, and developer options
- receive AI guidance that keeps them involved and motivated
- unlock progress milestones that make the journey feel rewarding

For agencies, the product remains a sales operating system: more qualified leads, automated nurturing, AI salesperson, admin dashboard, WhatsApp handoff, and clearer reporting.
