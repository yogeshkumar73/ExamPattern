"""
Topic Mapper Service.
Maps extracted questions to syllabus topics using scikit-learn TF-IDF + Cosine Similarity
and keyword frequency overlap. Computes mapping confidence and flags uncertain mappings.
"""

from typing import List, Tuple

try:
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False
    TfidfVectorizer = None  # type: ignore
    cosine_similarity = None  # type: ignore

from .models import SyllabusTopicRecord, ExtractedQuestionRecord


def map_questions_to_topics(
    questions: List[ExtractedQuestionRecord],
    topics: List[SyllabusTopicRecord],
    confidence_threshold: float = 0.65
) -> List[ExtractedQuestionRecord]:
    """
    Computes semantic and keyword mappings between questions and syllabus topics.
    Returns the updated questions list with assigned topicIds and mappingConfidence.
    """
    if not questions or not topics:
        return questions

    # Prepare topic corpus for TF-IDF
    topic_corpus = []
    for t in topics:
        # Combine topic name, keywords, and unit title for richer context
        rep = f"{t.topicName} {' '.join(t.keywords)} {t.unitTitle}"
        topic_corpus.append(rep)

    question_texts = [q.questionText for q in questions]

    try:
        if not SKLEARN_AVAILABLE or TfidfVectorizer is None or cosine_similarity is None:
            raise ImportError("scikit-learn not available, using pure keyword matcher")
        vectorizer = TfidfVectorizer(stop_words="english", max_features=1500)
        # Fit on combined corpus
        combined = topic_corpus + question_texts
        tfidf_matrix = vectorizer.fit_transform(combined)

        topic_vecs = tfidf_matrix[:len(topics)]
        question_vecs = tfidf_matrix[len(topics):]

        sim_matrix = cosine_similarity(question_vecs, topic_vecs)

        for q_idx, q in enumerate(questions):
            sims = sim_matrix[q_idx]
            best_topic_idx = int(sims.argmax())
            best_score = float(sims[best_topic_idx])

            # Also check direct keyword overlap bonus
            q_lower = q.questionText.lower()
            keyword_bonus = 0.0
            for kw in topics[best_topic_idx].keywords:
                if kw in q_lower:
                    keyword_bonus += 0.08
            
            final_conf = min(1.0, round(best_score + keyword_bonus, 3))

            matched_topic = topics[best_topic_idx]
            q.topicIds = [matched_topic.id]
            q.topicNames = [matched_topic.topicName]
            q.mappingConfidence = final_conf
            q.needsHumanReview = final_conf < confidence_threshold

    except Exception:
        # Fallback simple keyword matching if vectorizer encounters singular terms
        for q in questions:
            q_lower = q.questionText.lower()
            best_topic = None
            best_overlap = 0

            for t in topics:
                overlap = sum(1 for kw in t.keywords if kw in q_lower)
                if t.topicName.lower() in q_lower:
                    overlap += 3
                if overlap > best_overlap:
                    best_overlap = overlap
                    best_topic = t

            if best_topic and best_overlap > 0:
                conf = min(0.95, round(0.4 + best_overlap * 0.15, 2))
                q.topicIds = [best_topic.id]
                q.topicNames = [best_topic.topicName]
                q.mappingConfidence = conf
                q.needsHumanReview = conf < confidence_threshold
            else:
                # Assign first topic with low confidence for human review
                fallback = topics[0]
                q.topicIds = [fallback.id]
                q.topicNames = [fallback.topicName]
                q.mappingConfidence = 0.35
                q.needsHumanReview = True

    return questions
