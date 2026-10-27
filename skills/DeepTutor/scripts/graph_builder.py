#!/usr/bin/env python3
"""
Graph Builder - Extracts entities and relationships from text to build knowledge graphs.

Adapted from DeepTutor's Graph RAG approach. Uses NetworkX for graph storage.
Entity/relation extraction is done by Claude natively (via the skill workflow),
and this script handles the graph construction, storage, and querying.

Usage:
  # Build graph from extracted entities JSON
  python graph_builder.py build --kb <kb_name> --entities entities.json

  # Add entities interactively from JSON stdin
  python graph_builder.py add --kb <kb_name> < entities.json

  # Show graph stats
  python graph_builder.py stats --kb <kb_name>

  # Export graph as JSON
  python graph_builder.py export --kb <kb_name>
"""

import json
import os
import sys
from pathlib import Path
from datetime import datetime

try:
    import networkx as nx
    HAS_NETWORKX = True
except ImportError:
    HAS_NETWORKX = False

SKILL_DIR = os.path.join(str(Path.home()), ".claude", "skills", "deeptutor")
KB_BASE_DIR = os.path.join(SKILL_DIR, "kb")


def get_graph_path(kb_name: str) -> str:
    return os.path.join(KB_BASE_DIR, kb_name, "graphs", "knowledge_graph.json")


def load_graph(kb_name: str) -> "nx.DiGraph":
    """Load existing graph or create empty one."""
    if not HAS_NETWORKX:
        print("ERROR: networkx not installed. Run: pip install networkx", file=sys.stderr)
        sys.exit(1)

    graph_path = get_graph_path(kb_name)
    G = nx.DiGraph()

    if os.path.exists(graph_path):
        with open(graph_path) as f:
            data = json.load(f)

        for entity in data.get("entities", []):
            G.add_node(entity["id"], **{k: v for k, v in entity.items() if k != "id"})

        for rel in data.get("relations", []):
            G.add_edge(
                rel["source"], rel["target"],
                type=rel.get("type", "related_to"),
                description=rel.get("description", ""),
                weight=rel.get("weight", 1.0),
            )

    return G


def save_graph(G: "nx.DiGraph", kb_name: str):
    """Save graph to JSON."""
    graph_path = get_graph_path(kb_name)
    os.makedirs(os.path.dirname(graph_path), exist_ok=True)

    entities = []
    for node_id, attrs in G.nodes(data=True):
        entity = {"id": node_id}
        entity.update(attrs)
        entities.append(entity)

    relations = []
    for src, tgt, attrs in G.edges(data=True):
        rel = {"source": src, "target": tgt}
        rel.update(attrs)
        relations.append(rel)

    data = {
        "metadata": {
            "kb_name": kb_name,
            "num_entities": len(entities),
            "num_relations": len(relations),
            "updated_at": datetime.now().isoformat(),
        },
        "entities": entities,
        "relations": relations,
    }

    with open(graph_path, "w") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    # Update KB metadata
    meta_path = os.path.join(KB_BASE_DIR, kb_name, "metadata.json")
    if os.path.exists(meta_path):
        with open(meta_path) as f:
            meta = json.load(f)
        meta["has_graph"] = True
        meta["graph_entities"] = len(entities)
        meta["graph_relations"] = len(relations)
        meta["updated_at"] = datetime.now().isoformat()
        with open(meta_path, "w") as f:
            json.dump(meta, f, indent=2)


def add_entities_and_relations(kb_name: str, entities: list, relations: list) -> dict:
    """Add entities and relations to the knowledge graph."""
    G = load_graph(kb_name)
    added_entities = 0
    added_relations = 0

    for entity in entities:
        eid = entity.get("id") or entity.get("name", "").lower().replace(" ", "_")
        if not eid:
            continue
        attrs = {k: v for k, v in entity.items() if k != "id"}
        if eid in G.nodes:
            # Merge attributes
            existing = dict(G.nodes[eid])
            for k, v in attrs.items():
                if k == "page_refs" and k in existing:
                    existing[k] = sorted(set(existing[k] + v)) if isinstance(v, list) else v
                elif k == "mentions" and k in existing:
                    existing[k] = existing[k] + v if isinstance(v, (int, float)) else v
                else:
                    existing[k] = v
            G.nodes[eid].update(existing)
        else:
            G.add_node(eid, **attrs)
            added_entities += 1

    for rel in relations:
        src = rel.get("source", "").lower().replace(" ", "_")
        tgt = rel.get("target", "").lower().replace(" ", "_")
        if not src or not tgt:
            continue
        rtype = rel.get("type", "related_to")
        desc = rel.get("description", "")
        weight = rel.get("weight", 1.0)

        if G.has_edge(src, tgt):
            # Increase weight for repeated relations
            G[src][tgt]["weight"] = G[src][tgt].get("weight", 1.0) + 0.5
        else:
            G.add_edge(src, tgt, type=rtype, description=desc, weight=weight)
            added_relations += 1

    save_graph(G, kb_name)
    return {
        "added_entities": added_entities,
        "added_relations": added_relations,
        "total_entities": G.number_of_nodes(),
        "total_relations": G.number_of_edges(),
    }


def get_graph_stats(kb_name: str) -> dict:
    """Get statistics about the knowledge graph."""
    G = load_graph(kb_name)
    if G.number_of_nodes() == 0:
        return {"status": "empty", "entities": 0, "relations": 0}

    # Entity type distribution
    type_dist = {}
    for _, attrs in G.nodes(data=True):
        etype = attrs.get("type", "unknown")
        type_dist[etype] = type_dist.get(etype, 0) + 1

    # Most connected entities (hubs)
    degree_centrality = nx.degree_centrality(G)
    top_hubs = sorted(degree_centrality.items(), key=lambda x: x[1], reverse=True)[:10]

    # Relation type distribution
    rel_types = {}
    for _, _, attrs in G.edges(data=True):
        rtype = attrs.get("type", "unknown")
        rel_types[rtype] = rel_types.get(rtype, 0) + 1

    return {
        "entities": G.number_of_nodes(),
        "relations": G.number_of_edges(),
        "entity_types": type_dist,
        "relation_types": rel_types,
        "top_hubs": [{"entity": e, "centrality": round(c, 4)} for e, c in top_hubs],
        "density": round(nx.density(G), 6),
        "connected_components": nx.number_weakly_connected_components(G),
    }


def get_entity_neighborhood(kb_name: str, entity_id: str, hops: int = 1) -> dict:
    """Get the neighborhood of an entity in the graph."""
    G = load_graph(kb_name)
    entity_id_normalized = entity_id.lower().replace(" ", "_")

    if entity_id_normalized not in G:
        # Fuzzy match
        matches = [n for n in G.nodes if entity_id_normalized in n or n in entity_id_normalized]
        if not matches:
            return {"error": f"Entity '{entity_id}' not found", "available": list(G.nodes)[:20]}
        entity_id_normalized = matches[0]

    # Get ego graph (neighborhood)
    subgraph = nx.ego_graph(G, entity_id_normalized, radius=hops, undirected=True)

    entities = []
    for node, attrs in subgraph.nodes(data=True):
        entities.append({"id": node, **attrs})

    relations = []
    for src, tgt, attrs in subgraph.edges(data=True):
        relations.append({"source": src, "target": tgt, **attrs})

    return {
        "center": entity_id_normalized,
        "hops": hops,
        "entities": entities,
        "relations": relations,
        "num_entities": len(entities),
        "num_relations": len(relations),
    }


def export_graph(kb_name: str) -> dict:
    """Export full graph as JSON."""
    graph_path = get_graph_path(kb_name)
    if not os.path.exists(graph_path):
        return {"error": "No graph found", "kb_name": kb_name}
    with open(graph_path) as f:
        return json.load(f)


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="DeepTutor Knowledge Graph Builder")
    sub = parser.add_subparsers(dest="command")

    # Build from entities JSON
    b = sub.add_parser("build", help="Add entities/relations from JSON file")
    b.add_argument("--kb", required=True, help="Knowledge base name")
    b.add_argument("--entities", required=True, help="Path to entities JSON file")

    # Add from stdin
    a = sub.add_parser("add", help="Add entities/relations from stdin JSON")
    a.add_argument("--kb", required=True, help="Knowledge base name")

    # Stats
    s = sub.add_parser("stats", help="Show graph statistics")
    s.add_argument("--kb", required=True, help="Knowledge base name")

    # Neighborhood
    n = sub.add_parser("neighborhood", help="Get entity neighborhood")
    n.add_argument("--kb", required=True, help="Knowledge base name")
    n.add_argument("--entity", required=True, help="Entity ID or name")
    n.add_argument("--hops", type=int, default=1, help="Number of hops")

    # Export
    e = sub.add_parser("export", help="Export full graph as JSON")
    e.add_argument("--kb", required=True, help="Knowledge base name")

    args = parser.parse_args()

    if args.command == "build":
        with open(args.entities) as f:
            data = json.load(f)
        result = add_entities_and_relations(
            args.kb,
            data.get("entities", []),
            data.get("relations", []),
        )
        print(json.dumps(result, indent=2))

    elif args.command == "add":
        data = json.load(sys.stdin)
        result = add_entities_and_relations(
            args.kb,
            data.get("entities", []),
            data.get("relations", []),
        )
        print(json.dumps(result, indent=2))

    elif args.command == "stats":
        stats = get_graph_stats(args.kb)
        print(json.dumps(stats, indent=2))

    elif args.command == "neighborhood":
        result = get_entity_neighborhood(args.kb, args.entity, args.hops)
        print(json.dumps(result, indent=2, ensure_ascii=False))

    elif args.command == "export":
        result = export_graph(args.kb)
        print(json.dumps(result, indent=2, ensure_ascii=False))

    else:
        parser.print_help()
