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

## Current Agent Runtime

The public advisor widget calls `POST /api/agent/chat`. That route uses the active tenant configuration as the initial knowledge base and returns structured JSON for the chat reply plus UI actions such as lead capture, calculator display, or WhatsApp handoff.

Required environment variables:

- `OPENAI_API_KEY`: server-only OpenAI API key.
- `OPENAI_AGENT_MODEL`: optional model override. Defaults to `gpt-5-mini`.

If the key is missing, the widget keeps working with the local fallback knowledge responses.

## Product Direction

The public website can change per client, but the engine underneath should remain shared:

- branded landing page
- embeddable AI sales widget
- tenant admin dashboard
- buyer portal
- reporting
- payment and savings program
- WhatsApp human handoff
