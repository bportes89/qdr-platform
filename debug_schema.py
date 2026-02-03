from main import OptimizationRequest
import json

print(json.dumps(OptimizationRequest.model_json_schema(), indent=2))
