from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass
class LLMResponse:
    text: str
    latency_ms: int
    input_tokens: int
    output_tokens: int


class LLMAdapter(ABC):
    @abstractmethod
    async def generate(self, prompt: str, input_text: str, model: str) -> LLMResponse:
        """Send prompt + input to the model, return the response with timing/token info."""
        raise NotImplementedError
