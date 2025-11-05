from starlette.config import Config

config = Config(".env")

OPENAI_API_KEY = config("OPENAI_API_KEY")
OPENAI_MODEL = config("OPENAI_MODEL")
# Default encryption key should match the one in C# appsettings.json
ENCRYPTION_KEY = config("ENCRYPTION_KEY", default="E24A3F76-87D2-4CB9-932E-C6475D7F0AB1")
