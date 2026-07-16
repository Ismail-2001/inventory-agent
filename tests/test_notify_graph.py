import pytest
from unittest.mock import AsyncMock, patch

from agent.graph import build_graph


@pytest.mark.asyncio
async def test_graph_sends_pending_notification_before_resume():
    workflow = build_graph()
    state = {
        "risk_alerts": [{"risk_level": "critical", "sku_id": 1, "reason": "Low stock"}],
        "purchase_orders": [{"po_id": 7, "quantity": 3, "total_cost": 9.0}],
    }

    with patch("agent.nodes.notify_node.httpx.AsyncClient") as client_cls:
        client = client_cls.return_value.__aenter__.return_value
        client.post = AsyncMock()

        compiled = workflow.compile(interrupt_after=["notify_pending"])
        result = await compiled.ainvoke(state, config={"recursion_limit": 10})

        assert result["notification_summary"].startswith("Inventory Risk & PO Report")
        client.post.assert_awaited_once()
        payload = client.post.await_args.kwargs["json"]
        assert "PO #7" in payload["text"]
        assert "Approve:" in payload["text"]
