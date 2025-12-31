import os
import glob
import frontmatter
from app.core.config import settings
import chromadb

def chunk_text(text: str, max_chars: int = 1200):
    
    text.sptrip()
    chunks = []
    i = 0
    
    while i < len(text):
        chunks.append(text[i:i+max_chars])
        i += max_chars
    return chunks

def main():
    
    data_projects = os.path.join(settings.data_dir, "projects", "*.md")
    paths = glob.glob(data_projects)
    
    if not paths:
        raise SystemError(f"No markdown files found at: {data_projects}")
    
    client = chromadb.PersistentClient(path=settings.chroma_dir)
    collection = client.get_or_create_collection(settings.chroma_collection)
    
    try:
        collection.delete(where={})
    except Exception:
        pass
    
    ids, docs, metas = [], [], []
    
    for p in paths:
        
        post = frontmatter.load(p)
        meta = post.metadata
        body = post.content or ""
        
        title = meta.get("title", os.path.basename(p))
        url = meta.get("url", "")
        tags = meta.get("tags", [])
        
        full_text = f"TITLE: {title}\nTAGS: {tags}\nURL: {url}\n\n{body}"
        chunks = chunk_text(full_text)
        
        for idx, ch in enumerate(chunks):
            doc_id = f"{meta.get('slug', title).replace(' ', '-').lower()}__{idx}"
            ids.append(doc_id)
            docs.append(ch)
            metas.append({
                "title": title,
                "url": url,
                "tags": ",".join(tags) if isinstance(tags, list) else str(tags),
                "chunk": idx,
                "source_path": p,
            })
            
    collection.add(ids=ids, documents=docs, metadatas=metas)
    print(f"Indexed{len(ids)} chunks into Chroma collection '{settings.chroma_collection}'")

if __name__ == "__main__":
    main()
    