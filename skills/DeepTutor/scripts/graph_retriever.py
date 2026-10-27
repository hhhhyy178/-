#!/usr/bin/env python3
"""
Graph Retriever - Hybrid retrieval combining keyword matching, graph traversal,
and optional vector similarity for context-aware document retrieval.

Adapted from DeepTutor's hybrid retrieval approach:
  1. Keyword/BM25-style matching against document chunks
  2. Graph-based expansion (find related entities -> their source chunks)
  3. Score fusion (weighted combination of keyword + graph scores)

Usage:
  python graph_retriever.py query --kb <kb_name> --query "What is gradient descent?" --top-k 5
  python graph_retriever.py query --kb <kb_name> --query "..." --mode hybrid
  python graph_retriever.py query --kb <kb_name> --query "..." --mode naive
"""

import json
import math
import os
import re
import sys
from collections import Counter
from pathlib import Path

SKILL_DIR = os.path.join(str(Path.home()), ".claude", "skills", "deeptutor")
KB_BASE_DIR = os.path.join(SKILL_DIR, "kb")

# Import sibling modules
sys.path.insert(0, os.path.dirname(__file__))
from kb_manager import get_all_chunks
from graph_builder import load_graph, get_entity_neighborhood


def tokenize(text: str) -> list:
    """Simple whitespace + punctuation tokenizer."""
    text = text.lower()
    text = re.sub(r'[^\w\s]', ' ', text)
    return [w for w in text.split() if len(w) > 1]


def compute_bm25_scores(query_tokens: list, documents: list, k1=1.5, b=0.75) -> list:
    """Compute BM25 scores for query against documents."""
    N = len(documents)
    if N == 0:
        return []

    # Document frequencies
    df = Counter()
    doc_tokens_list = []
    doc_lengths = []
    for doc in documents:
        text = doc.get("text", "") if isinstance(doc, dict) else str(doc)
        tokens = tokenize(text)
        doc_tokens_list.append(tokens)
        doc_lengths.append(len(tokens))
        unique_tokens = set(tokens)
        for t in unique_tokens:
            df[t] += 1

    avg_dl = sum(doc_lengths) / max(N, 1)

    scores = []
    for i, doc_tokens in enumerate(doc_tokens_list):
        score = 0.0
        dl = doc_lengths[i]
        tf_counter = Counter(doc_tokens)

        for qt in query_tokens:
            if qt not in df:
                continue
            tf = tf_counter.get(qt, 0)
            idf = math.log((N - df[qt] + 0.5) / (df[qt] + 0.5) + 1)
            tf_norm = (tf * (k1 + 1)) / (tf + k1 * (1 - b + b * dl / max(avg_dl, 1)))
            score += idf * tf_norm

        scores.append(score)

    return scores


def graph_expand_context(kb_name: str, query: str, top_k_entities: int = 5) -> list:
    """Use graph to find related entities and expand retrieval context."""
    try:
        G = load_graph(kb_name)
    except Exception:
        return []

    if G.number_of_nodes() == 0:
        return []

    # Simple keyword matching against entity names and descriptions
    query_tokens = set(tokenize(query))
    entity_scores = {}

    for node_id, attrs in G.nodes(data=True):
        name_tokens = set(tokenize(node_id))
        desc_tokens = set(tokenize(attrs.get("definition", "") + " " + attrs.get("description", "")))
        type_tokens = set(tokenize(attrs.get("type", "")))

        # Score based on token overlap
        name_overlap = len(query_tokens & name_tokens)
        desc_overlap = len(query_tokens & desc_tokens)
        score = name_overlap * 3.0 + desc_overlap * 1.0  # Name matches weighted higher

        if score > 0:
            entity_scores[node_id] = score

    # Get top entities
    top_entities = sorted(entity_scores.items(), key=lambda x: x[1], reverse=True)[:top_k_entities]

    # Expand to 1-hop neighborhoods
    expanded_context = []
    seen_entities = set()
    for entity_id, score in top_entities:
        try:
            neighborhood = get_entity_neighborhood(kb_name, entity_id, hops=1)
            for ent in neighborhood.get("entities", []):
                eid = ent.get("id", "")
                if eid not in seen_entities:
                    seen_entities.add(eid)
                    expanded_context.append({
                        "entity_id": eid,
                        "type": ent.get("type", ""),
                        "definition": ent.get("definition", ""),
                        "description": ent.get("description", ""),
                        "page_refs": ent.get("page_refs", []),
                        "graph_score": score if eid == entity_id else score * 0.5,
                    })
            for rel in neighborhood.get("relations", []):
                expanded_context.append({
                    "relation": f"{rel['source']} --[{rel.get('type', 'related')}]--> {rel['target']}",
                    "description": rel.get("description", ""),
                })
        except Exception:
            continue

    return expanded_context


def hybrid_retrieve(kb_name: str, query: str, top_k: int = 5, mode: str = "hybrid",
                    alpha: float = 0.7) -> list:
    """
    Hybrid retrieval combining keyword matching and graph expansion.

    Args:
        kb_name: Knowledge base name
        query: Query string
        top_k: Number of results to return
        mode: "hybrid" (keyword + graph), "naive" (keyword only), "graph" (graph only)
        alpha: Weight for keyword scores (1-alpha for graph boost)

    Returns:
        List of {text, source, score, chunk_index, ...} dicts
    """
    chunks = get_all_chunks(kb_name)
    if not chunks:
        return [{"error": f"No chunks found in knowledge base '{kb_name}'"}]

    query_tokens = tokenize(query)

    # 1. Keyword/BM25 scores
    keyword_scores = compute_bm25_scores(query_tokens, chunks)

    # 2. Graph expansion (if hybrid mode)
    graph_context = []
    graph_boost = {}  # chunk_index -> boost score
    if mode in ("hybrid", "graph"):
        graph_context = graph_expand_context(kb_name, query)

        # Boost chunks that share page_refs or entity names with graph results
        entity_pages = set()
        entity_names = set()
        for ctx in graph_context:
            for p in ctx.get("page_refs", []):
                entity_pages.add(str(p))
            eid = ctx.get("entity_id", "")
            if eid:
                entity_names.update(tokenize(eid))

        for i, chunk in enumerate(chunks):
            boost = 0.0
            text = chunk.get("text", "") if isinstance(chunk, dict) else str(chunk)
            chunk_tokens = set(tokenize(text))

            # Boost if chunk mentions graph entities
            entity_overlap = len(entity_names & chunk_tokens)
            if entity_overlap > 0:
                boost += entity_overlap * 0.5

            # Boost if chunk is from same page as graph entities
            chunk_source = str(chunk.get("page", chunk.get("chunk_index", "")))
            if chunk_source in entity_pages:
                boost += 1.0

            if boost > 0:
                graph_boost[i] = boost

    # 3. Fuse scores
    final_scores = []
    for i in range(len(chunks)):
        kw_score = keyword_scores[i] if i < len(keyword_scores) else 0.0
        g_boost = graph_boost.get(i, 0.0)

        if mode == "naive":
            final_score = kw_score
        elif mode == "graph":
            final_score = g_boost
        else:  # hybrid
            final_score = alpha * kw_score + (1 - alpha) * g_boost

        final_scores.append((i, final_score))

    # 4. Sort and return top-k
    final_scores.sort(key=lambda x: x[1], reverse=True)
    results = []
    for idx, score in final_scores[:top_k]:
        chunk = chunks[idx]
        text = chunk.get("text", "") if isinstance(chunk, dict) else str(chunk)
        result = {
            "text": text[:2000],  # Limit text length
            "score": round(score, 4),
            "source": chunk.get("source", "unknown"),
            "chunk_index": chunk.get("chunk_index", idx),
            "doc_id": chunk.get("doc_id", ""),
        }
        if chunk.get("page"):
            result["page"] = chunk["page"]
        results.append(result)

    # 5. Append graph context for hybrid mode
    if mode in ("hybrid", "graph") and graph_context:
        entity_context = []
        for ctx in graph_context:
            if ctx.get("entity_id"):
                entity_context.append({
                    "entity": ctx["entity_id"],
                    "type": ctx.get("type", ""),
                    "definition": ctx.get("definition", ""),
                })
            elif ctx.get("relation"):
                entity_context.append({"relation": ctx["relation"]})

        if entity_context:
            results.append({
                "type": "graph_context",
                "message": "Related entities and relationships from knowledge graph",
                "entities_and_relations": entity_context[:15],
            })

    return results


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="DeepTutor Graph-Enhanced Retrieval")
    sub = parser.add_subparsers(dest="command")

    q = sub.add_parser("query", help="Query knowledge base")
    q.add_argument("--kb", required=True, help="Knowledge base name")
    q.add_argument("--query", required=True, help="Query string")
    q.add_argument("--top-k", type=int, default=5, help="Number of results")
    q.add_argument("--mode", choices=["hybrid", "naive", "graph"], default="hybrid",
                   help="Retrieval mode")
    q.add_argument("--alpha", type=float, default=0.7, help="Keyword weight (0-1)")

    args = parser.parse_args()

    if args.command == "query":
        results = hybrid_retrieve(
            kb_name=args.kb,
            query=args.query,
            top_k=args.top_k,
            mode=args.mode,
            alpha=args.alpha,
        )
        print(json.dumps(results, indent=2, ensure_ascii=False))
    else:
        parser.print_help()
