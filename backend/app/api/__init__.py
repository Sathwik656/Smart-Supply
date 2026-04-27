from fastapi import APIRouter
from .auth import router as auth_router
# We will import and include other routers here as they are built
from .shipments import router as shipments_router
from .alerts import router as alerts_router
from .predictions import router as predictions_router
from .routing import router as routing_router
from .vehicles import router as vehicles_router
from .analytics import router as analytics_router
from .gps import router as gps_router

router = APIRouter()
router.include_router(auth_router)
router.include_router(shipments_router)
router.include_router(alerts_router)
router.include_router(predictions_router)
router.include_router(routing_router)
router.include_router(vehicles_router)
router.include_router(analytics_router)
router.include_router(gps_router)
