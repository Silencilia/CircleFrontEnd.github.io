#!/bin/bash
# 添加执行权限（只需要一次）
# chmod +x start.sh

# 启动
# ./start.sh

# 颜色输出
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting Cirkel...${NC}"

# 检查 PostgreSQL 是否运行
if ! pg_isready -q; then
    echo "Starting PostgreSQL..."
    brew services start postgresql@14
    sleep 2
fi

# 启动后端
echo -e "${GREEN}Starting backend...${NC}"
source venv/bin/activate
uvicorn app:app --reload --port 8000 &
BACKEND_PID=$!

# 等待后端启动
sleep 3

# 启动前端
echo -e "${GREEN}Starting frontend...${NC}"
cd frontend
npm run dev &
FRONTEND_PID=$!

cd ..

# 显示信息
echo -e "${GREEN}✅ Cirkel is running!${NC}"
echo "Backend:  http://localhost:8000"
echo "Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop all services"

# 捕获 Ctrl+C
trap "echo 'Stopping...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT

# 等待
wait