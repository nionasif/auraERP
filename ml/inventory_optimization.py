"""
AuraTech Enterprise ML Core: Inventory & Requisition Optimization Model
Algorithm: Wilson Economic Order Quantity (EOQ) + Gaussian Safety Stock (95% Service Level)
"""

import math


class InventoryOptimizationModel:
    def __init__(
        self,
        ordering_cost: float = 2500.0,
        holding_rate: float = 0.18,
        service_level_z: float = 1.65,
        lead_time_days: int = 7
    ):
        self.ordering_cost = ordering_cost
        self.holding_rate = holding_rate
        self.service_level_z = service_level_z
        self.lead_time_days = lead_time_days

    def optimize(self, products: list, requisitions: list = None) -> dict:
        """
        Calculates EOQ, Reorder Point (ROP), and identifies critical stockout items.
        """
        recommendations = []

        for p in products:
            price = float(p.get("price", 1000))
            cost_price = float(p.get("costPrice", price * 0.75))
            current_stock = int(p.get("stock", 0))
            min_stock = int(p.get("minStock", 10))

            # Daily demand estimation
            daily_demand = max(1.0, min_stock / 5.0)
            annual_demand = daily_demand * 365.0
            unit_holding_cost = max(50.0, cost_price * self.holding_rate)

            # EOQ calculation: sqrt((2 * D * S) / H)
            raw_eoq = math.sqrt((2.0 * annual_demand * self.ordering_cost) / unit_holding_cost)
            eoq_units = max(5, int(round(raw_eoq)))

            # Safety Stock: Z * std_dev * sqrt(L)
            demand_std = daily_demand * 0.4
            safety_stock = int(math.ceil(self.service_level_z * demand_std * math.sqrt(self.lead_time_days)))

            # Reorder Point (ROP): (D * L) + SS
            reorder_point = int(math.ceil((daily_demand * self.lead_time_days) + safety_stock))

            is_critical = current_stock <= reorder_point
            stock_deficit = max(0, reorder_point - current_stock)
            suggested_reorder = max(stock_deficit + safety_stock, eoq_units) if is_critical else 0
            est_cost = suggested_reorder * int(cost_price)

            recommendations.append({
                "id": p.get("id"),
                "sku": p.get("sku"),
                "name": p.get("name"),
                "department": p.get("department"),
                "currentStock": current_stock,
                "safetyStock": safety_stock,
                "reorderPoint": reorder_point,
                "suggestedReorderQty": suggested_reorder,
                "estimatedCostBDT": est_cost,
                "status": "CRITICAL_STOCKOUT_RISK" if current_stock <= min_stock else ("REORDER_RECOMMENDED" if is_critical else "OPTIMAL"),
                "urgency": "HIGH" if current_stock <= min_stock else ("MEDIUM" if is_critical else "LOW")
            })

        critical_items = [r for r in recommendations if r["suggestedReorderQty"] > 0]
        total_capital = sum(r["estimatedCostBDT"] for r in critical_items)

        actionable = []
        for idx, item in enumerate(critical_items[:10]):
            actionable.append({
                "reqSeq": f"ML-REQ-PY-{(idx + 1):03d}",
                "productName": item["name"],
                "sku": item["sku"],
                "department": item["department"],
                "recommendedUnits": item["suggestedReorderQty"],
                "urgency": item["urgency"],
                "estBudgetBDT": item["estimatedCostBDT"],
                "justification": f"Current stock ({item['currentStock']}) is below Reorder Point ({item['reorderPoint']}). Order {item['suggestedReorderQty']} units to prevent stockout over {self.lead_time_days}-day lead time."
            })

        return {
            "model": "Python Wilson EOQ & Safety Stock Optimization Model (95% Service Level)",
            "leadTimeDays": self.lead_time_days,
            "totalRecommendedRequisitions": len(critical_items),
            "totalEstimatedCapitalBDT": total_capital,
            "items": recommendations,
            "actionableRequisitions": actionable
        }
