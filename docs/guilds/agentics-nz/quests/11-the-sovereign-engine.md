# Quest: The Sovereign Engine

| Field | Value |
|-------|-------|
| **Category** | Infrastructure |
| **Difficulty** | Journeyman |
| **Points** | 150 |
| **Deadline** | 4 weeks from claim |
| **Evidence** | GM-verified (working demo) |
| **Objectives** | 6 (+ 1 bonus) |

---

## Narrative Context

In the age of cloud giants, true sovereignty comes from silicon you can touch. The guild has acquired a powerful artifact—an HP Z2 Mini workstation with AMD AI Max+ 395—that awaits awakening in the Agentics NZ Branch Office. Your quest: forge the software layer that transforms this hardware into a community resource for local AI experimentation, free from external API dependencies.

---

## Transformation Goal

You will architect and deploy a complete local AI inference platform, giving the community hands-on access to run models on dedicated hardware. You will first prove the entire system on your own equipment, then guide production deployment on the guild's HP Z2 Mini.

---

## Objectives

### Objective 1: The Local Proving Ground
| Field | Value |
|-------|-------|
| **Points** | 15 |
| **Evidence** | GM-verified |
| **Depends On** | — |

Set up llama.cpp server on your own hardware with at least one working model. Document your local development environment and demonstrate successful inference. This becomes your test bed for all subsequent objectives.

---

### Objective 2: The Gateway
| Field | Value |
|-------|-------|
| **Points** | 30 |
| **Evidence** | GM-verified |
| **Depends On** | Objective 1 |

Implement a secure OpenAI-compatible API endpoint. Design and implement an authentication and rate-limiting strategy appropriate for community use. Security is paramount—document your threat model and mitigation approach. The specific implementation is your design choice.

---

### Objective 3: The Interface
| Field | Value |
|-------|-------|
| **Points** | 35 |
| **Evidence** | GM-verified |
| **Depends On** | Objective 2 |

Build a web frontend for model switching using llama.cpp server capabilities. The interface must allow authenticated users to select from available models and interact with them. Design for deployment on fly.io, with cost efficiency as a consideration.

---

### Objective 4: The Library
| Field | Value |
|-------|-------|
| **Points** | 30 |
| **Evidence** | GM-verified |
| **Depends On** | Objective 3 |

Add the ability to browse and download models from Hugging Face directly to the host machine. Downloaded models must become selectable via the web interface. Include storage management to prevent disk exhaustion.

---

### Objective 5: The Codex
| Field | Value |
|-------|-------|
| **Points** | 20 |
| **Evidence** | GM-verified |
| **Depends On** | Objective 4 |

Write comprehensive documentation including:
- User guide for community members
- Architecture overview with security considerations
- Deployment runbook for production
- Maintenance procedures for future guild maintainers

---

### Objective 6: The Awakening
| Field | Value |
|-------|-------|
| **Points** | 20 |
| **Evidence** | GM-verified |
| **Depends On** | Objective 5 |

Work with the GM to deploy and configure the complete system on the HP Z2 Mini at the Agentics NZ Branch Office. Provide hands-on support until the production environment is verified working and handed over.

---

### Bonus Objective: The Watcher
| Field | Value |
|-------|-------|
| **Points** | +30 |
| **Evidence** | GM-verified |
| **Depends On** | Objective 3 |

Integrate power monitoring via a smart mains plug connected to the HP Z2 Mini. Display real-time power consumption in the web interface and estimate ongoing operational costs based on current NZ electricity prices. Choice of smart plug hardware and integration approach is yours.

---

## Resources

- [HP Z2 Mini Workstation](https://www.hp.com/us-en/workstations/z2-mini-a.html) — Target production hardware
- [llama.cpp](https://github.com/ggerganov/llama.cpp) — Inference engine
- [Hugging Face Hub](https://huggingface.co/) — Model repository
- [fly.io Documentation](https://fly.io/docs/) — Frontend hosting platform
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference) — API compatibility target

---

## Hardware Specification

**Production Target:** HP Z2 Mini with AMD AI Max+ 395
- Unified memory architecture ideal for LLM inference
- Location: Agentics NZ Branch Office
- Access: Coordinated with GM for Objective 6

---

## Design Notes

This quest prioritises security and sustainability. The questee must demonstrate competence on their own hardware before touching guild infrastructure. Cost consciousness is required—both for fly.io hosting and ongoing power consumption. The bonus objective supports transparency around operational costs, helping the guild make informed decisions about the service's future.

The authentication and network security approach is deliberately left to the questee's design—this tests their ability to make sound architectural decisions, not just follow instructions.
