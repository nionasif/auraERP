# AuraTech Enterprise Python ML Service

This directory contains the standalone Python Machine Learning intelligence engine for AuraTech ERP.

## Structure & Architecture

```
ml/
├── sales_forecasting.py       # Holt-Winters Additive Double Exponential Smoothing
├── inventory_optimization.py  # Wilson EOQ (Economic Order Quantity) & Safety Stock
├── customer_clv_churn.py      # RFM Multi-Dimensional Clustering & Churn Scoring
├── ticket_nlp_classifier.py   # ITSM Helpdesk Lexical Feature Vector NLP Classifier
├── server.py                  # Standalone REST Microservice on Port 8000
├── requirements.txt           # Dependency Documentation
└── README.md                  # System Documentation
```

## Running the ML Service Independently

```bash
python server.py
# Or with specific Python path:
python.exe server.py
```

Runs on: `http://127.0.0.1:8000`

## API Endpoints

- `GET /health` : Health check and runtime information
- `GET /summary` : Status of all active ML models
- `POST /forecast-sales` : Next 24-hour demand and 7-day revenue forecasting
- `POST /smart-requisition` : EOQ and stockout prevention recommendations
- `POST /customer-clv` : RFM customer segmentation and CLV calculation
- `POST /classify-ticket` : Ticket NLP category and priority classification
