import base64
import hashlib
import hmac
import json

from fastapi import HTTPException, Request
from sqlalchemy import select

from agent.config import settings
from agent.db import async_session_factory
from agent.models import Sku
from agent.shopify_sync import sync_products_and_inventory


async def verify_shopify_webhook(request: Request):
    body = await request.body()
    hmac_header = request.headers.get("X-Shopify-Hmac-Sha256", "")
    if not hmac_header:
        raise HTTPException(status_code=401, detail="Missing HMAC header")

    secret = settings.shopify_webhook_secret.encode() if settings.shopify_webhook_secret else b""
    if not secret:
        raise HTTPException(status_code=401, detail="Webhook secret not configured")

    expected_sig = base64.b64encode(
        hmac.new(secret, body, hashlib.sha256).digest()
    ).decode()

    if not hmac.compare_digest(expected_sig, hmac_header):
        raise HTTPException(status_code=401, detail="Invalid HMAC signature")

    return body


async def _sync_single_sku(variant_id: str) -> bool:
    synced = await sync_products_and_inventory()
    return synced > 0


async def handle_inventory_update(payload: dict):
    variant_id = str(payload.get("inventory_item_id", ""))
    if variant_id:
        await _sync_single_sku(variant_id)


async def handle_order_create(payload: dict):
    line_items = payload.get("line_items", [])
    sku_codes = [li.get("sku") for li in line_items if li.get("sku")]
    if not sku_codes:
        return

    async with async_session_factory() as session:
        result = await session.execute(
            select(Sku).where(Sku.sku_code.in_(sku_codes))
        )
        existing = result.scalars().all()

    if existing:
        await sync_products_and_inventory()


async def handle_product_update(payload: dict):
    await sync_products_and_inventory()
