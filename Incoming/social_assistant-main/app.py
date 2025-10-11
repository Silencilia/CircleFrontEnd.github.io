from fastapi import FastAPI, HTTPException
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict
from pydantic import BaseModel

# use the following command to start the server:
# uvicorn app:app --reload
# cd frontend && npm run dev
# ========== 请求模型 ==========
class MergeRequest(BaseModel):
    source: str
    target: str
# ========== 启动事件 ==========
@asynccontextmanager
async def lifespan(app: FastAPI):
    from core.storage import init_db
    from core.retrieval import init_retrieval_system
    
    init_db()
    init_retrieval_system()  # 初始化向量系统
    
    yield
    import gc
    gc.collect()

app = FastAPI(title="Social Assistant API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ========== 导入并注册所有路由 ==========
from routers import interactions, aliases, search, intelligence, system

app.include_router(interactions.router)
app.include_router(aliases.router)
app.include_router(search.router)
app.include_router(intelligence.router)
app.include_router(system.router)

# ========== 兼容性路由 ==========
@app.post("/merge")
async def merge_compatibility(request: dict):
    """兼容性路由 - 重定向到 /api/merge-persons"""
    from routers.aliases import merge_persons_endpoint
    return await merge_persons_endpoint(request)

# ========== 根路径 ==========
@app.get("/")
async def root():
    return {"message": "Social Assistant API", "version": "1.0"}

# ========== 兼容旧的端点 ==========
from managers.name_learning_manager import NameLearningManager

@app.get("/stats/learning")
async def get_learning_stats_legacy():
    """获取学习系统统计（兼容旧路径）"""
    return NameLearningManager().get_stats()

# 保留旧的 /merge 端点以兼容
@app.post("/merge")
async def merge_persons_legacy(request: Dict):
    """合并两个人（旧路径，保持兼容）"""
    from managers.name_learning_manager import NameLearningManager
    source = request.get("source")
    target = request.get("target")
    if not source or not target:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="source and target required")
    return NameLearningManager().merge_persons(source, target)