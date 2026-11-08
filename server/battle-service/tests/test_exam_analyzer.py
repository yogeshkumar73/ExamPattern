"""
Unit & Integration Tests for Exam Pattern Analyzer Engine.
Tests:
- PDF / text parsing
- Syllabus unit & topic extraction
- Multi-paper question segmentation
- TF-IDF topic mapping with confidence scoring
- Pandas & NumPy pattern analysis and topic ranking
- Practice question generation with model answers, rubrics, and disclaimers
- Chronological backtesting evaluation
"""

import pytest
from services.exam_analyzer.syllabus_analyzer import analyze_syllabus
from services.exam_analyzer.question_extractor import extract_questions_from_paper
from services.exam_analyzer.topic_mapper import map_questions_to_topics
from services.exam_analyzer.pattern_analyzer import analyze_patterns_and_rank_topics
from services.exam_analyzer.question_generator import generate_predicted_suite
from services.exam_analyzer.models import AnalysisConfig
from routes.exam_analyzer import run_full_analysis, FullAnalysisRequest, HistoricalPaperInput


SAMPLE_SYLLABUS = """
Course: Computer Systems Architecture
Unit 1: Central Processing Unit & Instruction Sets
Instruction cycle, Addressing modes, Register organization, Instruction formats, RISC vs CISC architectures.

Unit 2: Memory Hierarchy & Cache Design
Memory hierarchy, Cache memory mapping, Cache replacement algorithms, Virtual memory, Paging and segmentation.

Unit 3: Input-Output Organization & Interrupts
I/O interfaces, Programmed I/O, Interrupt driven I/O, Direct Memory Access (DMA), Bus arbitration.

Unit 4: Pipelining & Vector Processing
Parallel processing, Instruction pipelining, Pipeline hazards (data, control, structural), Vector operations.
"""

PAPER_2023 = """
END SEMESTER EXAMINATION 2023
Subject: Computer Systems Architecture | Time: 3 Hours | Max Marks: 50

Q1. Explain the various addressing modes with suitable examples. [5 Marks]
Q2. Differentiate between RISC and CISC architectures. [5 Marks]
Q3. Describe direct memory access (DMA) transfer mechanism and bus arbitration. [10 Marks]
Q4. What is cache memory? Explain direct and set-associative cache mapping. [10 Marks]
Q5. Discuss instruction pipelining and explain how data hazards are resolved. [10 Marks]
"""

PAPER_2024 = """
END SEMESTER EXAMINATION 2024
Subject: Computer Systems Architecture | Time: 3 Hours | Max Marks: 50

Q1. Define instruction cycle and explain fetch, decode, execute phases. [5 Marks]
Q2. Explain cache replacement algorithms (LRU, FIFO, Optimal). [5 Marks]
Q3. Discuss virtual memory and explain page fault handling in detail. [10 Marks]
Q4. Explain Direct Memory Access (DMA) controller architecture and operation. [10 Marks]
Q5. What are pipeline hazards? Explain structural and control hazard mitigation. [10 Marks]
"""

PAPER_2025 = """
END SEMESTER EXAMINATION 2025
Subject: Computer Systems Architecture | Time: 3 Hours | Max Marks: 50

Q1. Explain register organization and stack-based CPU architecture. [5 Marks]
Q2. Explain cache mapping techniques with numerical examples. [10 Marks]
Q3. What is direct memory access (DMA)? Compare programmed I/O with interrupt I/O. [10 Marks]
Q4. Explain structural, data, and control pipeline hazards with timing diagrams. [10 Marks]
Q5. Discuss vector processing principles and array processors. [5 Marks]
"""


def test_syllabus_analysis():
    topics = analyze_syllabus(SAMPLE_SYLLABUS)
    assert len(topics) >= 8
    topic_names = [t.topicName.lower() for t in topics]
    assert any("cache" in t for t in topic_names)
    assert any("pipelining" in t or "pipeline" in t for t in topic_names)
    assert any("addressing" in t for t in topic_names)
    assert all(t.unitNumber > 0 for t in topics)


def test_question_extraction():
    questions_2023 = extract_questions_from_paper(PAPER_2023, academic_year=2023)
    assert len(questions_2023) >= 5
    assert questions_2023[0].marks in [5, 10]
    assert questions_2023[0].academicYear == 2023
    assert questions_2023[0].questionNumber.startswith("Q")


def test_topic_mapping():
    topics = analyze_syllabus(SAMPLE_SYLLABUS)
    questions = extract_questions_from_paper(PAPER_2023, academic_year=2023)
    mapped = map_questions_to_topics(questions, topics, confidence_threshold=0.50)
    
    assert len(mapped) == len(questions)
    for q in mapped:
        assert len(q.topicIds) > 0
        assert q.mappingConfidence >= 0.0


def test_pattern_analysis_and_ranking():
    topics = analyze_syllabus(SAMPLE_SYLLABUS)
    q1 = extract_questions_from_paper(PAPER_2023, academic_year=2023)
    q2 = extract_questions_from_paper(PAPER_2024, academic_year=2024)
    q3 = extract_questions_from_paper(PAPER_2025, academic_year=2025)
    all_qs = q1 + q2 + q3
    mapped = map_questions_to_topics(all_qs, topics)

    config = AnalysisConfig(targetYear=2026, questionCount=10)
    metrics, eval_data = analyze_patterns_and_rank_topics(topics, mapped, config)

    assert len(metrics) == len(topics)
    # Ranked descending by priority score
    scores = [m.priorityScore for m in metrics]
    assert scores == sorted(scores, reverse=True)
    # Highest ranked topics must have evidence explanations
    assert len(metrics[0].scoreExplanation) > 0
    assert metrics[0].priorityScore > 0


def test_question_generator_with_rubrics_and_disclaimer():
    topics = analyze_syllabus(SAMPLE_SYLLABUS)
    q1 = extract_questions_from_paper(PAPER_2023, academic_year=2023)
    mapped = map_questions_to_topics(q1, topics)
    config = AnalysisConfig(targetYear=2026, questionCount=6, formats=["mcq", "written"])
    metrics, _ = analyze_patterns_and_rank_topics(topics, mapped, config)

    predictions = generate_predicted_suite(metrics, config)
    assert len(predictions) > 0
    
    # Must have both MCQs and Written
    mcqs = [p for p in predictions if p.questionType == "mcq"]
    writtens = [p for p in predictions if p.questionType == "written"]
    assert len(mcqs) > 0
    assert len(writtens) > 0

    # MCQs must have options and correct answer
    for m in mcqs:
        assert len(m.options) == 4
        assert m.correctAnswer in m.options
        assert m.disclaimer == "Estimated practice question; not a guaranteed exam question."

    # Written must have model answers and rubric checks
    for w in writtens:
        assert w.modelAnswer is not None
        assert len(w.rubricChecks) >= 2
        assert w.verificationStatus in ["passed", "needs_review"]
        assert w.disclaimer == "Estimated practice question; not a guaranteed exam question."


def test_full_analysis_pipeline_integration():
    req = FullAnalysisRequest(
        syllabusText=SAMPLE_SYLLABUS,
        papers=[
            HistoricalPaperInput(paperName="Exam 2023", academicYear=2023, text=PAPER_2023),
            HistoricalPaperInput(paperName="Exam 2024", academicYear=2024, text=PAPER_2024),
            HistoricalPaperInput(paperName="Exam 2025", academicYear=2025, text=PAPER_2025),
        ],
        targetYear=2026,
        questionCount=8,
        difficulty="Standard",
        formats=["mcq", "written"]
    )
    result = run_full_analysis(req)
    assert result["success"] is True
    assert "topics" in result
    assert "predictedQuestions" in result
    assert len(result["predictedQuestions"]["mcq"]) > 0
    assert len(result["predictedQuestions"]["written"]) > 0
    assert "report" in result
    assert result["report"]["summary"]["historicalPapersAnalyzed"] == 3
