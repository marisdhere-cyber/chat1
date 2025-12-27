// Supabase 配置 - 用户需要在此处填写自己的配置
const SUPABASE_URL = 'https://vdsjdwcmoqakubirvnbn.supabase.co'; // 请填写您的 Supabase Project URL
const SUPABASE_ANON_KEY = 'sb_publishable_CTBQOicD3xxI_II2S56qDg_EN7BlORu'; // 请填写您的 Supabase Publishable key

// 初始化 Supabase
// 使用全局 supabase 对象，避免重复声明
let supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM 元素
const chatContainer = document.getElementById('chatContainer');
const messagesDiv = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const settingsBtn = document.getElementById('settingsBtn');
const settingsPanel = document.getElementById('settingsPanel');
const apiForm = document.getElementById('apiForm');
const cancelBtn = document.getElementById('cancelBtn');

// API 配置
let apiConfig = null;

// 初始化应用
async function init() {
    await loadApiConfig();
    
    // 如果没有配置，显示设置面板
    if (!apiConfig) {
        showSettingsPanel();
    }
    
    // 添加事件监听器
    addEventListeners();
    
    // 显示欢迎消息
    showWelcomeMessage();
}

// 加载 API 配置
async function loadApiConfig() {
    try {
        const { data, error } = await supabaseClient
            .from('api_configs')
            .select('*')
            .single();
        
        if (error) {
            console.log('没有找到 API 配置:', error);
            return;
        }
        
        apiConfig = data;
        console.log('API 配置加载成功:', apiConfig);
    } catch (error) {
        console.error('加载 API 配置出错:', error);
    }
}

// 保存 API 配置
async function saveApiConfig(config) {
    try {
        // 检查是否已有配置
        const { data: existing } = await supabaseClient
            .from('api_configs')
            .select('id')
            .single();
        
        let result;
        if (existing) {
            // 更新现有配置
            result = await supabaseClient
                .from('api_configs')
                .update(config)
                .eq('id', existing.id);
        } else {
            // 创建新配置
            result = await supabaseClient
                .from('api_configs')
                .insert([config]);
        }
        
        if (result.error) {
            throw result.error;
        }
        
        apiConfig = config;
        console.log('API 配置保存成功');
        hideSettingsPanel();
        return true;
    } catch (error) {
        console.error('保存 API 配置出错:', error);
        alert('保存配置失败: ' + error.message);
        return false;
    }
}

// 发送消息
async function sendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;
    
    if (!apiConfig) {
        alert('请先配置 API 信息');
        showSettingsPanel();
        return;
    }
    
    // 添加用户消息到聊天
    addMessage(message, 'user');
    messageInput.value = '';
    
    // 发送请求到 API
    try {
        const response = await fetch(apiConfig.api_url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiConfig.api_key}`
            },
            body: JSON.stringify({
                model: apiConfig.model_name,
                messages: [
                    { role: 'user', content: message }
                ]
            })
        });
        
        if (!response.ok) {
            throw new Error(`API 请求失败: ${response.statusText}`);
        }
        
        const data = await response.json();
        const assistantMessage = data.choices[0].message.content;
        
        // 添加助手消息到聊天
        addMessage(assistantMessage, 'assistant');
    } catch (error) {
        console.error('发送消息出错:', error);
        addMessage('对不起，发送消息时出错了: ' + error.message, 'assistant');
    }
}

// 添加消息到聊天界面
function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    messageDiv.textContent = text;
    
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// 显示欢迎消息
function showWelcomeMessage() {
    const welcomeMessage = `🎄 欢迎使用圣诞聊天助手！\n\n如果您是第一次使用，请点击右上角的设置按钮配置您的 API 信息。配置完成后，您就可以开始聊天了！\n\n祝您圣诞快乐！🎅✨`;
    addMessage(welcomeMessage, 'assistant');
}

// 显示设置面板
function showSettingsPanel() {
    settingsPanel.classList.add('active');
}

// 隐藏设置面板
function hideSettingsPanel() {
    settingsPanel.classList.remove('active');
}

// 添加事件监听器
function addEventListeners() {
    // 发送消息按钮
    sendBtn.addEventListener('click', sendMessage);
    
    // 回车键发送
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // 显示设置面板
    settingsBtn.addEventListener('click', showSettingsPanel);
    
    // 隐藏设置面板
    cancelBtn.addEventListener('click', hideSettingsPanel);
    
    // 保存 API 配置
    apiForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const config = {
            api_url: document.getElementById('apiUrl').value.trim(),
            api_key: document.getElementById('apiKey').value.trim(),
            model_name: document.getElementById('modelName').value.trim()
        };
        
        await saveApiConfig(config);
    });
    
    // 点击设置面板外部关闭
    settingsPanel.addEventListener('click', (e) => {
        if (e.target === settingsPanel) {
            hideSettingsPanel();
        }
    });
}

// 检查 Supabase 配置
function checkSupabaseConfig() {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        alert('请先在 script.js 文件中配置您的 Supabase 信息');
        // 显示提示信息
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            background: rgba(211, 47, 47, 0.9);
            color: white;
            padding: 20px;
            border-radius: 10px;
            margin: 20px;
            text-align: center;
            font-weight: bold;
        `;
        errorDiv.innerHTML = `
            ⚠️ 请先配置 Supabase 信息！<br><br>
            1. 打开 <code>script.js</code> 文件<br>
            2. 填写您的 <code>SUPABASE_URL</code> 和 <code>SUPABASE_ANON_KEY</code><br><br>
            这些信息可以在 Supabase 控制台中找到。
        `;
        chatContainer.appendChild(errorDiv);
        return false;
    }
    return true;
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    if (checkSupabaseConfig()) {
        init();
    }
});