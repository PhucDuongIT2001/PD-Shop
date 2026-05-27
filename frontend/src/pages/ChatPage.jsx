import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2, Bot, User as UserIcon, MessageSquare, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { getProductImageUrl } from '../utils/imageUtils';

const ChatPage = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Cuộn xuống tin nhắn mới nhất
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Tải lịch sử chat khi load trang
  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        setLoadingHistory(true);
        const res = await api.get('/chat/history');
        setMessages(res.data || []);
      } catch (err) {
        console.error('Lỗi tải lịch sử chat:', err);
        toast.error('Không thể tải lịch sử trò chuyện.');
      } finally {
        setLoadingHistory(false);
        setTimeout(scrollToBottom, 100);
      }
    };
    fetchChatHistory();
  }, []);

  // Cuộn xuống mỗi khi danh sách tin nhắn hoặc trạng thái đang gõ thay đổi
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsgText = inputText.trim();
    setInputText('');

    // 1. Tạo tin nhắn user giả lập ngay trên UI để phản hồi tức thì
    const tempUserMsg = {
      id: Date.now(),
      senderType: 'USER',
      messageText: userMsgText,
      createdAt: new Date().toISOString()
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    // 2. Kích hoạt hiệu ứng đang trả lời của AI
    setIsTyping(true);

    try {
      // 3. Gửi tin nhắn thực tế lên backend API
      const res = await api.post('/chat/send', { message: userMsgText });
      
      // 4. Thêm tin nhắn thật của BOT nhận được từ backend
      setMessages((prev) => [...prev, res.data]);
    } catch (err) {
      console.error('Lỗi gửi tin nhắn:', err);
      // Hiển thị tin nhắn lỗi trên UI của Bot
      const errorMsg = {
        id: Date.now() + 1,
        senderType: 'BOT',
        messageText: '❌ Xin lỗi, tôi không thể kết nối tới máy chủ AI của hệ thống lúc này. Vui lòng kiểm tra lại kết nối mạng hoặc thử lại sau ít phút!',
        createdAt: new Date().toISOString()
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  // Phân tích và hiển thị thẻ sản phẩm nếu có tag đặc biệt từ Bot
  const renderMessageContent = (text, isBot) => {
    if (!isBot) return text;
    if (!text) return '';

    const productRegex = /\[PRODUCT:({[^\]]+})\]/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = productRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: text.substring(lastIndex, match.index)
        });
      }

      try {
        const prod = JSON.parse(match[1]);
        parts.push({
          type: 'product',
          id: prod.id,
          name: prod.name,
          price: prod.price,
          thumbnail: prod.thumbnail
        });
      } catch (e) {
        console.error('Lỗi parse JSON sản phẩm từ AI:', e);
        parts.push({
          type: 'text',
          content: match[0]
        });
      }

      lastIndex = productRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push({
        type: 'text',
        content: text.substring(lastIndex)
      });
    }

    if (parts.length === 0) {
      return text;
    }

    return (
      <div className="space-y-2">
        {parts.map((part, index) => {
          if (part.type === 'text') {
            return (
              <span key={index} className="whitespace-pre-line block text-slate-800 font-medium">
                {part.content}
              </span>
            );
          } else {
            return (
              <div 
                key={index} 
                className="my-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 flex gap-4 items-center shadow-sm hover:shadow-md transition-all duration-300 group max-w-sm"
              >
                {/* Ảnh sản phẩm */}
                <div className="w-16 h-16 bg-white rounded-xl overflow-hidden shrink-0 border border-slate-100 flex items-center justify-center p-1.5">
                  <img 
                    src={getProductImageUrl(part.thumbnail)} 
                    alt={part.name} 
                    className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/400x400?text=No+Image';
                    }}
                  />
                </div>
                
                {/* Chi tiết sản phẩm */}
                <div className="flex-grow min-w-0 flex flex-col h-16 justify-between py-0.5">
                  <div className="min-w-0">
                    <h4 className="font-black text-slate-800 text-xs truncate uppercase tracking-tight group-hover:text-blue-600 transition-colors">
                      {part.name}
                    </h4>
                    <p className="text-red-600 font-extrabold text-xs mt-0.5">
                      {part.price}
                    </p>
                  </div>
                  
                  <Link 
                    to={`/product/${part.id}`} 
                    className="inline-flex items-center text-[10px] font-black uppercase tracking-wider text-blue-600 hover:text-blue-700 transition-colors mt-auto"
                  >
                    Xem chi tiết →
                  </Link>
                </div>
              </div>
            );
          }
        })}
      </div>
    );
  };

  return (
    <div className="flex-grow bg-slate-50 py-8 md:py-12 flex flex-col items-center justify-center min-h-[75vh]">
      <div className="container-custom w-full max-w-4xl flex flex-col h-[700px] bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        {/* Chat Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
              <Bot className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm md:text-base font-black italic tracking-wide uppercase">
                Trợ lý ảo PD-AI
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Trực tuyến</span>
              </div>
            </div>
          </div>
          <div className="text-xs text-slate-400 font-bold bg-slate-800 px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
            Hỗ trợ tư vấn 24/7
          </div>
        </div>

        {/* Chat Messages Box */}
        <div className="flex-grow p-6 overflow-y-auto bg-slate-50/50 space-y-6 custom-scrollbar">
          {loadingHistory ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <span className="text-xs font-bold uppercase tracking-wider">Đang tải lịch sử...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3 max-w-md mx-auto text-center">
              <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
                <Bot className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="font-bold text-slate-800 text-lg">Chào mừng bạn đến với Trợ lý ảo PD-SHOP!</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Tôi là AI của cửa hàng. Tôi có thể tư vấn các sản phẩm, giải thích thông số kỹ thuật hoặc chính sách mua sắm cho bạn. Hãy gửi tin nhắn để bắt đầu nhé!
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((msg) => {
                const isBot = msg.senderType === 'BOT';
                return (
                  <div key={msg.id} className={`flex gap-3 max-w-[85%] ${isBot ? '' : 'ml-auto flex-row-reverse'}`}>
                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-white shadow-sm ${
                      isBot ? 'bg-blue-600' : 'bg-slate-700'
                    }`}>
                      {isBot ? <Bot className="w-4 h-4" /> : <UserIcon className="w-4 h-4" />}
                    </div>

                    {/* Bubble Content */}
                    <div>
                      <div className={`p-4 rounded-2xl text-sm font-medium leading-relaxed ${
                        isBot 
                          ? 'bg-white text-slate-800 rounded-tl-none shadow-sm border border-slate-100'
                          : 'bg-blue-600 text-white rounded-tr-none shadow-md shadow-blue-600/10'
                      }`}>
                        {renderMessageContent(msg.messageText, isBot)}
                      </div>
                      <span className={`text-[9px] text-slate-400 font-bold block mt-1 ${isBot ? 'text-left' : 'text-right'}`}>
                        {formatTime(msg.createdAt)}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Typing Indicator */}
              <AnimatePresence>
                {isTyping && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex gap-3 max-w-[80%]"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-sm shrink-0">
                      <Bot className="w-4 h-4 animate-bounce" />
                    </div>
                    <div>
                      <div className="flex gap-1.5 items-center p-4 bg-white border border-slate-100 rounded-2xl rounded-tl-none shadow-sm w-20 justify-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Chat Input Bar */}
        <div className="p-4 bg-white border-t border-slate-100 shrink-0">
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Nhập câu hỏi của bạn cho Trợ lý ảo..."
              className="flex-grow bg-slate-50 border border-slate-200 text-slate-800 px-5 py-3.5 rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-sm"
              disabled={isTyping || loadingHistory}
              maxLength={1000}
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isTyping || loadingHistory}
              className="p-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold flex items-center justify-center transition-all shadow-lg shadow-blue-600/20 active:scale-95 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none shrink-0"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
          
          <div className="flex items-center gap-1 mt-2 text-[10px] text-slate-400 justify-center font-semibold">
            <AlertCircle className="w-3 h-3 text-slate-300" />
            Câu trả lời được sinh ra bởi AI và chỉ mang tính chất tham khảo.
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
