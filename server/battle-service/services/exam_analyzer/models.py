"""
Pydantic Schemas and MongoDB Document Models for Exam Pattern Analyzer.
Conforms strictly to Section 7 of the Blueprint.
"""

from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field
import time
import uuid


class DocumentRecord(BaseModel):
    id: str = Field(default_factory=lambda: f"doc_{uuid.uuid4().hex[:12]}")
    ownerId: Optional[str] = "guest"
    subject: str = "General Subject"
    documentType: Literal["syllabus", "historical_paper"] = "historical_paper"
    originalName: str = "document.pdf"
    storageKey: Optional[str] = None
    sha256: Optional[str] = None
    fileSizeBytes: int = 0
    status: Literal["uploaded", "processing", "processed", "failed"] = "processed"
    academicYear: Optional[int] = None
    extractedText: str = ""
    pageCount: int = 1
    createdAt: float = Field(default_factory=time.time)


class SyllabusTopicRecord(BaseModel):
    id: str = Field(default_factory=lambda: f"top_{uuid.uuid4().hex[:8]}")
    syllabusId: Optional[str] = None
    ownerId: Optional[str] = "guest"
    unitNumber: int = 1
    unitTitle: str = "Unit 1"
    topicName: str
    normalizedName: str
    keywords: List[str] = Field(default_factory=list)
    importance: float = 5.0
    createdAt: float = Field(default_factory=time.time)


class ExtractedQuestionRecord(BaseModel):
    id: str = Field(default_factory=lambda: f"q_{uuid.uuid4().hex[:8]}")
    paperId: Optional[str] = None
    ownerId: Optional[str] = "guest"
    academicYear: int = 2025
    questionNumber: str = "Q1"
    questionText: str
    marks: int = 5
    questionType: Literal["mcq", "short", "long", "written"] = "written"
    topicIds: List[str] = Field(default_factory=list)
    topicNames: List[str] = Field(default_factory=list)
    mappingConfidence: float = 0.85
    needsHumanReview: bool = False
    textHash: Optional[str] = None
    createdAt: float = Field(default_factory=time.time)


class TopicMetricRecord(BaseModel):
    topicId: str
    topicName: str
    unitTitle: Optional[str] = "Unit 1"
    papersAppeared: int = 0
    totalPapers: int = 1
    appearanceRate: float = 0.0
    totalMarks: int = 0
    marksSharePct: float = 0.0
    recentTrend: float = 0.0
    recencyScore: float = 0.0
    similarityClusterCount: int = 0
    syllabusCoverageScore: float = 0.0
    priorityScore: float = 0.0
    scoreExplanation: List[str] = Field(default_factory=list)


class AnalysisConfig(BaseModel):
    targetYear: int = 2026
    questionCount: int = 10
    difficulty: Literal["Easy", "Medium", "Hard", "Foundation", "Standard", "Advanced"] = "Standard"
    paperFormat: str = "Standard"
    formats: List[str] = Field(default_factory=lambda: ["mcq", "written"])
    requirements: Optional[str] = None
    hybridMode: bool = True


class RubricCheck(BaseModel):
    criterion: str
    result: bool = True
    comment: Optional[str] = None


class GeneratedAnswerRecord(BaseModel):
    id: str = Field(default_factory=lambda: f"ans_{uuid.uuid4().hex[:8]}")
    predictionId: Optional[str] = None
    answerText: str
    referenceSources: List[str] = Field(default_factory=list)
    rubricChecks: List[RubricCheck] = Field(default_factory=list)
    verificationStatus: Literal["passed", "needs_review", "failed"] = "passed"
    createdAt: float = Field(default_factory=time.time)


class PredictionRecord(BaseModel):
    id: str = Field(default_factory=lambda: f"pred_{uuid.uuid4().hex[:8]}")
    analysisId: Optional[str] = None
    ownerId: Optional[str] = "guest"
    topicId: Optional[str] = None
    topicName: str = ""
    unitTitle: Optional[str] = ""
    questionText: str
    questionType: Literal["mcq", "written", "short", "long"] = "mcq"
    marks: int = 1
    difficulty: str = "Medium"
    options: Optional[List[str]] = None
    correctAnswer: Optional[str] = None
    explanation: Optional[str] = None
    estimatedPriorityScore: float = 75.0
    modelAnswer: Optional[str] = None
    rubricChecks: List[RubricCheck] = Field(default_factory=list)
    verificationStatus: Literal["passed", "needs_review", "failed"] = "passed"
    referenceSources: List[str] = Field(default_factory=list)
    sourceEvidence: List[str] = Field(default_factory=list)
    disclaimer: str = "Estimated practice question; not a guaranteed exam question."
    createdAt: float = Field(default_factory=time.time)


class AnalysisRecord(BaseModel):
    id: str = Field(default_factory=lambda: f"ana_{uuid.uuid4().hex[:10]}")
    ownerId: Optional[str] = "guest"
    syllabusId: Optional[str] = None
    paperIds: List[str] = Field(default_factory=list)
    config: AnalysisConfig = Field(default_factory=AnalysisConfig)
    topicMetrics: List[TopicMetricRecord] = Field(default_factory=list)
    status: Literal["pending", "processing", "completed", "failed"] = "completed"
    totalQuestionsAnalyzed: int = 0
    yearsSpan: List[int] = Field(default_factory=list)
    syllabusCoveragePct: float = 0.0
    evaluationMetrics: Dict[str, Any] = Field(default_factory=dict)
    createdAt: float = Field(default_factory=time.time)
