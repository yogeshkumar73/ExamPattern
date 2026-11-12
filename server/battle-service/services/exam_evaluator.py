"""
Custom Exam & Study Arena — Python Machine Learning Evaluator
Uses NumPy vector linear algebra and Pandas token matrices to verify and score
student written/subjective answers against reference documents and model answers.
"""

import re
import math
from typing import List, Dict, Any, Tuple
import numpy as np
import pandas as pd


class MLAnswerEvaluator:
    """
    Evaluates written subjective student answers using:
    1. Token frequency vectorization (TF-IDF style weighting via Pandas)
    2. Cosine similarity using NumPy dot products and Euclidean norms
    3. Keyword recall / essential concept coverage
    4. Confidence and accuracy scoring (0 - 100%)
    """

    def __init__(self):
        # Stop words list for cleaning
        self.stop_words = {
            "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are",
            "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but",
            "by", "could", "did", "do", "does", "doing", "down", "during", "each", "few", "for", "from",
            "further", "had", "has", "have", "having", "he", "her", "here", "hers", "herself", "him",
            "himself", "his", "how", "i", "if", "in", "into", "is", "it", "its", "itself", "just", "me",
            "more", "most", "my", "myself", "no", "nor", "not", "now", "of", "off", "on", "once", "only",
            "or", "other", "ought", "our", "ours", "ourselves", "out", "over", "own", "same", "she", "should",
            "so", "some", "such", "than", "that", "the", "their", "theirs", "them", "themselves", "then",
            "there", "these", "they", "this", "those", "through", "to", "too", "under", "until", "up",
            "very", "was", "we", "were", "what", "when", "where", "which", "while", "who", "whom", "why",
            "with", "would", "you", "your", "yours", "yourself", "yourselves"
        }

    def tokenize(self, text: str) -> List[str]:
        """Cleans and extracts meaningful tokens from text."""
        if not text:
            return []
        cleaned = re.sub(r"[^a-zA-Z0-9\s]", " ", text.lower())
        tokens = cleaned.split()
        return [t for t in tokens if len(t) > 1 and t not in self.stop_words]

    def build_vector_space(self, text_a: str, text_b: str) -> Tuple[np.ndarray, np.ndarray, List[str]]:
        """
        Builds NumPy feature vectors for text_a and text_b over the joint vocabulary.
        Uses Pandas DataFrame to count term frequencies.
        """
        tokens_a = self.tokenize(text_a)
        tokens_b = self.tokenize(text_b)

        vocab = sorted(list(set(tokens_a + tokens_b)))
        if not vocab:
            return np.zeros(1), np.zeros(1), []

        # Count frequencies using Pandas Series
        s_a = pd.Series(tokens_a).value_counts() if tokens_a else pd.Series(dtype=int)
        s_b = pd.Series(tokens_b).value_counts() if tokens_b else pd.Series(dtype=int)

        vec_a = np.array([float(s_a.get(term, 0)) for term in vocab], dtype=np.float64)
        vec_b = np.array([float(s_b.get(term, 0)) for term in vocab], dtype=np.float64)

        return vec_a, vec_b, vocab

    def cosine_similarity(self, vec_a: np.ndarray, vec_b: np.ndarray) -> float:
        """Computes cosine similarity between two NumPy vectors."""
        norm_a = np.linalg.norm(vec_a)
        norm_b = np.linalg.norm(vec_b)

        if norm_a == 0.0 or norm_b == 0.0:
            return 0.0

        similarity = float(np.dot(vec_a, vec_b) / (norm_a * norm_b))
        return max(0.0, min(1.0, similarity))

    def evaluate_answer(
        self,
        student_answer: str,
        model_answer: str,
        keywords: List[str] = None,
        max_points: int = 10
    ) -> Dict[str, Any]:
        """
        Full ML evaluation pipeline for student written answer:
        - Vector Cosine Similarity
        - Keyword Recall Coverage
        - Final Normalized Score & Feedback
        """
        if not student_answer or not student_answer.strip():
            return {
                "score": 0,
                "percentage": 0.0,
                "similarity": 0.0,
                "keywordRecall": 0.0,
                "isCorrect": False,
                "feedback": "No answer provided.",
            }

        vec_student, vec_model, vocab = self.build_vector_space(student_answer, model_answer)
        cos_sim = self.cosine_similarity(vec_student, vec_model)

        # Keyword recall analysis
        student_tokens = set(self.tokenize(student_answer))
        matched_keywords = []
        total_keywords = 0

        if keywords and len(keywords) > 0:
            total_keywords = len(keywords)
            for kw in keywords:
                kw_tokens = set(self.tokenize(kw))
                if kw_tokens and kw_tokens.issubset(student_tokens):
                    matched_keywords.append(kw)
                elif any(t in student_tokens for t in kw_tokens):
                    matched_keywords.append(kw)
        
        keyword_recall = (len(matched_keywords) / max(1, total_keywords)) if total_keywords > 0 else cos_sim

        # Weighted composite score: 60% semantic similarity + 40% keyword coverage
        composite_ratio = (cos_sim * 0.6) + (keyword_recall * 0.4)
        percentage = round(composite_ratio * 100, 1)

        # Scaled points
        earned_score = int(round(composite_ratio * max_points))
        is_correct = percentage >= 60.0

        feedback = "Excellent response covering core concepts."
        if percentage < 30.0:
            feedback = "Answer lacks critical keywords and conceptual coverage."
        elif percentage < 60.0:
            feedback = "Partially correct. Missing several key principles."
        elif percentage < 85.0:
            feedback = "Good answer! Covers majority of required principles."

        return {
            "score": earned_score,
            "maxPoints": max_points,
            "percentage": percentage,
            "similarity": round(cos_sim, 3),
            "keywordRecall": round(keyword_recall, 3),
            "matchedKeywords": matched_keywords,
            "isCorrect": is_correct,
            "feedback": feedback,
        }


evaluator = MLAnswerEvaluator()
