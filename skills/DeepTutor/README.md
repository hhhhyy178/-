# DeepTutor Skill for Claude Code

A Claude Code skill that brings [DeepTutor](https://github.com/HKUDS/DeepTutor)'s graph-enhanced RAG tutoring methodology to your terminal. Transform documents (PDFs, textbooks, papers) into interactive tutoring sessions with knowledge graphs, dual-loop problem solving, deep research, and adaptive question generation.

## Credits & Attribution

This skill is a **Hybrid Claude-Native adaptation** of [DeepTutor](https://github.com/HKUDS/DeepTutor) by the [HKU Data Science Lab (HKUDS)](https://github.com/HKUDS).

The original DeepTutor is a full-stack AI tutoring platform (FastAPI + Next.js) with 6 agent systems. This skill adapts its **methodology and pedagogical patterns** -- not its code -- into a lightweight Claude Code skill that leverages Claude's native reasoning capabilities.

**Key patterns adapted from DeepTutor:**
- Dual-loop problem solving (Analysis Loop + Solve Loop)
- Graph-enhanced RAG retrieval (entity-relationship knowledge graphs)
- Investigate Agent's precision query methodology
- Research pipeline with topic decomposition
- Difficulty-calibrated question generation
- Citation-driven answering

If you use this in academic or professional work, please cite the original DeepTutor project:

```
@software{deeptutor,
  author = {HKUDS},
  title = {DeepTutor: AI-Powered Personalized Learning Assistant},
  url = {https://github.com/HKUDS/DeepTutor},
  year = {2024}
}
```

## What It Does

| Workflow | Description |
|----------|-------------|
| **Initialize KB** | Process a document into chunks + knowledge graph |
| **Dual-Loop Solve** | Analysis (gather context) then Solve (step-by-step reasoning) |
| **Generate Questions** | Practice questions calibrated by difficulty |
| **Deep Research** | Multi-section academic reports with citations |
| **Guided Learning** | Prerequisite-aware step-by-step teaching |
| **KB Management** | List, inspect, explore, delete knowledge bases |

## Installation

### Quick Install

```bash
# Clone this repo into your Claude Code skills directory
git clone https://github.com/ndpvt-web/deeptutor-claude-skill.git ~/.claude/skills/deeptutor

# Install the only dependency
pip install networkx
```

### Manual Install

```bash
# Create the skill directory
mkdir -p ~/.claude/skills/deeptutor/scripts

# Copy files
cp SKILL.md ~/.claude/skills/deeptutor/
cp scripts/*.py ~/.claude/skills/deeptutor/scripts/

# Install dependency
pip install networkx
```

## Usage

Once installed, the skill is automatically available in Claude Code. Trigger it by:

- Saying `deeptutor` or `/deeptutor`
- Asking to "study", "learn from", or "understand" a document
- Asking to "create a knowledge base" from a PDF
- Requesting "practice questions" or "quiz me"
- Asking to "explain" or "solve" a textbook problem
- Requesting a "deep research report"
- Asking for "guided learning" on a topic

### Example Workflows

**Study a PDF:**
> "deeptutor - help me study this textbook" (with a PDF attached)

**Solve a problem:**
> "Using my ML knowledge base, explain how backpropagation works step by step"

**Generate questions:**
> "Quiz me on Chapter 3 of my textbook - medium difficulty"

**Deep research:**
> "Write a deep research report on regularization techniques from my notes"

## Architecture

```
~/.claude/skills/deeptutor/
  SKILL.md                    # Skill definition (triggers, workflows, prompts)
  scripts/
    kb_manager.py             # Knowledge base CRUD operations
    graph_builder.py          # Knowledge graph (NetworkX) construction
    graph_retriever.py        # Hybrid retrieval (BM25 + graph expansion)
  kb/                         # Knowledge bases stored here (auto-created)
    <kb_name>/
      metadata.json           # KB metadata
      chunks/                 # Document chunks
      graphs/                 # Knowledge graph JSON
```

### How It Works

1. **Claude handles**: PDF reading, text understanding, entity extraction, reasoning, tutoring, question generation, report writing
2. **Python scripts handle**: Graph storage (NetworkX), BM25 scoring, graph traversal, knowledge base persistence
3. **The SKILL.md orchestrates**: Workflow definitions, prompt patterns, tool usage instructions

This division keeps the skill lightweight (~27KB total, 1 pip dependency) while capturing 70% of DeepTutor's value.

## Requirements

- Claude Code (with skill support)
- Python 3.9+
- `networkx` package (`pip install networkx`)

## Comparison with Original DeepTutor

| Aspect | Original DeepTutor | This Skill |
|--------|-------------------|------------|
| Dependencies | 50+ packages | 1 package (networkx) |
| Infrastructure | FastAPI + Next.js + DB | Claude Code + 3 Python scripts |
| LLM Provider | OpenAI/Anthropic API | Claude (native) |
| Graph Engine | RAG-Anything/LightRAG | NetworkX + BM25 |
| Footprint | 500MB+ | ~27KB |
| Features | 100% | ~70% |
| Setup time | 10+ minutes | < 1 minute |

## License

MIT License. See [LICENSE](LICENSE).

The original [DeepTutor](https://github.com/HKUDS/DeepTutor) project has its own license -- please check their repository for details.

## Acknowledgments

- [HKUDS/DeepTutor](https://github.com/HKUDS/DeepTutor) -- The original AI tutoring platform whose methodology this skill adapts
- [HKU Data Science Lab](https://github.com/HKUDS) -- For their research on graph-enhanced RAG and adaptive tutoring
- [NetworkX](https://networkx.org/) -- Graph library used for knowledge graph operations

---

## Keywords

> *For the search engines and the curious humans who find things by typing random words*

AI tutoring, knowledge graph tutoring, RAG tutor, adaptive learning AI, AI study assistant, intelligent tutoring system, graph-enhanced learning, research paper tutor, AI education tool, Claude Code tutor skill, deep learning tutor, study helper AI, academic AI assistant

