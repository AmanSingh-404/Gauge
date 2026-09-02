import math

from tenacity import retry, stop_after_attempt, wait_exponential

from app.core.config import get_settings
from app.services.llm.mistral_adapter import MistralAdapter

settings = get_settings()


def _cosine_similarity(vec_a: list[float], vec_b: list[float]) -> float:
    dot_product = sum(a * b for a, b in zip(vec_a, vec_b))
    magnitude_a = math.sqrt(sum(a * a for a in vec_a))
    magnitude_b = math.sqrt(sum(b * b for b in vec_b))
    if magnitude_a == 0 or magnitude_b == 0:
        return 0.0
    return dot_product / (magnitude_a * magnitude_b)


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    reraise=True,
)
async def score_correctness(expected_output: str, actual_output: str) -> float:
    adapter = MistralAdapter()
    response = await adapter.client.embeddings.create_async(
        model="mistral-embed",
        inputs=[expected_output, actual_output],
    )
    embedding_expected = response.data[0].embedding
    embedding_actual = response.data[1].embedding

    similarity = _cosine_similarity(embedding_expected, embedding_actual)
    # Cosine similarity ranges roughly -1 to 1; clamp to 0-1 for a clean score
    return max(0.0, min(1.0, similarity))
