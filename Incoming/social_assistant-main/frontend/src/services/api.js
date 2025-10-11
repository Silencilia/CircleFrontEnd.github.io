const API_BASE = 'http://localhost:8000';
// 👆 后端地址，所有请求都会加上这个前缀

async function request(url, options = {}) {
  try {
    const response = await fetch(`${API_BASE}${url}`, {
      headers: {'Content-Type': 'application/json'},
      ...options
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.detail || errorData.message || errorMessage;
      } catch {
        // 如果不是JSON错误，使用原始文本
        if (errorText) errorMessage = errorText;
      }
      
      throw new Error(errorMessage);
    }
    
    return await response.json();
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to server');
    }
    throw error;
  }
}

export const api = {
  // ==================== 基础功能 ====================
  listRecent: (limit = 1000) => request(`/list?limit=${limit}`),
  
  // 添加交互
  addInteraction: async (name, text, shadowIds = []) => {
    return request(`/add/${encodeURIComponent(name)}`, {
      method: 'POST',
      body: JSON.stringify({ 
        text: text,
        check_shadows: shadowIds.length === 0,
        shadow_ids: shadowIds
      })
    });
  },

  // 获取人员信息
  getPersonInfo: async (name) => {
    return request(`/who/${encodeURIComponent(name)}`);
  },

  // 更新人员信息
  updatePerson: async (name, text) => {
    return request(`/update/${encodeURIComponent(name)}`, {
      method: 'POST',
      body: JSON.stringify({ text })
    });
  },

  // 删除
  deletePerson: async (name, all = false, eventId = null) => {
    const params = new URLSearchParams({ all: all.toString() });
    if (eventId) params.append('event_id', eventId.toString());
    return request(`/delete/${encodeURIComponent(name)}?${params}`, {
      method: 'DELETE'
    });
  },

  // 搜索
  search: async (query, limit = 10) => {
    const params = new URLSearchParams({ 
      query: query,
      limit: limit 
    });
    return request(`/search?${params}`);
  },

  // 合并人员
  merge: async (source, target) => {
    return request('/api/merge-persons', {
      method: 'POST',
      body: JSON.stringify({ source, target })
    });
  },

  // ==================== Alias管理 ====================
  // 获取人员Alias
  getPersonAliases: async (person) => {
    return request(`/api/aliases/${encodeURIComponent(person)}`);
  },

  // 添加Alias
  addAlias: async (personName, alias) => {
    return request('/api/aliases/add', {
      method: 'POST',
      body: JSON.stringify({ person_name: personName, alias })
    });
  },

  // 删除Alias
  removeAlias: async (personName, alias) => {
    return request(`/api/aliases/${encodeURIComponent(alias)}`, {
      method: 'DELETE'
    });
  },

  // 检查姓名
  checkName: async (name) => {
    return request(`/api/check-name/${encodeURIComponent(name)}`);
  },

  // 查找相似人物 (LinkedIn风格选择器)
  findSimilarPeople: async (name, limit = 10) => {
    return request(`/api/find-similar-people/${encodeURIComponent(name)}?limit=${limit}`);
  },

  // 姓名建议
  suggestNames: async (partial) => {
    return request(`/api/suggest-names?q=${encodeURIComponent(partial)}`);
  },

  // 查找重复
  findDuplicates: async () => {
    return request('/api/aliases/duplicates');
  },

  // ==================== 智能功能 ====================
  // 会议准备
  prepareMeeting: async (name) => {
    return request(`/prep/${encodeURIComponent(name)}`);
  },

  // 获取提醒
  getReminders: async () => {
    return request('/reminders');
  },

  // ==================== 统计和连接 ====================
  // 获取统计信息
  getStats: async () => {
    return request('/api/learning/stats');
  },

  // 查找连接
  getConnections: async (name) => {
    return request(`/connections/${encodeURIComponent(name)}`);
  },

  // ==================== 系统管理 ====================
  // 健康检查
  checkHealth: async () => {
    return request('/health');
  },

  // 重置数据库 - 危险操作！
  resetDatabase: async () => {
    return request('/reset-database', {
      method: 'POST'
    });
  }
};