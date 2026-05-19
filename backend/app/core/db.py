from __future__ import annotations

from typing import Any

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

from backend.app.core.config import settings

database_url = settings.resolved_database_url
connect_args = {"check_same_thread": False} if database_url.startswith("sqlite") else {}

engine = create_engine(database_url, connect_args=connect_args, pool_pre_ping=True, future=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def check_database_connection() -> dict[str, Any]:
    with engine.connect() as connection:
        row = connection.execute(
            text(
                """
                SELECT
                    current_database() AS database,
                    current_user AS username,
                    inet_server_addr()::text AS host,
                    inet_server_port() AS port
                """
            )
        ).mappings().one()
    return {
        "status": "ok",
        "database": row["database"],
        "username": row["username"],
        "host": row["host"],
        "port": row["port"],
    }
