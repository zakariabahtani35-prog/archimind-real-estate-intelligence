import pickle
import logging
from pathlib import Path
from typing import Any, Optional

from .core.config import settings


logger = logging.getLogger(__name__)


def load_model(path: Path) -> Optional[Any]:
    """
    Loads a .pkl model from the specified path.
    TODO: Integrate MLFlow or Cloud Storage for production model registry.
    """
    if path.exists():
        try:
            with open(path, 'rb') as f:
                return pickle.load(f)
        except Exception as e:
            logger.warning("Error loading model at %s: %s", path, e)
            return None
    return None

class ModelLoader:
    def __init__(self):
        self.price_model = load_model(settings.price_model_path)
        self.classification_model = load_model(settings.classification_model_path)
        
        if not self.price_model:
            logger.warning("Regression model not found at %s. Using fallback heuristics.", settings.price_model_path)
        if not self.classification_model:
            logger.warning(
                "Classification model not found at %s. Using fallback heuristics.",
                settings.classification_model_path,
            )

loader = ModelLoader()
