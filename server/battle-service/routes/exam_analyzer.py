"""
Exam Pattern Analyzer API Router.
Conforms strictly to Section 10 of the Blueprint.
"""

from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Body, status
from pydantic import BaseModel, Field

from services.exam_analyzer.models import (
    DocumentRecord,
    SyllabusTopicRecord,
    ExtractedQuestionRecord,
    AnalysisConfig,
    AnalysisRecord,
    PredictionRecord
)
from services.exam_analyzer.pdf_parser import extract_text_from_pdf_bytes, clean_extracted_text
from services.exam_analyzer.syllabus_analyzer import analyze_syllabus
from services.exam_analyzer.question_extractor import extract_questions_from_paper
from services.exam_analyzer.topic_mapper import map_questions_to_topics
from services.exam_analyzer.pattern_analyzer import analyze_patterns_and_rank_topics
from services.exam_analyzer.question_generator import generate_predicted_suite
from services.exam_analyzer.report_service import generate_analysis_report
from utils.logger import get_logger

logger = get_logger("exam-analyzer-routes")
router = APIRouter(prefix="/api/v1", tags=["Exam Pattern Analyzer"])

# In-memory store for quick MVP retrieval & persistence cache
_DOCUMENTS_CACHE: Dict[str, DocumentRecord] = {}
_ANALYSES_CACHE: Dict[str, AnalysisRecord] = {}
_PREDICTIONS_CACHE: Dict[str, List[PredictionRecord]] = {}


# ── Request / Response DTOs ──────────────────────────────────────────────────
class ParseDocumentRequest(BaseModel):
    text: Optional[str] = None
    subject: str = "General Subject"
    documentType: str = "historical_paper" # syllabus | historical_paper
    originalName: str = "document.txt"
    academicYear: Optional[int] = 2025
    ownerId: str = "guest"


class ExtractSyllabusRequest(BaseModel):
    syllabusText: str
    syllabusId: Optional[str] = "syl_1"
    ownerId: str = "guest"


class ExtractPaperRequest(BaseModel):
    paperText: str
    academicYear: int = 2025
    paperId: Optional[str] = "paper_1"
    ownerId: str = "guest"


class HistoricalPaperInput(BaseModel):
    id: Optional[str] = None
    paperName: Optional[str] = "Paper"
    academicYear: int = 2025
    text: str


class FullAnalysisRequest(BaseModel):
    syllabusText: str
    papers: Optional[List[HistoricalPaperInput]] = None
    # Support backward compatibility with single text string
    samplePaperText: Optional[str] = None
    targetYear: int = 2026
    questionCount: int = 10
    difficulty: str = "Standard"
    paperFormat: str = "Standard"
    formats: List[str] = Field(default_factory=lambda: ["mcq", "written"])
    requirements: Optional[str] = None
    hybridMode: bool = True
    ownerId: str = "guest"


# ── Endpoints ────────────────────────────────────────────────────────────────

@router.post("/documents/upload", status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    documentType: str = Form("historical_paper"),
    subject: str = Form("General Subject"),
    academicYear: Optional[int] = Form(None),
    ownerId: str = Form("guest")
):
    """Uploads and parses a PDF or text document."""
    try:
        contents = await file.read()
        filename = file.filename or "upload.pdf"
        
        if filename.lower().endswith(".pdf"):
            parsed = extract_text_from_pdf_bytes(contents)
            text = parsed["text"]
            page_count = parsed["pageCount"]
        else:
            text = clean_extracted_text(contents.decode("utf-8", errors="ignore"))
            page_count = 1

        doc_record = DocumentRecord(
            ownerId=ownerId,
            subject=subject,
            documentType="syllabus" if documentType == "syllabus" else "historical_paper",
            originalName=filename,
            fileSizeBytes=len(contents),
            status="processed",
            academicYear=academicYear,
            extractedText=text,
            pageCount=page_count
        )
        _DOCUMENTS_CACHE[doc_record.id] = doc_record

        return {
            "success": True,
            "document": doc_record.model_dump()
        }
    except Exception as e:
        logger.error(f"Upload error: {e}")
        raise HTTPException(status_code=400, detail=f"Failed to process file: {str(e)}")


@router.post("/syllabus/extract")
def extract_syllabus_topics(req: ExtractSyllabusRequest):
    """Extracts structured units and topics from syllabus text."""
    if not req.syllabusText.strip():
        raise HTTPException(status_code=400, detail="Syllabus text is required.")
    topics = analyze_syllabus(req.syllabusText, syllabus_id=req.syllabusId or "syl_1", owner_id=req.ownerId)
    return {
        "success": True,
        "totalTopics": len(topics),
        "topics": [t.model_dump() for t in topics]
    }


@router.post("/papers/extract-questions")
def extract_paper_questions(req: ExtractPaperRequest):
    """Extracts questions, marks, year, and type from paper text."""
    if not req.paperText.strip():
        raise HTTPException(status_code=400, detail="Paper text is required.")
    questions = extract_questions_from_paper(
        req.paperText,
        academic_year=req.academicYear,
        paper_id=req.paperId or "paper_1",
        owner_id=req.ownerId
    )
    return {
        "success": True,
        "totalQuestions": len(questions),
        "questions": [q.model_dump() for q in questions]
    }


@router.post("/analysis/run")
def run_full_analysis(req: FullAnalysisRequest):
    """
    Executes the full pipeline conforming to Section 8 & 9 of Blueprint:
    1. Extract syllabus units & topics
    2. Extract historical questions across all uploaded papers & years
    3. Map questions to syllabus topics with TF-IDF cosine similarity & confidence scoring
    4. Compute Pandas & NumPy features (appearance rate, marks share, recency, trend slope)
    5. Rank topics with configurable weighted scoring formula and evidence explanations
    6. Generate topic-aligned practice suite with model answers, rubrics, and disclaimers
    7. Return full structured analysis and report payload
    """
    if not req.syllabusText or not req.syllabusText.strip():
        raise HTTPException(status_code=400, detail="Official Syllabus is required for pattern analysis.")

    # 1. Syllabus Topics
    topics = analyze_syllabus(req.syllabusText, owner_id=req.ownerId)
    if not topics:
        raise HTTPException(status_code=422, detail="Unable to extract meaningful topics from provided syllabus text.")

    # 2. Historical Papers & Questions
    all_questions: List[ExtractedQuestionRecord] = []
    paper_ids: List[str] = []

    if req.papers and len(req.papers) > 0:
        for idx, p in enumerate(req.papers):
            p_id = p.id or f"paper_{idx + 1}"
            paper_ids.append(p_id)
            extracted = extract_questions_from_paper(
                p.text,
                academic_year=p.academicYear,
                paper_id=p_id,
                owner_id=req.ownerId
            )
            all_questions.extend(extracted)
    elif req.samplePaperText and req.samplePaperText.strip():
        # Fallback single paper
        paper_ids.append("paper_legacy")
        extracted = extract_questions_from_paper(
            req.samplePaperText,
            academic_year=2025,
            paper_id="paper_legacy",
            owner_id=req.ownerId
        )
        all_questions.extend(extracted)

    # 3. Topic Mapping with scikit-learn TF-IDF
    if all_questions:
        all_questions = map_questions_to_topics(all_questions, topics, confidence_threshold=0.65)

    # 4 & 5. Pattern Analysis & Ranking with Pandas / NumPy
    config = AnalysisConfig(
        targetYear=req.targetYear,
        questionCount=req.questionCount,
        difficulty=req.difficulty,  # type: ignore
        paperFormat=req.paperFormat,
        formats=req.formats,
        requirements=req.requirements,
        hybridMode=req.hybridMode
    )

    topic_metrics, eval_metrics = analyze_patterns_and_rank_topics(topics, all_questions, config)

    # 6. Question Generation with Model Answers & Rubrics
    predictions = generate_predicted_suite(
        topic_metrics,
        config,
        historical_questions=all_questions,
        owner_id=req.ownerId
    )

    # Years span
    years_span = sorted(list(set(q.academicYear for q in all_questions if q.academicYear)))
    coverage_pct = round((sum(1 for m in topic_metrics if m.papersAppeared > 0) / max(1, len(topics))) * 100, 1)

    analysis_record = AnalysisRecord(
        ownerId=req.ownerId,
        paperIds=paper_ids,
        config=config,
        topicMetrics=topic_metrics,
        status="completed",
        totalQuestionsAnalyzed=len(all_questions),
        yearsSpan=years_span,
        syllabusCoveragePct=coverage_pct,
        evaluationMetrics=eval_metrics
    )

    _ANALYSES_CACHE[analysis_record.id] = analysis_record
    _PREDICTIONS_CACHE[analysis_record.id] = predictions

    # 7. Generate Full Report
    report = generate_analysis_report(analysis_record, predictions)

    # Build backward-compatible fields so current frontend components display immediately
    mcqs = [
        {
            "question": p.questionText,
            "options": p.options or ["Option A", "Option B", "Option C", "Option D"],
            "correctAnswer": p.correctAnswer or (p.options[0] if p.options else "Option A"),
            "explanation": p.explanation or "Standard syllabus concept.",
            "difficulty": p.difficulty,
            "marks": p.marks,
            "disclaimer": p.disclaimer,
            "sourceEvidence": p.sourceEvidence
        }
        for p in predictions if p.questionType == "mcq"
    ]

    writtens = [
        {
            "question": p.questionText,
            "marks": p.marks,
            "difficulty": p.difficulty,
            "modelAnswer": p.modelAnswer or "Model answer based on syllabus specifications.",
            "rubricChecks": [r.model_dump() for r in p.rubricChecks],
            "referenceSources": p.referenceSources,
            "verificationStatus": p.verificationStatus,
            "disclaimer": p.disclaimer,
            "sourceEvidence": p.sourceEvidence
        }
        for p in predictions if p.questionType in ["written", "short", "long"]
    ]

    topics_for_ui = [
        {
            "name": m.topicName,
            "unit": m.unitTitle,
            "frequency": m.papersAppeared,
            "totalPapers": m.totalPapers,
            "importance": round(m.priorityScore / 10.0, 1),
            "priorityScore": m.priorityScore,
            "probabilityMatch": int(m.priorityScore),
            "totalMarks": m.totalMarks,
            "marksSharePct": m.marksSharePct,
            "recentTrend": m.recentTrend,
            "recencyScore": m.recencyScore,
            "similarityClusters": m.similarityClusterCount,
            "scoreExplanation": m.scoreExplanation
        }
        for m in topic_metrics
    ]

    patterns_for_ui = [
        {
            "pattern": f"Top Priority: {topic_metrics[0].topicName}",
            "description": f"Highest priority score ({topic_metrics[0].priorityScore}/100) based on {topic_metrics[0].scoreExplanation[0]}."
        } if topic_metrics else {"pattern": "Analysis Complete", "description": "Syllabus topics analyzed successfully."}
    ]

    if len(topic_metrics) > 1:
        patterns_for_ui.append({
            "pattern": f"Upward Trend: {topic_metrics[1].topicName}",
            "description": f"Priority score: {topic_metrics[1].priorityScore}/100. {topic_metrics[1].scoreExplanation[1] if len(topic_metrics[1].scoreExplanation) > 1 else 'Consistent exam pattern.'}"
        })

    return {
        "success": True,
        "analysisId": analysis_record.id,
        "extractedText": req.syllabusText[:500] + ("..." if len(req.syllabusText) > 500 else ""),
        "topics": topics_for_ui,
        "patterns": patterns_for_ui,
        "predictedQuestions": {
            "mcq": mcqs,
            "written": writtens
        },
        "report": report
    }


@router.get("/reports/{analysisId}")
def get_report(analysisId: str):
    """Retrieves full analysis report."""
    analysis = _ANALYSES_CACHE.get(analysisId)
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis report not found.")
    predictions = _PREDICTIONS_CACHE.get(analysisId, [])
    report = generate_analysis_report(analysis, predictions)
    return {
        "success": True,
        "report": report
    }
