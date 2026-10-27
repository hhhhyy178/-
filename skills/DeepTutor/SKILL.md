# DeepTutor - AI-Powered Personalized Tutoring System

Graph-enhanced RAG tutoring system adapted from [HKUDS/DeepTutor](https://github.com/HKUDS/DeepTutor). Transforms documents (PDFs, textbooks, papers, notes) into interactive tutoring sessions with knowledge graphs, dual-loop problem solving, deep research, and question generation.

## Triggers

Use this skill when the user:
- Says "deeptutor", "deep tutor", "tutor me", "teach me", "/deeptutor"
- Asks to "study", "learn from", or "understand" a PDF/document/textbook/paper
- Asks to "create a knowledge base from" a document
- Wants "practice questions" or "quiz me" on document content
- Asks to "explain" or "solve" a problem from a textbook
- Wants a "deep research report" on a topic from their documents
- Asks for "guided learning" through a complex topic

## Setup (One-time)

Before first use, install the required Python package:
```bash
pip install networkx
```

## Scripts Location

All scripts are at: `~/.claude/skills/deeptutor/scripts/`
- `kb_manager.py` - Knowledge base CRUD operations
- `graph_builder.py` - Knowledge graph construction (NetworkX)
- `graph_retriever.py` - Hybrid retrieval (BM25 + graph expansion)

## Core Concepts

**Knowledge Base (KB):** A processed document collection with text chunks and a knowledge graph.
**Knowledge Graph:** Entity-relationship graph extracted from documents (concepts, definitions, theorems, formulas and their connections).
**Dual-Loop Solving:** Analysis Loop (gather context) followed by Solve Loop (reason step-by-step) -- adapted from DeepTutor's methodology.
**Hybrid Retrieval:** Combines keyword/BM25 matching with graph-based context expansion for richer results than either alone.

---

## WORKFLOW 1: Initialize Knowledge Base from Document

When the user provides a document (PDF, text, markdown) and wants to study/learn from it:

### Step 1: Extract Text and Create KB

1. Use the `pdf` skill or the Read tool to extract all text from the document
2. Create the KB:
```bash
python3 ~/.claude/skills/deeptutor/scripts/kb_manager.py create "<kb_name>" --description "Description of the document"
```

### Step 2: Chunk the Document

Split the extracted text into chunks. Use this chunking strategy:
- Split by pages or sections (if the document has clear section boundaries)
- Target chunk size: 500-1000 words per chunk
- Preserve section headers and context
- Store chunks as a JSON list

Then add to KB by writing a temporary chunks file and using the kb_manager Python API:
```python
import sys
sys.path.insert(0, os.path.expanduser("~/.claude/skills/deeptutor/scripts"))
from kb_manager import add_document

chunks = [
    {"text": "chunk text here...", "page": 1, "section": "Introduction"},
    {"text": "next chunk...", "page": 2, "section": "Chapter 1"},
    # ...
]
result = add_document("<kb_name>", "/path/to/source.pdf", chunks)
```

### Step 3: Build Knowledge Graph

This is the key differentiator. For each chunk (or batch of chunks), extract entities and relationships:

**Entity Extraction Prompt** -- apply this to each chunk batch:
```
Analyze the following text and extract key entities (concepts, definitions, theorems, formulas, methods, people, etc.) and their relationships.

TEXT:
{chunk_text}

Output as JSON:
{
  "entities": [
    {
      "id": "lowercase_underscore_name",
      "name": "Display Name",
      "type": "concept|definition|theorem|formula|method|person|term",
      "definition": "Brief definition or description",
      "page_refs": [page_numbers_if_known],
      "mentions": 1
    }
  ],
  "relations": [
    {
      "source": "entity_id_1",
      "target": "entity_id_2",
      "type": "defines|uses|extends|contradicts|part_of|prerequisite|derives_from|applies_to|related_to",
      "description": "Brief description of the relationship",
      "weight": 1.0
    }
  ]
}
```

After extraction, add to graph:
```bash
echo '<extracted_json>' | python3 ~/.claude/skills/deeptutor/scripts/graph_builder.py add --kb "<kb_name>"
```

### Step 4: Verify

```bash
python3 ~/.claude/skills/deeptutor/scripts/graph_builder.py stats --kb "<kb_name>"
python3 ~/.claude/skills/deeptutor/scripts/kb_manager.py info "<kb_name>"
```

Report to user: "Knowledge base '<kb_name>' ready: X chunks indexed, Y entities, Z relationships in knowledge graph."

---

## WORKFLOW 2: Solve a Problem (Dual-Loop Methodology)

When the user asks a question about their documents, use the Dual-Loop approach:

### Analysis Loop (Gather Context)

The goal is to reach "Information Sufficiency" with minimum queries.

**Round 1: Investigate**
1. Identify what knowledge is needed to answer the question
2. Query the KB using hybrid retrieval:
```bash
python3 ~/.claude/skills/deeptutor/scripts/graph_retriever.py query --kb "<kb_name>" --query "the user's question" --top-k 5 --mode hybrid
```
3. Review results. If specific formulas, theorems, or numbered items are mentioned, do targeted queries:
```bash
python3 ~/.claude/skills/deeptutor/scripts/graph_retriever.py query --kb "<kb_name>" --query "specific formula or theorem name" --top-k 3 --mode naive
```

**Round 2: Note-Taking**
- Summarize what was found
- Identify remaining knowledge gaps
- If gaps exist, do another investigation round (max 3-5 rounds)

**Decision Rules (from DeepTutor's Investigate Agent):**
- Deduction over Search: If info can be derived from what you know, do not search
- Precision: Queries must target specific definitions, formulas, constants -- no broad queries
- De-duplication: Never query for info already retrieved
- Cut Losses: If a query returns nothing useful, abandon that angle immediately
- Stop Early: If existing info is sufficient to start solving, stop investigating

### Solve Loop (Reason Through Answer)

**Step 1: Plan the Solution Chain**
Break the problem into steps, each with a clear role:
- **Calculation**: Numerical operations, equation solving (use code execution)
- **Derivation**: Formula derivation, theorem proofs, symbolic reasoning
- **Analysis**: Problem decomposition, qualitative analysis, concept explanation
- **Drawing**: Visualization, plotting (use code execution)
- **Integration**: Synthesize multi-step results into final conclusion

**Step 2: Execute Each Step**
For each step:
1. Gather relevant context from investigation results
2. Reason through the step using retrieved knowledge and citations
3. If code execution is needed, write and run Python code
4. Produce the step's result with citations in `[cite_id]` format

**Step 3: Compile Final Answer**
- Combine all step results
- Format citations at the end
- Provide both a concise answer and detailed explanation if the problem is complex

### Output Format for Solved Problems

```markdown
## Answer

[Concise answer to the question]

## Detailed Solution

### Step 1: [Step description]
[Detailed reasoning with citations [1][2]...]

### Step 2: [Step description]
[Detailed reasoning...]

[Continue for all steps]

---

### References
[1] Source: page X - "relevant quote"
[2] Source: page Y - "relevant quote"
```

---

## WORKFLOW 3: Generate Practice Questions

When the user asks for practice questions or wants to be quizzed:

1. Retrieve relevant content from KB:
```bash
python3 ~/.claude/skills/deeptutor/scripts/graph_retriever.py query --kb "<kb_name>" --query "<topic>" --top-k 8 --mode hybrid
```

2. Use the retrieved knowledge to generate questions following these rules:
   - Questions must be based on actual KB content (not invented facts)
   - Multiple choice: exactly one correct answer, plausible distractors
   - Written questions: require substantial reasoning, not trivial lookups
   - Include difficulty calibration: Easy / Medium / Hard
   - Provide detailed explanations referencing the source material

3. Present questions one at a time (unless user asks for a batch)
4. After the user answers, provide feedback with explanation and source references

### Question Generation Prompt Pattern

```
Based on the following knowledge from the document:

KNOWLEDGE:
{retrieved_chunks}

GRAPH CONTEXT:
{related_entities_and_relations}

Generate a [difficulty] [question_type] question that tests understanding of [topic].

Requirements:
- The question must be grounded in the provided knowledge
- For multiple choice: one correct answer, three plausible distractors
- For written: require multi-step reasoning
- Include a detailed explanation referencing the source

Output JSON:
{
  "difficulty": "easy|medium|hard",
  "question_type": "choice|written",
  "question": "question text",
  "options": {"A": "...", "B": "...", "C": "...", "D": "..."} // choice only
  "correct_answer": "answer",
  "explanation": "detailed explanation with source references"
}
```

---

## WORKFLOW 4: Deep Research Report

When the user asks for a deep research report or comprehensive analysis on a topic:

### Phase 1: Topic Decomposition
1. Retrieve broad context from KB
2. Decompose the main topic into 3-7 subtopics covering different dimensions
3. For each subtopic, identify key aspects to investigate

### Phase 2: Research Each Subtopic
For each subtopic:
1. Query KB with targeted queries (both naive and hybrid modes)
2. Gather graph context (entity neighborhoods)
3. Take structured notes: key findings, formulas, data, examples

### Phase 3: Generate Report
Follow this outline structure:
1. **Title and Introduction** (400-600 words)
   - Background, problem motivation, scope
2. **Core Sections** (one per subtopic, 800+ words each)
   - Use subsections with `###` headings
   - Include formulas (LaTeX), tables, diagrams where appropriate
   - Cross-reference between sections
3. **Conclusion** (500-700 words)
   - Summary of findings, contributions, limitations, future directions

### Academic Writing Standards
- Deep paraphrasing, not copying
- Each claim supported by evidence
- Technical terms defined on first use
- Citations in `[N]` format throughout
- References section at the end

---

## WORKFLOW 5: Guided Learning

When the user wants to learn a topic step-by-step:

### Phase 1: Locate
1. Retrieve the topic from KB
2. Identify prerequisites and related concepts via the knowledge graph:
```bash
python3 ~/.claude/skills/deeptutor/scripts/graph_builder.py neighborhood --kb "<kb_name>" --entity "<topic>" --hops 2
```
3. Build a learning path from prerequisites to target concept

### Phase 2: Interactive Teaching
For each concept in the learning path:
1. Explain the concept using retrieved document content
2. Check understanding with a quick question
3. If the user struggles, provide additional examples or simpler explanation
4. Only advance when the user demonstrates understanding

### Phase 3: Summary
- Recap all concepts covered
- Highlight connections between concepts (using graph relationships)
- Suggest next topics to explore

---

## WORKFLOW 6: Knowledge Base Management

### List all KBs
```bash
python3 ~/.claude/skills/deeptutor/scripts/kb_manager.py list
```

### Get KB details
```bash
python3 ~/.claude/skills/deeptutor/scripts/kb_manager.py info "<kb_name>"
```

### View graph statistics
```bash
python3 ~/.claude/skills/deeptutor/scripts/graph_builder.py stats --kb "<kb_name>"
```

### Delete a KB
```bash
python3 ~/.claude/skills/deeptutor/scripts/kb_manager.py delete "<kb_name>"
```

### Explore graph entities
```bash
python3 ~/.claude/skills/deeptutor/scripts/graph_builder.py neighborhood --kb "<kb_name>" --entity "<entity_name>" --hops 1
```

---

## Key Principles (from DeepTutor's Design)

1. **Minimal but Sufficient Information**: Gather just enough context to answer well. Don't over-retrieve.
2. **Deduction over Search**: If you can reason from what you already know, don't search.
3. **Precision Queries**: Target specific definitions, formulas, theorems -- not broad topics.
4. **Cut Losses**: If a search returns nothing useful, move on immediately. Don't retry the same angle.
5. **Citation-Driven**: Every claim should reference its source in the document.
6. **Dual-Loop Rigor**: Always separate investigation (gathering) from solving (reasoning).
7. **Graph-Enhanced Retrieval**: Use entity relationships to find context that keyword search alone would miss.
8. **Adaptive Complexity**: Match the solution complexity to the question difficulty. Simple questions get concise answers. Complex problems get step-by-step solutions.

## Provenance

Hybrid Claude-Native skill based on the methodology of [DeepTutor](https://github.com/HKUDS/DeepTutor) (HKU Data Science Lab). The approach is adapted, not a direct code port -- it replaces DeepTutor's infrastructure with Claude's native capabilities while preserving the core pedagogical patterns: dual-loop problem solving, graph-enhanced retrieval, adaptive questioning, and research decomposition.
