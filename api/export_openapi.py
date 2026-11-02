import json
from pathlib import Path

from app.main import app

contract_path = Path(__file__).resolve().parents[1] / "contracts" / "openapi.json"
contract_path.parent.mkdir(parents=True, exist_ok=True)
contract_path.write_text(json.dumps(app.openapi(), ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"Wrote {contract_path}")
