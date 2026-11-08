"""
Report Generation Service for Exam Pattern Analyzer.
Builds the comprehensive analysis report payload (conforming to Section 10 of Blueprint)
containing executive summary, methodology, topic rankings with evidence,
predicted exam suite with rubric checks, and evaluation disclaimers.
"""

from typing import Dict, Any, List
from .models import AnalysisRecord, PredictionRecord, TopicMetricRecord


def generate_analysis_report(
    analysis: AnalysisRecord,
    predictions: List[PredictionRecord]
) -> Dict[str, Any]:
    """
    Creates the complete analysis report dictionary.
    """
    mcqs = [p.model_dump() for p in predictions if p.questionType == "mcq"]
    writtens = [p.model_dump() for p in predictions if p.questionType in ["written", "short", "long"]]

    report = {
        "reportId": f"rep_{analysis.id}",
        "analysisId": analysis.id,
        "createdAt": analysis.createdAt,
        "targetYear": analysis.config.targetYear,
        "paperFormat": analysis.config.paperFormat,
        "difficulty": analysis.config.difficulty,
        "summary": {
            "totalTopicsIdentified": len(analysis.topicMetrics),
            "historicalPapersAnalyzed": len(analysis.paperIds),
            "yearsIncluded": analysis.yearsSpan,
            "totalQuestionsAnalyzed": analysis.totalQuestionsAnalyzed,
            "syllabusCoveragePct": analysis.syllabusCoveragePct,
            "evaluationMetrics": analysis.evaluationMetrics
        },
        "methodology": {
            "engine": "Aura Study AI Tabular Pattern Analysis (Pandas + NumPy)",
            "weights": {
                "appearanceRate": "30%",
                "recencyScore": "20%",
                "marksWeight": "20%",
                "trendSlope": "15%",
                "syllabusCoverage": "15%"
            },
            "disclaimer": "Scores represent an estimated priority index (0-100) based on historical statistical patterns, not guaranteed examination occurrences."
        },
        "rankedTopics": [m.model_dump() for m in analysis.topicMetrics],
        "predictedPracticeSuite": {
            "objectiveMcqs": mcqs,
            "subjectiveWritten": writtens,
            "totalGenerated": len(predictions)
        }
    }
    return report
