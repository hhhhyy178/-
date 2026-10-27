#!/usr/bin/env python3
"""
Knowledge Base Manager - Manages document knowledge bases for DeepTutor.
Handles: creation, listing, deletion, and metadata for knowledge bases.
Each KB stores processed document chunks, embeddings, and knowledge graphs.
"""

import json
import hashlib
import os
import sys
import shutil
from pathlib import Path
from datetime import datetime

KB_BASE_DIR = os.path.join(str(Path.home()), ".claude", "skills", "deeptutor", "kb")


def get_kb_dir(kb_name: str) -> str:
    return os.path.join(KB_BASE_DIR, kb_name)


def kb_exists(kb_name: str) -> bool:
    meta_path = os.path.join(get_kb_dir(kb_name), "metadata.json")
    return os.path.exists(meta_path)


def create_kb(kb_name: str, description: str = "") -> dict:
    """Create a new empty knowledge base."""
    kb_dir = get_kb_dir(kb_name)
    os.makedirs(kb_dir, exist_ok=True)
    os.makedirs(os.path.join(kb_dir, "chunks"), exist_ok=True)
    os.makedirs(os.path.join(kb_dir, "graphs"), exist_ok=True)

    metadata = {
        "name": kb_name,
        "description": description,
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat(),
        "documents": [],
        "total_chunks": 0,
        "has_graph": False,
        "has_embeddings": False,
    }
    with open(os.path.join(kb_dir, "metadata.json"), "w") as f:
        json.dump(metadata, f, indent=2)

    print(json.dumps({"status": "created", "kb_name": kb_name, "path": kb_dir}))
    return metadata


def add_document(kb_name: str, doc_path: str, chunks: list) -> dict:
    """Add a processed document's chunks to the knowledge base."""
    kb_dir = get_kb_dir(kb_name)
    if not kb_exists(kb_name):
        create_kb(kb_name)

    meta_path = os.path.join(kb_dir, "metadata.json")
    with open(meta_path) as f:
        metadata = json.load(f)

    doc_id = hashlib.md5(doc_path.encode()).hexdigest()[:12]
    chunk_file = os.path.join(kb_dir, "chunks", f"{doc_id}.json")

    # Store chunks with metadata
    chunk_data = {
        "doc_id": doc_id,
        "source": os.path.basename(doc_path),
        "source_path": doc_path,
        "indexed_at": datetime.now().isoformat(),
        "chunks": chunks,
    }
    with open(chunk_file, "w") as f:
        json.dump(chunk_data, f, indent=2, ensure_ascii=False)

    # Update metadata
    metadata["documents"].append({
        "doc_id": doc_id,
        "filename": os.path.basename(doc_path),
        "path": doc_path,
        "num_chunks": len(chunks),
        "added_at": datetime.now().isoformat(),
    })
    metadata["total_chunks"] += len(chunks)
    metadata["updated_at"] = datetime.now().isoformat()

    with open(meta_path, "w") as f:
        json.dump(metadata, f, indent=2)

    return {"doc_id": doc_id, "chunks_added": len(chunks)}


def get_all_chunks(kb_name: str) -> list:
    """Get all chunks from a knowledge base."""
    kb_dir = get_kb_dir(kb_name)
    chunks_dir = os.path.join(kb_dir, "chunks")
    all_chunks = []

    if not os.path.exists(chunks_dir):
        return all_chunks

    for fname in sorted(os.listdir(chunks_dir)):
        if fname.endswith(".json"):
            with open(os.path.join(chunks_dir, fname)) as f:
                data = json.load(f)
                source = data.get("source", fname)
                for i, chunk in enumerate(data.get("chunks", [])):
                    if isinstance(chunk, str):
                        all_chunks.append({
                            "text": chunk,
                            "source": source,
                            "chunk_index": i,
                            "doc_id": data.get("doc_id", ""),
                        })
                    elif isinstance(chunk, dict):
                        chunk.setdefault("source", source)
                        chunk.setdefault("chunk_index", i)
                        chunk.setdefault("doc_id", data.get("doc_id", ""))
                        all_chunks.append(chunk)

    return all_chunks


def list_kbs() -> list:
    """List all knowledge bases."""
    if not os.path.exists(KB_BASE_DIR):
        return []
    kbs = []
    for name in sorted(os.listdir(KB_BASE_DIR)):
        meta_path = os.path.join(KB_BASE_DIR, name, "metadata.json")
        if os.path.exists(meta_path):
            with open(meta_path) as f:
                meta = json.load(f)
            kbs.append({
                "name": meta["name"],
                "documents": len(meta.get("documents", [])),
                "chunks": meta.get("total_chunks", 0),
                "has_graph": meta.get("has_graph", False),
                "created": meta.get("created_at", ""),
                "updated": meta.get("updated_at", ""),
            })
    return kbs


def delete_kb(kb_name: str) -> bool:
    """Delete a knowledge base."""
    kb_dir = get_kb_dir(kb_name)
    if os.path.exists(kb_dir):
        shutil.rmtree(kb_dir)
        return True
    return False


def get_kb_info(kb_name: str) -> dict:
    """Get detailed info about a knowledge base."""
    meta_path = os.path.join(get_kb_dir(kb_name), "metadata.json")
    if not os.path.exists(meta_path):
        return {"error": f"Knowledge base '{kb_name}' not found"}
    with open(meta_path) as f:
        return json.load(f)


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="DeepTutor Knowledge Base Manager")
    sub = parser.add_subparsers(dest="command")

    sub.add_parser("list", help="List all knowledge bases")
    c = sub.add_parser("create", help="Create a new knowledge base")
    c.add_argument("name")
    c.add_argument("--description", default="")

    d = sub.add_parser("delete", help="Delete a knowledge base")
    d.add_argument("name")

    i = sub.add_parser("info", help="Get knowledge base info")
    i.add_argument("name")

    args = parser.parse_args()

    if args.command == "list":
        kbs = list_kbs()
        if kbs:
            for kb in kbs:
                print(f"  {kb['name']}: {kb['documents']} docs, {kb['chunks']} chunks, graph={'yes' if kb['has_graph'] else 'no'}")
        else:
            print("  No knowledge bases found.")
    elif args.command == "create":
        create_kb(args.name, args.description)
    elif args.command == "delete":
        if delete_kb(args.name):
            print(f"Deleted: {args.name}")
        else:
            print(f"Not found: {args.name}")
    elif args.command == "info":
        info = get_kb_info(args.name)
        print(json.dumps(info, indent=2))
    else:
        parser.print_help()
