from setuptools import setup, find_packages

setup(
    name="report-sys",
    version="0.1",
    packages=find_packages(),
    install_requires=[
        "fastapi",
        "uvicorn",
        "sqlalchemy",
        "alembic",
        "psycopg2-binary",
    ],
)
