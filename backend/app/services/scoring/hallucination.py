import json

from app.services.llm.mistral_adapter import MistralAdapter

JUDGE_PROMPT = """You are a strict fact-checker. You will be given a CONTEXT and a RESPONSE.
Determine whether the RESPONSE contains any claims that are NOT supported by the CONTEXT.

Respond with ONLY a JSON object in this exact format, no other text:
{"hallucination_score": <float between 0.0 and 1.0>, "reasoning": "<one sentence>"}

A score of 0.0 means the response is fully supported by the context.
A score of 1.0 means the response is entirely fabricated or contradicts the context.
"""


async def score_hallucination(context: str, response_text: str) -> float:
    adapter = MistralAdapter()
    judge_input = f"CONTEXT:\n{context}\n\nRESPONSE:\n{response_text}"

    result = await adapter.generate(
        prompt=JUDGE_PROMPT,
        input_text=judge_input,
        model="mistral-small-latest",
    )

    try:
        parsed = json.loads(result.text)
        score = float(parsed["hallucination_score"])
        return max(0.0, min(1.0, score))
    except (json.JSONDecodeError, KeyError, ValueError, TypeError):
        # Judge didn't return valid JSON — fail safe with a neutral score
        # rather than crashing the whole eval run.
        return 0.5
