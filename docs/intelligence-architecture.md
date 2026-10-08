# Aeros Intelligence v0

## Goal

Turn Aeros from a dashboard backed by mock data into a flight-specific operational intelligence system that continuously combines live aviation data, operator context, aircraft/crew state, and evidence-backed AI analysis.

Aeros should outperform passive briefing tools by answering: **what changed, what does it mean for this flight, and what are the best operational options now?**

## Shared flight state

All agents operate on the same typed `FlightContext` (`types/flight-context.ts`). Agents do not pass free-form chat messages to one another. They return typed findings and evidence that can be stored, compared, rendered, and re-evaluated.

Core state:

- flight / route / ETA
- departure, destination, alternates
- live weather
- aircraft / MEL / fuel context
- crew / duty / currency context
- operator procedures and constraints
- regulatory references
- operational findings
- evidence and confidence

## Agent topology

### Orchestrator

Owns the complete flight state and produces the final operational assessment and option set. It must not invent missing constraints and must explicitly call out missing information.

### Weather agent

Inputs:
- METAR
- TAF
- SIGMET / G-AIRMET
- PIREP / AIREP
- future radar / convective products

Outputs:
- departure/destination/alternate impacts
- route hazards
- time-window changes
- confidence + evidence

### Flight agent

Inputs:
- route
- ETA/ETD
- airport data
- alternates
- aircraft position / ADS-B

Outputs:
- route viability observations
- alternate candidates
- timing implications

### Rules agent

Inputs:
- FAA references
- operator SOPs / OpsSpecs
- company minima
- MEL/CDL references

Outputs:
- applicable constraints
- requirements
- citations
- unresolved legal/operational questions

### Aircraft agent

Inputs:
- aircraft type/tail
- fuel
- MEL/CDL
- maintenance status
- aircraft limitations

### Crew agent

Inputs:
- duty time
- qualifications
- currency
- operator crew rules

### Options agent / orchestrator synthesis

Produces comparable operational options (continue, delay, reroute, divert, change alternate, add fuel, swap aircraft, etc.) with blockers, requirements, tradeoffs, evidence, confidence, and risk.

## Data integrations

### Implemented in v0

**AviationWeather.gov Data API**
- METAR
- TAF
- initial SIGMET/AIRMET feed

Server-side access is required because the API does not permit browser CORS. Keep requests scoped and cached; official guidance limits clients to 100 requests/minute.

**OpenSky / existing ADS-B route**
- the repository already contains `/api/adsb` with OpenSky fallback and a FlightTrackerPro hook. This should later be generalized from the current KPDK-centered implementation into flight-specific position/context.

### Next integrations

1. **FAA / NOTAM source**
   - ingest authoritative NOTAM data through an approved FAA/API source.
   - normalize by airport, runway, navaid, procedure and effective time.
   - never rely on LLM memory for NOTAM state.

2. **FAA aeronautical data / airport/runway information**
   - runway dimensions
   - declared distances
   - airport metadata
   - navaids / fixes / procedure references where licensing permits.

3. **Operator documents**
   - SOPs
   - OpsSpecs
   - company minima
   - MEL/CDL
   - aircraft/operations manuals

   Documents should be chunked with metadata (operator, aircraft type, section, revision, effective date) and retrieved per-flight. The model should cite exact retrieved evidence.

4. **Aircraft / fleet systems**
   - tail status
   - MELs
   - fuel state
   - maintenance events

5. **Crew systems**
   - duty / rest
   - assignments
   - qualification / currency

## Model layer

Use OpenAI Responses API with Structured Outputs. The initial orchestrator defaults to `gpt-6.1-sol` through `AEROS_MODEL` and can be changed without touching business logic.

The model is not the source of truth. Source-of-truth data must come from APIs, operator documents, and structured internal state.

Every material model conclusion should include evidence where evidence exists. Missing facts should reduce confidence and be surfaced explicitly rather than guessed.

## API

`POST /api/intelligence`

Example request:

```json
{
  "flightId": "GT-204",
  "departure": "KPDK",
  "destination": "KCHA",
  "alternates": ["KRMG"],
  "plannedDeparture": "2026-10-08T18:00:00Z",
  "aircraft": {
    "tailNumber": "N731GT",
    "type": "C172"
  }
}
```

The endpoint:

1. normalizes the flight input,
2. retrieves live weather,
3. builds the shared `FlightContext`,
4. runs Aeros operational analysis when `OPENAI_API_KEY` is available,
5. returns context + structured analysis suitable for direct dashboard rendering.

Without an OpenAI key, the endpoint still returns live normalized aviation context in `data-only` mode.

## Event-driven direction

The eventual architecture should rerun only affected agents when a state event arrives:

- new METAR / TAF
- new NOTAM
- route change
- ETA/ETD change
- aircraft status change
- MEL change
- crew/duty change
- airport/runway state change

Then compare the new analysis with the previous snapshot and surface only material changes.

## Guardrails

Aeros is operational decision support. It must not silently replace required PIC, dispatcher, maintenance-control, or regulatory authority.

- no invented weather or constraints
- no uncited legal conclusion when authoritative context is absent
- show data timestamps and source provenance
- distinguish observation from inference
- retain an audit trail of input context, agent findings, model version, and final option set
- model confidence must decline when required data is missing
