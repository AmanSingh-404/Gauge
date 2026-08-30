import time

from mistralai.client import Mistral

from app.core.config import get_settings
from app.services.llm.base import LLMAdapter, LLMResponse

settings = get_settings()


class MistralAdapter(LLMAdapter):
    def __init__(self) -> None:
        self.client = Mistral(api_key=settings.mistral_api_key)

    async def generate(self, prompt: str, input_text: str, model: str) -> LLMResponse:
        start = time.perf_counter()

        response = await self.client.chat.complete_async(
            model=model,
            messages=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": input_text},
            ],
        )

        latency_ms = int((time.perf_counter() - start) * 1000)
        choice = response.choices[0]

        return LLMResponse(
            text=choice.message.content,
            latency_ms=latency_ms,
            input_tokens=response.usage.prompt_tokens,
            output_tokens=response.usage.completion_tokens,
        )
