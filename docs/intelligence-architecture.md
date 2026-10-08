# Aeros — Aviation Operational Intelligence Architecture

## North star

Aeros is not another scheduler and it is not a chat layer over aviation documents.

**Aeros is the intelligence and execution layer for aviation operations.**

It connects the systems an operator already uses, maintains a live model of every mission and its dependencies, detects material changes, reasons across specialist domains, simulates recovery plans, routes required approvals, executes permitted actions, and learns from outcomes.

The initial wedge is **disruption recovery for small aviation operators**. The architecture must be narrow enough to ship that workflow quickly while broad enough that the same primitives can expand into dispatch, scheduling, training, safety, maintenance, fleet planning, finance and larger commercial operations.

---

## Competitive floor

Aeros should treat the combined capabilities of the following categories as the baseline, not the destination:

- flight-specific operational intelligence across weather, NOTAMs, procedures and operator constraints,
- scheduling, dispatch, aircraft, people, maintenance and training systems,
- pilot/EFB and post-flight/FDM workflows,
- operator reporting and business workflows.

The product differentiation is the layer **above** those systems:

1. understand the whole operation,
2. identify causal impact when something changes,
3. simulate counterfactual plans,
4. optimize across competing constraints,
5. execute approved actions,
6. maintain an auditable history of why every conclusion and action happened.

---

## 1. Mission is the core operating unit

The foundational Aeros object is a **Mission**, not a page, alert, document or generic flight row.

A mission can represent:

- training flight,
- aircraft rental,
- helicopter tour,
- Part 135 charter leg,
- ferry/positioning flight,
- maintenance reposition,
- commercial sector.

A mission can connect to:

- aircraft,
- crew / instructor / student / customer,
- departure / destination / alternates,
- route / procedures / airspace,
- weather,
- NOTAMs,
- aircraft limitations,
- maintenance / squawks / MEL/CDL,
- fuel / performance / W&B,
- qualification / currency / duty,
- training objective,
- operator policy / SOP / minima,
- reservation / schedule,
- payment / billing consequences,
- telemetry / FDM,
- safety reports,
- downstream missions.

This lets one intelligence substrate power flight schools today and progressively more complex operators later.

---

## 2. Temporal operational graph

Aeros should model the organization as a temporal graph rather than a collection of unrelated tables.

Core node types:

- Organization
- Mission
- Flight
- Aircraft
- Person
- Airport
- Runway
- Procedure
- Weather product
- NOTAM
- Maintenance item
- Training record
- Reservation
- Document / policy revision
- Invoice / economic event

Core relationships include:

- mission USES aircraft,
- person ASSIGNED_TO mission,
- mission DEPARTS_FROM airport,
- mission ARRIVES_AT airport,
- mission DEPENDS_ON procedure,
- NOTAM AFFECTS runway/procedure/airport,
- weather AFFECTS mission window,
- aircraft HAS maintenance item,
- student REQUIRES lesson/task,
- reservation PRECEDES / FOLLOWS another reservation,
- rule APPLIES_TO mission/operator/aircraft,
- decision CHANGES mission/resource/schedule.

Every relevant edge and fact should be time-aware.

### Why temporal state matters

Aeros must be able to answer:

> What did the system know at 18:44Z, what changed, which missions were affected, and why did Aeros recommend option B?

Every source update, user change, specialist claim, decision, approval and action becomes an immutable event.

See `types/operational-graph.ts`.

---

## 3. Event + provenance fabric

External systems and users publish normalized events.

Examples:

- WEATHER_UPDATED
- TAF_CHANGED
- NOTAM_CREATED
- NOTAM_CANCELLED
- POSITION_UPDATED
- RESERVATION_CHANGED
- AIRCRAFT_STATUS_CHANGED
- SQUAWK_UPDATED
- MAINTENANCE_UPDATED
- CREW_CHANGED
- STUDENT_PROGRESS_UPDATED
- POLICY_REVISION_PUBLISHED
- MISSION_TIMING_CHANGED
- ACTION_APPROVED
- ACTION_COMPLETED

Each event carries:

- source provider,
- external/source ID,
- source timestamp,
- ingestion timestamp,
- effective window,
- revision/version,
- affected entity IDs,
- correlation ID.

This gives Aeros deterministic change detection, replayability and an audit trail.

---

## 4. Operational twins

The graph produces several derived digital twins.

### Mission Twin
The complete current state for one mission and every constraint that can affect it.

### Fleet Twin
Availability, maintenance state, utilization, capability and downstream commitments for aircraft.

### Pilot / Crew Twin
Availability, qualification, currency, duty/rest, assignments and operator-specific constraints.

### Training Twin
Student progress, lesson requirements, instructor requirements, eligible aircraft and progression priority.

### Organization Twin
Schedule, resources, risk concentration, disruptions, revenue/utilization impact and operating constraints across the operator.

The first implementation should focus on Mission Twin + enough Fleet/Person/Schedule context to support disruption recovery.

---

## 5. Agent blackboard, not agent chat

Specialist agents do **not** pass paragraphs back and forth.

They publish typed `OperationalClaim` objects into a shared blackboard.

A claim includes:

- subject,
- predicate,
- value,
- severity,
- confidence,
- validity window,
- dependencies,
- evidence,
- asserting agent,
- supersession/retraction status.

Example:

```json
{
  "subject": { "type": "mission", "id": "GT-204" },
  "predicate": "DESTINATION_FLIGHT_CATEGORY",
  "value": "IFR",
  "severity": "MEDIUM",
  "confidence": 1,
  "assertedBy": "weather-agent",
  "dependencies": ["weather.metar", "mission.eta"],
  "evidence": ["METAR:KCHA:..." ]
}
```

Agents subscribe to events/claims relevant to their domain and publish new claims only when affected.

Implemented foundation:

- `lib/agents/blackboard.ts`
- `lib/agents/weather-agent.ts`
- `types/operational-graph.ts`

### Planned specialist services

#### Weather Intelligence
METAR, TAF, PIREP/AIREP, SIGMET, G-AIRMET, CWA, convective products, forecast windows.

#### Flight Intelligence
Route, timing, current position, alternates, airport/runway state, procedure dependencies.

#### Aeronautical / Airspace Intelligence
NOTAMs, TFRs, airspace, AIP/NASR/CIFP, navaid/procedure impacts.

#### Aircraft Performance Intelligence
Aircraft type/tail limitations, runway performance, winds, W&B, fuel/endurance calculations.

#### Airworthiness Intelligence
Maintenance status, squawks, inspections, MEL/CDL and operational restrictions.

#### Crew Intelligence
Availability, qualification, currency, duty/rest, instructor eligibility.

#### Training Intelligence
Student progress, syllabus/lesson requirements, instructor/aircraft compatibility, progression priority.

#### Policy Intelligence
Operator SOPs, OpsSpecs, company minima, manuals and regulatory source retrieval.

#### Safety Intelligence
FRAT, hazard history, FDM findings, SMS context and risk escalation.

#### Resource Scheduler
Aircraft/instructor/student/facility feasibility and allocation.

#### Disruption Recovery
Counterfactual generation, downstream impact and recovery-plan construction.

#### Maintenance Planner
Upcoming inspections, projected utilization, downtime and maintenance-slot planning.

#### Finance / Operations Intelligence
Utilization, cancellations, revenue/customer impact and recovery economics.

#### Communications
Human-approved pilot, instructor, customer, dispatch and maintenance messages.

#### Verifier
Independent review of high-impact claims/options, missing evidence and agent disagreement.

---

## 6. Models are not the source of truth

Aeros should use different computation for different problems.

### Reasoning models
Cross-domain synthesis, option explanation, ambiguous document interpretation and operator-facing interaction.

### Extraction models
Convert NOTAM text, manuals, SOPs, MELs and other documents into versioned structured facts.

### Deterministic engines
- time-window evaluation,
- unit conversion,
- fuel/performance math,
- W&B,
- runway calculations,
- currency/duty calculations,
- maintenance due logic,
- qualification checks.

### Constraint solver
Determine whether a candidate plan is feasible under hard constraints.

### Optimization engine
Rank/optimize schedule recovery across multiple resources and downstream missions.

### Time-series / anomaly models
Post-flight/FDM event detection, aircraft-health signals and operating patterns.

### Ranking / risk models
Learn which feasible options operators select and how outcomes compare.

The LLM must never be asked to substitute for data or deterministic calculation that Aeros can retrieve/compute directly.

---

## 7. Counterfactual engine

The most important product behavior beyond detection is **simulation**.

A user or agent can propose a change:

- delay 45 minutes,
- swap aircraft,
- choose another alternate,
- reassign instructor,
- change route,
- move a maintenance slot,
- cancel one mission to protect five others.

Aeros forks the relevant twin state, applies the hypothetical event, reruns only affected claims/engines, and returns the delta.

Every option should show:

- feasibility,
- risk,
- hard blockers,
- requirements,
- schedule impact,
- crew/training impact,
- aircraft/maintenance impact,
- weather/procedure impact,
- fuel/performance impact,
- customer/economic impact when available,
- supporting evidence,
- confidence / unresolved questions.

The first wedge only needs a subset of these dimensions, but the API contracts should support the full shape.

---

## 8. Recovery optimizer

The first flagship workflow:

```text
Operational event
    ↓
Affected mission(s) identified
    ↓
Specialist claims recomputed
    ↓
Hard constraints compiled
    ↓
Candidate recoveries generated
    ↓
Counterfactual twins evaluated
    ↓
Feasible plans ranked
    ↓
Aeros proposes recovery
    ↓
Human approval where required
    ↓
Actions executed / handed off
    ↓
Outcome monitored
```

Example:

```text
New TAF makes Mission 142 low-margin
→ alternate/fuel impact changes
→ next reservation is exposed
→ candidate aircraft swap checked
→ student not qualified for aircraft B
→ aircraft C is feasible but maintenance margin tight
→ delay 42 minutes is lowest-disruption option
→ propose downstream reservation shift
→ operator approves
→ notify affected people / write to connected system when permitted
```

This workflow creates the bridge from Skymerse-style intelligence to Pilotbase/FSP-style operating workflows.

---

## 9. Execution engine + authority boundaries

Aeros should become a system of action, but not by silently assuming regulated human authority.

Every action has:

- originating decision,
- target entity/system,
- payload,
- approval requirement,
- required role,
- reversible flag,
- execution status,
- error/result,
- audit timestamps.

Action examples:

- update reservation,
- delay mission,
- swap aircraft,
- reassign instructor/crew,
- change alternate/route proposal,
- create maintenance task,
- notify person,
- request PIC/dispatcher/maintenance review.

Authority boundaries must be explicit for:

- PIC decisions,
- dispatch release where applicable,
- maintenance return-to-service/signoff,
- regulatory/legal interpretation,
- operator-specific approvals.

---

## 10. Integration fabric

See `lib/integrations/catalog.ts` and `/api/integrations`.

### Live now

#### AviationWeather.gov
Current implementation:
- METAR
- TAF
- initial SIGMET/AIRMET ingestion

Next weather work:
- PIREP/AIREP,
- G-AIRMET,
- CWA,
- route/geometry filtering,
- forecast-window parsing,
- material-change detection.

#### ADS-B / OpenSky
Current repository route supplies aircraft state vectors with an optional FlightTrackerPro source and simulation fallback. It needs to be generalized from KPDK-centric traffic to mission/fleet-specific tracking.

### Adapter ready

#### Pilotbase / Flight Schedule Pro
`lib/integrations/flight-schedule-pro.ts`

Uses server-side API key authentication with operator ID and `x-subscription-key`.

Initial resources:
- aircraft,
- instructors/people,
- reservations,
- aircraft maintenance reminders,
- squawks,
- flights/reporting,
- student progress,
- training sessions.

The adapter is intentionally read-oriented first. Aeros can ingest state immediately and route writes through approved system capabilities/human handoff until a supported write path exists.

### Planned authoritative sources

#### FAA NASR
Airports, runways, airspace, frequencies, navaids, fixes and route data.

#### FAA CIFP
ARINC 424-coded airports, runways, waypoints, airways, DPs, STARs and instrument approaches.

#### FAA NOTAM Management Service
Authoritative NOTAM integration after production/API access onboarding. Normalize by entity and effective window; never use model memory as current NOTAM truth.

#### Operator knowledge base
Versioned document retrieval for SOP, OpsSpecs, company minima, MEL/CDL, manuals, checklists and safety policy.

#### Avionics / FDM
Track logs, flight parameters, exceedances, debrief context and maintenance signals.

#### Communications
SMS/email/notification execution with approvals and audit trail.

---

## 11. Data ownership strategy

Aeros does not need to replace operator systems on day one.

### Phase 1 — Embrace
Read existing schedule/fleet/training/maintenance systems and add external operational data.

### Phase 2 — Augment
Operators increasingly make decisions in Aeros while source systems remain systems of record.

### Phase 3 — Execute
Aeros owns recovery workflows, approvals, notifications and supported writes.

### Phase 4 — Replace selectively
As operators spend more workflow time in Aeros, native scheduling, training, maintenance and other records can move into Aeros where strategically useful.

This is more capital-efficient than rebuilding every incumbent module before intelligence is useful.

---

## 12. Product surfaces

### Command Center
Organization-wide mission health and material-change queue.

### Mission View
Complete mission twin, evidence, claims, constraints, options and timeline.

### Recovery Workspace
Compare counterfactual plans across the whole schedule.

### Dispatch
Readiness, approvals, monitoring and closeout.

### Fleet / Maintenance
Aircraft readiness, utilization, squawks, inspection margins and planning.

### Training
Student progression, lesson compatibility and schedule optimization.

### Safety
FRAT, operational hazards, FDM findings, SMS workflows.

### Ask Aeros
Natural-language interface over the exact operational state—not a separate chatbot context.

### Evidence Drawer
Source, revision, timestamp, raw evidence and dependency chain for every material conclusion.

---

## 13. Current vertical slice

`POST /api/intelligence`

Current flow:

1. normalize mission input,
2. retrieve live weather,
3. build typed `FlightContext`,
4. run the specialist agent mesh,
5. Weather Intelligence publishes typed claims,
6. synthesize context + claims with structured model output when an OpenAI key is configured,
7. return context + mesh + analysis for direct UI rendering.

Without an OpenAI key, Aeros still returns live data and specialist claims.

This is the correct behavior: **models enhance the intelligence layer but do not own the source-of-truth pipeline.**

---

## 14. Immediate build sequence

### Milestone A — world-class disruption demo
- real mission imported from source schedule,
- live weather + airport context,
- material change detector,
- weather/flight/aircraft/training claims,
- downstream dependency traversal,
- 3 recovery options,
- approval screen,
- simulated or supported execution,
- audit timeline.

### Milestone B — operator knowledge
- document ingestion,
- revision metadata,
- policy retrieval,
- policy claims,
- exact citation/evidence UI.

### Milestone C — recovery solver
- hard-constraint representation,
- resource feasibility,
- counterfactual forks,
- downstream schedule scoring,
- ranked recovery plans.

### Milestone D — continuous operation
- event ingestion workers,
- claim invalidation/recomputation,
- material-change thresholding,
- proactive notification,
- persistent decision/outcome store.

### Milestone E — learning loop
- operator decisions captured,
- outcomes measured,
- ranking tuned,
- FDM/post-flight signals fed back into fleet/training/safety context.

---

## 15. Safety, reliability and evaluation

Aeros must be built as auditable operational decision support from day one.

Required principles:

- no invented live data,
- explicit source provenance,
- source/effective timestamps,
- model output separated from deterministic calculation,
- missing-data state is first class,
- high-impact decisions require verification/human approval,
- agent disagreement is surfaced rather than hidden,
- rules/documents always include revision/effective date,
- event and decision history is immutable,
- model and prompt/policy versions recorded with decisions.

Evaluation suites should cover:

- weather-change detection,
- temporal validity,
- NOTAM entity matching,
- policy retrieval accuracy,
- constraint correctness,
- missed blockers,
- false blockers,
- recovery feasibility,
- schedule impact accuracy,
- evidence completeness,
- hallucination rate,
- operator acceptance of ranked options.

---

## The long-term product

The end state is not “AI for a flight.”

Aeros understands how an operational change propagates through:

```text
weather / NOTAM / aircraft / policy
        ↓
mission
        ↓
crew / student / training / fuel
        ↓
schedule
        ↓
maintenance / downstream missions
        ↓
customer / utilization / economics
        ↓
recovery decision
        ↓
approved action
        ↓
outcome and learning
```

That is the operating layer: **understand → simulate → optimize → act → learn.**
