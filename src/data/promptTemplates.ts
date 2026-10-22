import { PromptTemplate } from '../types.ts';

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: 'code-review',
    category: 'Coding',
    title: 'Senior Code Review & Optimization',
    description: 'Deep architectural and efficiency analysis of provided code.',
    prompt: `Please perform a thorough senior-level code review on the following snippet. Analyze:
1. Time and space algorithmic complexity
2. Edge cases and potential race conditions
3. Type safety, security vulnerabilities, or resource leaks
4. Specific refactoring suggestions with improved, production-ready code blocks.`
  },
  {
    id: 'system-architecture',
    category: 'Architecture',
    title: 'Distributed System Design',
    description: 'Design a resilient, scalable backend architecture for high throughput.',
    prompt: `Help me architect a scalable distributed system for a high-concurrency scenario. Please outline:
- Core service boundaries and communication protocols (gRPC, REST, Kafka)
- Data persistence strategy (relational vs document vs cache tiers)
- Partitioning, fault tolerance, and consensus strategy
- Latency and throughput bottleneck mitigations`
  },
  {
    id: 'debug-root-cause',
    category: 'Coding',
    title: 'Root Cause Bug Triage',
    description: 'Diagnose subtle runtime exceptions and memory anomalies.',
    prompt: `I am encountering an unexpected runtime bug. Here are the symptoms, stack trace, and relevant code:
[Paste error or behavior here]

Please systematically diagnose the root cause, identify false leads, and provide the exact patch with test cases to prevent regressions.`
  },
  {
    id: 'sql-optimizer',
    category: 'Analysis',
    title: 'SQL Query & Schema Tuning',
    description: 'Analyze query plan, index efficiency, and execution bottlenecks.',
    prompt: `Here is an expensive SQL query and the associated table schema:
[Paste SQL & indexes here]

Analyze the query execution plan, suggest compound or partial index strategies, and rewrite the query to minimize I/O and table scans.`
  },
  {
    id: 'api-contract',
    category: 'Architecture',
    title: 'REST / GraphQL Contract Specification',
    description: 'Draft clean, predictable OpenAPI / RESTful specifications.',
    prompt: `Draft a comprehensive, idiomatic API contract specification for a new resource service. Include:
- Endpoint definitions with standard HTTP status codes
- Idempotency guarantees for mutation endpoints
- Pagination, sorting, and error response schemas
- Concrete JSON request/response payloads`
  },
  {
    id: 'executive-summary',
    category: 'Writing',
    title: 'Executive Technical Briefing',
    description: 'Synthesize complex technical proposals into a crisp decision memo.',
    prompt: `Synthesize the following technical proposal into a high-impact executive decision memo:
- 1-paragraph bottom-line upfront (BLUF)
- Key business and engineering trade-offs
- Risk matrix and mitigation timeline
- Concrete resource and infrastructure recommendation`
  },
  {
    id: 'first-principles',
    category: 'Reasoning',
    title: 'First-Principles Deconstruction',
    description: 'Break down complex domain questions into bedrock axioms.',
    prompt: `Deconstruct the following problem down to its fundamental physics or computer science axioms:
[Problem or hypothesis here]

Strip away existing industry conventions, analyze the thermodynamic or informational limits, and construct an optimal solution from scratch.`
  }
];
