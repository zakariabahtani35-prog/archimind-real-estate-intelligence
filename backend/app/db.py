from sqlalchemy import create_engine
from .core.config import settings

def get_engine():
    """
    Initializes PostgreSQL connection using SQLAlchemy.
    TODO: Define ml_schema and OBT table structures.
    """
    try:
        engine = create_engine(settings.database_url)
        return engine
    except Exception as e:
        raise RuntimeError(f"Database engine initialization failed: {e}") from e
