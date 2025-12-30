from app.schemas.chat import QueryRequest, QueryResponse, Link

def answer_with_rag(req: QueryRequest) -> QueryResponse:
    
    # Step 1 of the response:
    # Placeholder for now
    # Replace with retrieval + LLM logic later
    
    return QueryResponse(
        answer = f"[{req.mode} mode] Placeholder answer for: {req.question}",
        recommended_links = [Link(title="Projects", url="/projects/")],
        suggested_questions = ["Show me your best 3 projects", "What is your tech stack?"],
        mode_used = req.mode
    )