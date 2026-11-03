"""
AuraTech Enterprise ML Core: Microservice Server
Standalone HTTP REST Service running on port 8000 using Python standard library.
Zero external pip dependencies required.
"""

import json
import sys
from http.server import HTTPServer, BaseHTTPRequestHandler
from datetime import datetime

from sales_forecasting import SalesForecastingModel
from inventory_optimization import InventoryOptimizationModel
from customer_clv_churn import CustomerCLVChurnModel
from ticket_nlp_classifier import TicketNLPClassifier
from it_resource_prediction import ITResourceDemandModel
from employee_performance_ml import EmployeePerformanceAnalyticsModel

PORT = 8000
forecaster = SalesForecastingModel()
optimizer = InventoryOptimizationModel()
clv_model = CustomerCLVChurnModel()
classifier = TicketNLPClassifier()
it_resource_model = ITResourceDemandModel()
employee_perf_model = EmployeePerformanceAnalyticsModel()


class MLRequestHandler(BaseHTTPRequestHandler):
    def _send_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")

    def _send_json_response(self, data: dict, status_code: int = 200):
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self._send_cors_headers()
        self.end_headers()
        response_bytes = json.dumps(data, ensure_ascii=False, indent=2).encode("utf-8")
        self.wfile.write(response_bytes)

    def do_OPTIONS(self):
        self.send_response(204)
        self._send_cors_headers()
        self.end_headers()

    def do_GET(self):
        path = self.path.split("?")[0].rstrip("/")

        if path in ["", "/", "/health"]:
            self._send_json_response({
                "status": "ONLINE",
                "service": "AuraTech Python ML Core Microservice",
                "version": "2.4.0",
                "pythonVersion": sys.version.split()[0],
                "port": PORT,
                "timestamp": datetime.now().isoformat()
            })
        elif path in ["/summary", "/api/ml/summary"]:
            self._send_json_response({
                "status": "ACTIVE",
                "engine": "AuraTech Python Machine Learning Core v2.4",
                "runtime": f"Python {sys.version.split()[0]} Standalone",
                "services": [
                    {"id": "SALES_FORECAST", "name": "ML Feature 1: Holt-Winters Demand & Sales Forecast", "status": "ONLINE", "file": "sales_forecasting.py"},
                    {"id": "CUSTOMER_SEGMENTATION", "name": "ML Feature 2: RFM Customer Behavioral Clustering", "status": "ONLINE", "file": "customer_clv_churn.py"},
                    {"id": "CUSTOMER_CHURN", "name": "ML Feature 3: Customer Churn Risk & Retention Predictor", "status": "ONLINE", "file": "customer_clv_churn.py"},
                    {"id": "IT_RESOURCE_PREDICTION", "name": "ML Feature 4: Cloud Server CPU & RAM Demand Forecast", "status": "ONLINE", "file": "it_resource_prediction.py"},
                    {"id": "SMART_REQUISITION", "name": "Wilson EOQ & Safety Stock Inventory Optimizer", "status": "ONLINE", "file": "inventory_optimization.py"},
                    {"id": "TICKET_TRIAGE", "name": "ITSM Helpdesk Lexical NLP Classifier", "status": "ONLINE", "file": "ticket_nlp_classifier.py"},
                    {"id": "EMPLOYEE_PERFORMANCE", "name": "ML Feature 5: Employee Performance & Attendance Analytics", "status": "ONLINE", "file": "employee_performance_ml.py"}
                ],
                "timestamp": datetime.now().isoformat()
            })
        elif path in ["/forecast-sales", "/api/ml/forecast-sales"]:
            res = forecaster.forecast()
            self._send_json_response(res)
        elif path in ["/smart-requisition", "/api/ml/smart-requisition"]:
            res = optimizer.optimize([])
            self._send_json_response(res)
        elif path in ["/customer-clv", "/api/ml/customer-clv"]:
            res = clv_model.evaluate([])
            self._send_json_response(res)
        elif path in ["/it-resource-forecast", "/api/ml/it-resource-demand", "/it-resource-demand"]:
            res = it_resource_model.forecast_capacity()
            self._send_json_response(res)
        elif path in ["/employee-performance", "/api/ml/employee-performance"]:
            # Parse query params if any
            query_part = self.path.split("?", 1)[1] if "?" in self.path else ""
            query_dict = {}
            if query_part:
                from urllib.parse import parse_qs
                parsed = parse_qs(query_part)
                query_dict = {k: v[0] for k, v in parsed.items()}
            res = employee_perf_model.analyze(query_dict)
            self._send_json_response(res)
        else:
            self._send_json_response({"error": f"Endpoint '{self.path}' not found"}, 404)

    def do_POST(self):
        path = self.path.split("?")[0].rstrip("/")
        content_length = int(self.headers.get("Content-Length", 0))
        body_bytes = self.rfile.read(content_length) if content_length > 0 else b"{}"

        try:
            payload = json.loads(body_bytes.decode("utf-8")) if body_bytes else {}
        except Exception:
            payload = {}

        if path in ["/forecast-sales", "/api/ml/forecast-sales"]:
            hourly = payload.get("hourly_sales") or payload.get("hourlySales") or []
            res = forecaster.forecast(hourly)
            self._send_json_response(res)

        elif path in ["/smart-requisition", "/api/ml/smart-requisition"]:
            products = payload.get("products") or []
            reqs = payload.get("requisitions") or []
            res = optimizer.optimize(products, reqs)
            self._send_json_response(res)

        elif path in ["/customer-clv", "/api/ml/customer-clv"]:
            customers = payload.get("customers") or []
            invoices = payload.get("invoices") or []
            res = clv_model.evaluate(customers, invoices)
            self._send_json_response(res)

        elif path in ["/it-resource-forecast", "/api/ml/it-resource-demand", "/it-resource-demand"]:
            telemetry = payload.get("telemetry_history") or payload.get("telemetry") or []
            res = it_resource_model.forecast_capacity(telemetry)
            self._send_json_response(res)

        elif path in ["/classify-ticket", "/api/ml/classify-ticket"]:
            title = payload.get("title", "")
            description = payload.get("description", "")
            if not title:
                self._send_json_response({"error": "Ticket title is required"}, 400)
                return
            res = classifier.classify(title, description)
            self._send_json_response(res)

        elif path in ["/employee-performance", "/api/ml/employee-performance"]:
            res = employee_perf_model.analyze(payload)
            self._send_json_response(res)

        else:
            self._send_json_response({"error": f"POST endpoint '{self.path}' not found"}, 404)

    def log_message(self, format, *args):
        # Concise logging to standard output
        sys.stdout.write(f"[Python ML Engine :8000] {self.address_string()} - {args[0]}\n")
        sys.stdout.flush()


def run(port=PORT):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

    server_address = ("127.0.0.1", port)
    httpd = HTTPServer(server_address, MLRequestHandler)
    print(f"\n=======================================================")
    print(f"  [ML Core] AuraTech Python Machine Learning Service")
    print(f"  Running on: http://127.0.0.1:{port}")
    print(f"  Runtime: Python {sys.version.split()[0]}")
    print(f"  Models: sales_forecasting, inventory_optimization,")
    print(f"          customer_clv_churn, ticket_nlp_classifier")
    print(f"=======================================================\n")
    sys.stdout.flush()
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n[Python ML Engine] Shutting down gracefully...")
        httpd.server_close()


if __name__ == "__main__":
    run()
