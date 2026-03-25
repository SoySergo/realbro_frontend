Мне нужно что бы ты заменил стили нашего чата. При открытии чата должно быть как тут 'use client';

import { useState, useMemo } from 'react';
import { useAppContext } from '@/lib/context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Search, Home, MessageCircle, Heart, User, Filter, ArrowUpDown, Calendar, ThumbsUp, ThumbsDown, Bookmark, MapPin } from 'lucide-react';
import { isToday, isYesterday, format, parseISO } from 'date-fns';
import Image from 'next/image';

export default function MainPage() {
  const { view, setView, history, activeProperty, setActiveProperty } = useAppContext();
  const [activeFilter, setActiveFilter] = useState<'all' | 'filters' | 'liked' | 'hidden' | 'week'>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const filteredHistory = useMemo(() => {
    return history.filter(item => {
      if (activeFilter === 'all') return true;
      if (activeFilter === 'liked') return item.reaction === 'like';
      if (activeFilter === 'hidden') return item.reaction === 'dislike';
      if (activeFilter === 'week') {
        const date = new Date(item.viewedAt || 0);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return date >= weekAgo;
      }
      if (activeFilter === 'filters') {
        // Mock logic for 'by filters'
        return true;
      }
      return true;
    }).sort((a, b) => {
      const dateA = new Date(a.viewedAt || 0).getTime();
      const dateB = new Date(b.viewedAt || 0).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });
  }, [history, activeFilter, sortOrder]);

  const handlePropertyClick = (prop: any) => {
    setActiveProperty(prop);
    setView('internal_chat');
  };

  const formatTime = (isoString?: string) => {
    if (!isoString) return '';
    const date = parseISO(isoString);
    if (isToday(date)) return format(date, 'HH:mm');
    if (isYesterday(date)) return 'Вчера';
    return format(date, 'd MMM');
  };

  return (
    <div className="flex flex-col flex-1 w-full h-full bg-[#f8fafc]">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-sm px-4 py-3 flex items-center justify-between shadow-sm z-20 shrink-0 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
            <span className="text-white font-bold text-lg leading-none">R</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">RealtyAI</h1>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="hidden md:flex items-center gap-2 text-blue-600 hover:bg-blue-50"
          onClick={() => setView('search')}
        >
          <MapPin className="w-4 h-4" />
          <span className="font-medium">Карта</span>
        </Button>
      </div>

      {/* Search Bar */}
      <div className="px-4 py-3 bg-white">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Поиск по чатам и объектам" 
            className="w-full bg-slate-100 text-slate-900 rounded-xl py-2.5 pl-9 pr-4 text-[15px] focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        {/* Agent Chat Section */}
        <div className="px-4 py-3">
          <div 
            className={`flex items-center gap-4 p-4 rounded-2xl border shadow-sm cursor-pointer transition-all active:scale-[0.98] ${
              view === 'main_chat' 
                ? 'bg-blue-50 border-blue-200 shadow-md' 
                : 'bg-white border-slate-100 hover:shadow-md hover:border-blue-100'
            }`}
            onClick={() => setView('main_chat')}
          >
            <div className="relative shrink-0">
              <Avatar className="w-14 h-14 border border-slate-100 shadow-sm">
                <AvatarImage src="https://picsum.photos/seed/agent/100/100" className="object-cover" />
                <AvatarFallback>AI</AvatarFallback>
              </Avatar>
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline mb-1">
                <h2 className="font-semibold text-[16px] text-slate-900 truncate">Alex (AI Агент)</h2>
                <span className="text-[11px] font-medium text-slate-400 shrink-0 ml-2">10:42</span>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-[14px] text-slate-500 truncate pr-2">Я нашел 3 новых варианта по вашему фильтру.</p>
                <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center shrink-0 shadow-sm">
                  <span className="text-[11px] font-bold text-white">3</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* History Controls */}
        <div className="px-4 py-3 bg-white sticky top-0 z-10 border-b border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[16px] font-bold text-slate-900">История объектов</h2>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 text-blue-600 hover:bg-blue-50 hover:text-blue-700 px-2 rounded-lg"
              onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
            >
              <ArrowUpDown className="w-4 h-4 mr-1.5" />
              Сортировка {sortOrder === 'desc' ? '↓' : '↑'}
            </Button>
          </div>
          
          {/* Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1 -mx-4 px-4">
            <button 
              onClick={() => setActiveFilter('all')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-medium whitespace-nowrap transition-colors shadow-sm ${activeFilter === 'all' ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200 hover:bg-slate-50 text-slate-700'}`}
            >
              <Filter className={`w-3.5 h-3.5 ${activeFilter === 'all' ? 'text-slate-300' : 'text-slate-500'}`} />
              Все
            </button>
            <button 
              onClick={() => setActiveFilter('filters')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-medium whitespace-nowrap transition-colors shadow-sm ${activeFilter === 'filters' ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200 hover:bg-slate-50 text-slate-700'}`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${activeFilter === 'filters' ? 'text-blue-300' : 'text-blue-500'}`} />
              По фильтрам
            </button>
            <button 
              onClick={() => setActiveFilter('liked')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-medium whitespace-nowrap transition-colors shadow-sm ${activeFilter === 'liked' ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-200 hover:bg-slate-50 text-slate-700'}`}
            >
              <ThumbsUp className={`w-3.5 h-3.5 ${activeFilter === 'liked' ? 'text-emerald-200' : 'text-emerald-500'}`} />
              Понравились
            </button>
            <button 
              onClick={() => setActiveFilter('hidden')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-medium whitespace-nowrap transition-colors shadow-sm ${activeFilter === 'hidden' ? 'bg-red-600 text-white' : 'bg-white border border-slate-200 hover:bg-slate-50 text-slate-700'}`}
            >
              <ThumbsDown className={`w-3.5 h-3.5 ${activeFilter === 'hidden' ? 'text-red-200' : 'text-red-500'}`} />
              Скрытые
            </button>
            <button 
              onClick={() => setActiveFilter('week')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-medium whitespace-nowrap transition-colors shadow-sm ${activeFilter === 'week' ? 'bg-orange-500 text-white' : 'bg-white border border-slate-200 hover:bg-slate-50 text-slate-700'}`}
            >
              <Calendar className={`w-3.5 h-3.5 ${activeFilter === 'week' ? 'text-orange-200' : 'text-orange-500'}`} />
              За неделю
            </button>
          </div>
        </div>

        {/* Property Chats */}
        <div className="px-4 py-4 space-y-3 pb-8">
          {filteredHistory.map((item, index) => (
            <div 
              key={item.id}
              className={`flex gap-3 p-3 rounded-2xl border shadow-sm cursor-pointer transition-all active:scale-[0.98] ${
                view === 'internal_chat' && activeProperty?.id === item.id
                  ? 'bg-blue-50 border-blue-200 shadow-md'
                  : 'bg-white border-slate-100 hover:shadow-md hover:border-blue-100'
              }`}
              onClick={() => handlePropertyClick(item)}
            >
              <div className="relative shrink-0 w-[88px] h-[88px]">
                <Image src={item.image} alt={item.title} fill className="rounded-xl object-cover" />
                {item.reaction === 'like' && (
                  <div className="absolute top-1 right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                    <ThumbsUp className="w-3 h-3 text-white" />
                  </div>
                )}
                {item.reaction === 'dislike' && (
                  <div className="absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                    <ThumbsDown className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0 py-0.5 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-1">
                    <h2 className="font-semibold text-[14px] text-slate-900 leading-tight line-clamp-2 pr-2">{item.title}</h2>
                    <span className="text-[11px] font-medium text-slate-400 shrink-0 mt-0.5">{formatTime(item.viewedAt)}</span>
                  </div>
                  <p className="text-[12px] text-slate-500 truncate flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span className="truncate">{item.location}</span>
                  </p>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-[15px] font-bold text-blue-600">{item.price}</p>
                </div>
              </div>
            </div>
          ))}

          {filteredHistory.length === 0 && history.length > 0 && (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-slate-100">
                <Filter className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-[16px] font-bold text-slate-900 mb-2">Ничего не найдено</h3>
              <p className="text-[14px] text-slate-500 max-w-[240px]">
                Попробуйте изменить параметры фильтрации
              </p>
            </div>
          )}

          {history.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-slate-100">
                <MessageCircle className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-[16px] font-semibold text-slate-900 mb-1">История пуста</h3>
              <p className="text-[14px] text-slate-500 max-w-[240px]">
                Здесь будут появляться объекты, которые вы обсуждали с агентом.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="md:hidden bg-white border-t border-slate-100 px-6 py-2.5 flex items-center justify-between shrink-0 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.02)] z-20">
        <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-blue-600 transition-colors">
          <Home className="w-6 h-6" />
          <span className="text-[10px] font-medium">Главная</span>
        </button>
        <button onClick={() => setView('search')} className="flex flex-col items-center gap-1 text-slate-400 hover:text-blue-600 transition-colors">
          <Search className="w-6 h-6" />
          <span className="text-[10px] font-medium">Поиск</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-blue-600 transition-colors">
          <div className="relative">
            <MessageCircle className="w-6 h-6 fill-blue-50" />
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></div>
          </div>
          <span className="text-[10px] font-medium">Чаты</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-blue-600 transition-colors">
          <Heart className="w-6 h-6" />
          <span className="text-[10px] font-medium">Избранное</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-blue-600 transition-colors">
          <User className="w-6 h-6" />
          <span className="text-[10px] font-medium">Профиль</span>
        </button>
      </div>
    </div>
  );
}   т.е. чаты, поиск, закреплённый чат с ии агентом, история и тд. Стили как в нашем приложении. Дальше при клике на чат с ии агентом, должно быть как тут: 
'use client';

import { useAppContext } from '@/lib/context';
import { useChat } from '@/lib/useChat';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Send, ThumbsUp, ThumbsDown, MessageCircle, MoreVertical, Paperclip, Mic, CheckCheck, Play, Pause, ListTodo, X, Filter, Clock, Plus, MapPin, FileText, Settings } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { MOCK_PROPERTIES } from '@/lib/mock-data';
import { format, parseISO } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import FilterBuilder from './FilterBuilder';

const EMOJIS = ['👍', '👎', '❤️', '🔥', '😂', '😮'];

export default function MainChat() {
  const { setView, setActiveProperty, addToHistory } = useAppContext();
  const { messages, isTyping, toggleReaction, sendMessage } = useChat(() => [
    {
      id: '1',
      sender: 'agent',
      type: 'property_suggestion',
      properties: MOCK_PROPERTIES.slice(0, 1),
      timestamp: new Date(Date.now() - 100000).toISOString()
    },
    {
      id: '2',
      sender: 'agent',
      type: 'property_suggestion',
      properties: MOCK_PROPERTIES.slice(1, 4),
      timestamp: new Date(Date.now() - 50000).toISOString()
    }
  ]);
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
  const [isTasksModalOpen, setIsTasksModalOpen] = useState(false);
  const [isFilterBuilderOpen, setIsFilterBuilderOpen] = useState(false);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isTyping]);

  const handleInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  const handleSend = useCallback((text: string = input) => {
    if (!text.trim()) return;
    
    // Mock response logic
    let response: any = { text: 'Я понял ваш запрос. Сейчас подберу подходящие варианты.', type: 'text' };
    
    sendMessage(text, response);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [input, sendMessage]);

  const handlePropertyClick = useCallback((prop: any) => {
    addToHistory(prop);
    setActiveProperty(prop);
    setView('internal_chat');
  }, [addToHistory, setActiveProperty, setView]);

  const formatTime = (iso: string) => format(parseISO(iso), 'HH:mm');

  return (
    <div className="flex flex-col flex-1 w-full h-full bg-[#e4eef6] relative">
      {/* Floating Header */}
      <div className="absolute top-0 left-0 right-0 z-30 flex justify-between items-center p-4 pointer-events-none">
        <button 
          onClick={() => setView('main')} 
          className="pointer-events-auto w-11 h-11 bg-white/90 backdrop-blur-md shadow-sm rounded-full flex items-center justify-center text-slate-700 hover:bg-white transition-colors shrink-0 md:hidden"
        >
          <ChevronLeft className="w-[26px] h-[26px] pr-0.5" />
        </button>
        
        <div className="pointer-events-auto h-11 bg-white/90 backdrop-blur-md shadow-sm rounded-full px-1.5 flex items-center gap-1.5 ml-auto">
          <div className="flex items-center gap-2 pl-2 pr-1 cursor-pointer">
            <div className="relative w-8 h-8 shrink-0">
              <Image src="https://picsum.photos/seed/agent/100/100" fill className="rounded-full object-cover" alt="Agent" />
            </div>
            <div className="flex flex-col justify-center">
              <h2 className="font-semibold text-[14px] text-slate-900 leading-none">Alex</h2>
              <p className="text-[11px] text-blue-500 font-medium leading-none mt-0.5">
                {isTyping ? 'typing...' : 'online'}
              </p>
            </div>
          </div>
          <div className="w-[1px] h-5 bg-slate-200 mx-1"></div>
          <button 
            onClick={() => setIsTasksModalOpen(true)}
            className="w-9 h-9 flex items-center justify-center text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
          >
            <Settings className="w-[18px] h-[18px]" />
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto pb-4 pt-[72px] space-y-4 min-h-0" ref={scrollRef}>
        {activeMessageId && (
          <div 
            className="absolute inset-0 z-20" 
            onClick={() => setActiveMessageId(null)} 
          />
        )}
        <div className="text-center my-4 sticky top-2 z-10 px-4">
          <span className="bg-black/20 backdrop-blur-md text-white text-[13px] font-medium px-3 py-1 rounded-full shadow-sm">
            Today
          </span>
        </div>

        {messages.map((msg, index) => {
          const isFirstInGroup = index === 0 || messages[index - 1].sender !== msg.sender;
          
          return (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              key={msg.id} 
              className={`flex flex-col px-4 w-full ${msg.sender === 'user' ? 'items-end' : 'items-start'} ${isFirstInGroup ? 'mt-4' : 'mt-1'}`}
            >
              <div className={`relative group ${msg.type === 'property_suggestion' && msg.properties && msg.properties.length > 1 ? 'w-full' : 'max-w-[85%]'}`}>
                <AnimatePresence>
                  {activeMessageId === msg.id && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.5, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.5, y: 20 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      className={`absolute z-30 flex gap-1 bg-white/90 backdrop-blur-md shadow-xl rounded-full px-2 py-1.5 border border-slate-200/50 ${msg.sender === 'user' ? 'right-0 -top-14' : 'left-0 -top-14'}`}
                    >
                      {EMOJIS.map((emoji, i) => (
                        <motion.button 
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.05, type: 'spring', stiffness: 500 }}
                          key={emoji}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleReaction(msg.id, emoji);
                            setActiveMessageId(null);
                          }}
                          className="w-9 h-9 flex items-center justify-center hover:bg-slate-100 rounded-full text-2xl transition-transform hover:scale-125 active:scale-95"
                        >
                          {emoji}
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {msg.text && (
                  <div 
                    onClick={() => setActiveMessageId(activeMessageId === msg.id ? null : msg.id)}
                    className={`px-3 py-1.5 shadow-sm relative cursor-pointer transition-transform active:scale-[0.98] ${
                      msg.sender === 'user' 
                        ? `bg-blue-500 text-white rounded-2xl ${isFirstInGroup ? 'rounded-tr-sm' : ''}` 
                        : `bg-white text-slate-900 rounded-2xl ${isFirstInGroup ? 'rounded-tl-sm' : ''}`
                    }`}
                  >
                    <div className="flex flex-wrap items-end gap-x-3 gap-y-1">
                      <span className="text-[15px] leading-relaxed break-words min-w-0">{msg.text}</span>
                      <div className={`flex items-center shrink-0 ml-auto ${msg.sender === 'user' ? 'text-blue-200' : 'text-slate-400'}`}>
                        <span className="text-[11px]">{formatTime(msg.timestamp)}</span>
                        {msg.sender === 'user' && <CheckCheck className="w-3.5 h-3.5 ml-1 text-blue-200" />}
                      </div>
                    </div>
                  </div>
                )}
                
                {msg.type === 'property_suggestion' && msg.properties && (
                  <div className={`flex flex-col gap-1 w-full ${isFirstInGroup ? 'mt-1' : 'mt-1'}`}>
                    {/* Header Message */}
                    <div className="bg-white text-slate-900 rounded-2xl rounded-bl-[4px] px-3 py-2 shadow-sm self-start max-w-[85%]">
                      <span className="text-[15px] leading-relaxed break-words">
                        {msg.text || (msg.properties.length > 1 
                          ? `Нашёл ${msg.properties.length} вариантов по вашему фильтру 🎯` 
                          : 'Нашёл отличный вариант по вашему фильтру 🎯')}
                      </span>
                    </div>
                    
                    {/* Properties Container */}
                    <div className={`flex ${msg.properties.length > 1 ? 'w-[calc(100%+2rem)] -ml-4 overflow-x-auto snap-x snap-mandatory gap-2 pb-2 px-4 sm:px-0 hide-scrollbar' : 'flex-col gap-1 w-full'}`}>
                      {msg.properties.map((prop, idx) => (
                        <div key={prop.id} className={`flex flex-col gap-1 shrink-0 w-[320px] max-w-[85vw] ${msg.properties!.length > 1 ? 'snap-center snap-always' : ''}`}>
                          {/* Property Card */}
                          <div className="bg-white rounded-2xl rounded-l-[4px] shadow-sm overflow-hidden border border-slate-100">
                            {/* Media Gallery */}
                            <div className="grid grid-cols-2 gap-0.5 bg-white cursor-pointer" onClick={() => handlePropertyClick(prop)}>
                              {prop.images && prop.images.length > 0 ? (
                                <>
                                  <div className="relative w-full h-40 col-span-2">
                                    <Image src={prop.images[0]} fill className="object-cover" alt="Main" />
                                  </div>
                                  {prop.images[1] && (
                                    <div className="relative w-full h-24">
                                      <Image src={prop.images[1]} fill className="object-cover" alt="Sub 1" />
                                    </div>
                                  )}
                                  {prop.images[2] && (
                                    <div className="relative w-full h-24">
                                      <Image src={prop.images[2]} fill className="object-cover" alt="Sub 2" />
                                      {prop.images.length > 3 && (
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
                                          <span className="text-white font-medium text-lg">+{prop.images.length - 3}</span>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </>
                              ) : (
                                <div className="relative w-full h-48 col-span-2">
                                  <Image src={prop.image} fill className="object-cover" alt="Main" />
                                </div>
                              )}
                            </div>

                            {/* Content */}
                            <div 
                              className="p-3 cursor-pointer transition-colors active:bg-slate-50"
                              onClick={() => setActiveMessageId(activeMessageId === msg.id ? null : msg.id)}
                            >
                              <div className="flex justify-between items-start mb-1">
                                <h3 className="font-bold text-lg text-slate-900">{prop.price}</h3>
                                <span className="text-[11px] text-slate-400 mt-1">{formatTime(msg.timestamp)}</span>
                              </div>
                              <p className="font-medium text-[15px] text-slate-800 leading-tight mb-1">{prop.title}</p>
                              <p className="text-[14px] text-slate-500 mb-2">{prop.location}</p>
                              
                              <div className="bg-slate-50 rounded-lg p-2 mb-1">
                                <p className="text-[13px] font-medium text-slate-700">{prop.characteristics}</p>
                                <p className="text-[12px] text-slate-500 mt-1 line-clamp-1">{prop.amenities?.join(' • ')}</p>
                              </div>
                            </div>
                          </div>

                          {/* Action Panel */}
                          <div className="bg-white text-slate-900 rounded-2xl rounded-tl-[4px] px-2 py-1.5 shadow-sm flex items-center justify-between w-full">
                            <div className="flex items-center gap-1">
                              <button 
                                className="p-2 hover:bg-emerald-50 rounded-xl text-slate-500 hover:text-emerald-600 transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleReaction(msg.id, '👍');
                                }}
                              >
                                <ThumbsUp className="w-5 h-5" />
                              </button>
                              <button 
                                className="p-2 hover:bg-red-50 rounded-xl text-slate-500 hover:text-red-600 transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleReaction(msg.id, '👎');
                                }}
                              >
                                <ThumbsDown className="w-5 h-5" />
                              </button>
                            </div>
                            <button 
                              className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-blue-50 rounded-xl text-slate-600 hover:text-blue-600 transition-colors text-[14px] font-medium"
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePropertyClick(prop);
                              }}
                            >
                              <FileText className="w-4 h-4" />
                              Заметка
                            </button>
                          </div>
                        </div>
                      ))}
                      {msg.properties.length > 1 && (
                        <div className="w-4 shrink-0" />
                      )}
                    </div>
                  </div>
                )}

                {/* Display Reactions */}
                {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                  <div className={`flex flex-wrap gap-1 mt-1 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <AnimatePresence>
                      {Object.entries(msg.reactions).map(([emoji, count]) => (
                        <motion.button
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          whileTap={{ scale: 0.8 }}
                          key={emoji}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleReaction(msg.id, emoji);
                          }}
                          className={`flex items-center justify-center gap-1 px-2 py-0.5 rounded-full text-[12px] font-medium border shadow-sm transition-colors ${
                            msg.sender === 'user' 
                              ? 'bg-blue-500 text-white border-blue-400 hover:bg-blue-600' 
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <span>{emoji}</span>
                          {count > 1 && <span className="text-[10px] opacity-80">{count}</span>}
                        </motion.button>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}

        <AnimatePresence>
          {isTyping && (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
              className="flex items-start mt-4"
            >
              <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex gap-1 items-center h-[38px]">
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input Area */}
      <div className="bg-white/95 backdrop-blur-sm flex flex-col z-20 shrink-0 border-t border-slate-100">
        <div className="p-2 flex items-end gap-2">
          <Button variant="ghost" size="icon" className="text-slate-400 shrink-0 mb-0.5">
            <Paperclip className="w-6 h-6" />
          </Button>
          <div className="flex-1 bg-slate-100 rounded-2xl relative min-h-[44px] flex items-center">
            <textarea 
              ref={textareaRef}
              value={input} 
              onChange={e => setInput(e.target.value)}
              onInput={handleInput}
              placeholder="Message..." 
              className="w-full bg-transparent border-none px-4 py-3 text-[15px] focus:outline-none resize-none max-h-32 min-h-[44px]"
              rows={1}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
          </div>
          {input.trim() ? (
            <Button onClick={() => handleSend()} size="icon" className="rounded-full bg-blue-500 hover:bg-blue-600 text-white shrink-0 w-11 h-11 mb-0.5 shadow-sm">
              <Send className="w-5 h-5 ml-0.5" />
            </Button>
          ) : (
            <Button variant="ghost" size="icon" className="text-slate-400 shrink-0 mb-0.5 w-11 h-11">
              <Mic className="w-6 h-6" />
            </Button>
          )}
        </div>
      </div>

      {/* Tasks Modal */}
      <AnimatePresence>
        {isTasksModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={() => setIsTasksModalOpen(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-900">Задания агента</h2>
                <Button variant="ghost" size="icon" onClick={() => setIsTasksModalOpen(false)} className="rounded-full">
                  <X className="w-5 h-5 text-slate-500" />
                </Button>
              </div>
              
              <div className="p-5 overflow-y-auto space-y-6">
                {/* Filters */}
                <div>
                  <h3 className="text-[14px] font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <Filter className="w-4 h-4 text-blue-500" />
                    Сохраненные фильтры
                  </h3>
                  <div className="space-y-2">
                    {['Квартиры до 150к', 'Виллы у моря', 'Срочные продажи'].map((filter, i) => (
                      <label key={i} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors">
                        <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" defaultChecked={i === 0} />
                        <span className="text-[15px] font-medium text-slate-700">{filter}</span>
                      </label>
                    ))}
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-blue-600 hover:text-blue-700 hover:bg-blue-50 mt-2"
                      onClick={() => {
                        setIsTasksModalOpen(false);
                        setIsFilterBuilderOpen(true);
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Создать новый фильтр
                    </Button>
                  </div>
                </div>

                {/* Schedule */}
                <div>
                  <h3 className="text-[14px] font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-500" />
                    Время рассылки
                  </h3>
                  <p className="text-[13px] text-slate-500 mb-3 leading-relaxed">
                    Выберите время, когда агент может присылать пуш-уведомления. Если вы онлайн, агент будет предлагать варианты в любое время.
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <label className="block text-[12px] font-medium text-slate-500 mb-1">От</label>
                      <input type="time" defaultValue="08:00" className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-[12px] font-medium text-slate-500 mb-1">До</label>
                      <input type="time" defaultValue="20:00" className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 border-t border-slate-100 bg-slate-50">
                <Button className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white py-6 text-[15px] font-semibold" onClick={() => setIsTasksModalOpen(false)}>
                  Сохранить настройки
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <FilterBuilder 
        isOpen={isFilterBuilderOpen} 
        onClose={() => setIsFilterBuilderOpen(false)} 
        onSave={(filter) => {
          console.log('Saved filter:', filter);
          // Here we would save the filter to context or state
        }} 
      />
    </div>
  );
}   Но без эмоджи. И при клике на объект открывается внутренний чат с агентом по объекту: 
'use client';

import { useAppContext } from '@/lib/context';
import { useChat } from '@/lib/useChat';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Send, MapPin, Info, Phone, Map, Paperclip, MoreVertical, Mic, CheckCheck, ThumbsUp, ThumbsDown, Flag, Maximize2, Mail, MessageCircle, FileText, Share2, ExternalLink, GitCompare, Star, ChevronRight, Building2 } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { format, parseISO } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const EMOJIS = ['👍', '👎', '❤️', '🔥', '😂', '😮']; 

export default function InternalChat() {
  const { setView, activeProperty, setPropertyReaction } = useAppContext();
  const { messages, sendMessage, isTyping, toggleReaction } = useChat(() => [
    {
      id: '1',
      sender: 'agent',
      type: 'property_details',
      properties: activeProperty ? [activeProperty] : [],
      timestamp: new Date(Date.now() - 60000).toISOString()
    }
  ]);
  const [input, setInput] = useState('');
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
  const [fullscreenMapId, setFullscreenMapId] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      if (messages.length > 1 || isTyping) {
        scrollRef.current.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: 'smooth'
        });
      } else {
        scrollRef.current.scrollTo({
          top: 0,
          behavior: 'auto'
        });
      }
    }
  }, [messages, isTyping]);

  const handleInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  const handleSend = useCallback((text: string = input) => {
    if (!text.trim()) return;
    
    let response: any = { text: 'I can help with that. Let me check the details.', type: 'text' };
    
    const lowerText = text.toLowerCase();
    if (lowerText.includes('description') || lowerText.includes('описание')) {
      response = { 
        text: `${activeProperty?.description || 'Нет описания.'}\n\n**Дополнительная информация:**\nЭтот объект отличается уникальным расположением и продуманной планировкой. В шаговой доступности находятся все необходимые объекты инфраструктуры: супермаркеты, аптеки, кафе и остановки общественного транспорта. Идеальный вариант для тех, кто ценит комфорт и экономит свое время. Дом обслуживается профессиональной управляющей компанией, соседи тихие и дружелюбные. Звоните, чтобы узнать больше деталей и договориться о просмотре!`, 
        type: 'text' 
      };
    } else if (lowerText.includes('map') || lowerText.includes('карта')) {
      response = { text: `Локация объекта ${activeProperty?.title}:`, type: 'map' };
    } else if (lowerText.includes('contact') || lowerText.includes('связаться')) {
      response = { text: 'Контакты для связи:', type: 'contact_card' };
    } else if (lowerText.includes('notes') || lowerText.includes('заметки')) {
      response = { text: 'Ваши заметки по этому объекту:\n\n* Отличный вид из окна\n* Уточнить про парковку\n* Возможен торг при быстрой сделке', type: 'text' };
    } else if (lowerText.includes('location')) {
      response = { text: `It is located at ${activeProperty?.location}.`, type: 'text' };
    }
    
    sendMessage(text, response);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [input, activeProperty, sendMessage]);

  const hotButtons = [
    { label: 'Описание', icon: <Info className="w-4 h-4 mr-1.5" />, action: 'Описание' },
    { label: 'Карта', icon: <MapPin className="w-4 h-4 mr-1.5" />, action: 'Карта' },
    { label: 'Связаться', icon: <Phone className="w-4 h-4 mr-1.5" />, action: 'Связаться' },
    { label: 'Заметки', icon: <FileText className="w-4 h-4 mr-1.5" />, action: 'Заметки' },
  ];

  if (!activeProperty) return null;

  const formatTime = (iso: string) => format(parseISO(iso), 'HH:mm');

  return (
    <div className="flex flex-col flex-1 w-full h-full bg-[#f8f9fa] relative">
      {/* Floating Header */}
      <div className="absolute top-0 left-0 right-0 z-30 flex justify-between items-center p-4 pointer-events-none">
        <button 
          onClick={() => setView('main_chat')} 
          className="pointer-events-auto w-11 h-11 bg-white/90 backdrop-blur-md shadow-sm rounded-full flex items-center justify-center text-slate-700 hover:bg-white transition-colors md:hidden"
        >
          <ChevronLeft className="w-[26px] h-[26px] pr-0.5" />
        </button>
        
        <div className="relative pointer-events-auto ml-auto">
          <div className="h-11 bg-white/90 backdrop-blur-md shadow-sm rounded-full px-1.5 flex items-center gap-1.5">
            <button 
              onClick={() => activeProperty && setPropertyReaction(activeProperty.id, activeProperty.reaction === 'like' ? null : 'like')}
              className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors ${activeProperty?.reaction === 'like' ? 'text-emerald-600 bg-emerald-50' : 'text-slate-600 hover:text-emerald-600 hover:bg-emerald-50'}`}
            >
              <ThumbsUp className="w-[18px] h-[18px]" />
            </button>
            <button 
              onClick={() => activeProperty && setPropertyReaction(activeProperty.id, activeProperty.reaction === 'dislike' ? null : 'dislike')}
              className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors ${activeProperty?.reaction === 'dislike' ? 'text-red-600 bg-red-50' : 'text-slate-600 hover:text-red-600 hover:bg-red-50'}`}
            >
              <ThumbsDown className="w-[18px] h-[18px]" />
            </button>
            <div className="w-[1px] h-5 bg-slate-200 mx-0.5"></div>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="w-9 h-9 flex items-center justify-center text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
            >
              <MoreVertical className="w-[18px] h-[18px]" />
            </button>
          </div>

          {/* Dropdown Menu */}
          <AnimatePresence>
            {isMenuOpen && (
              <>
                <div 
                  className="absolute inset-0 z-40"
                  onClick={() => setIsMenuOpen(false)}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-14 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 overflow-hidden"
                >
                  <button className="w-full flex items-center gap-3 px-4 py-3 text-[14px] font-medium text-slate-700 hover:bg-slate-50 transition-colors text-left">
                    <GitCompare className="w-4 h-4 text-slate-400" />
                    Сравнить
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-3 text-[14px] font-medium text-slate-700 hover:bg-slate-50 transition-colors text-left">
                    <ExternalLink className="w-4 h-4 text-slate-400" />
                    Перейти к объекту
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-3 text-[14px] font-medium text-slate-700 hover:bg-slate-50 transition-colors text-left">
                    <Share2 className="w-4 h-4 text-slate-400" />
                    Поделиться
                  </button>
                  <div className="h-[1px] bg-slate-100 my-1"></div>
                  <button className="w-full flex items-center gap-3 px-4 py-3 text-[14px] font-medium text-red-600 hover:bg-red-50 transition-colors text-left">
                    <Flag className="w-4 h-4 text-red-400" />
                    Пожаловаться
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto pb-4 min-h-0" ref={scrollRef}>
        
        {activeMessageId && (
          <div 
            className="absolute inset-0 z-20" 
            onClick={() => setActiveMessageId(null)} 
          />
        )}
        <div className="h-[72px]"></div> {/* Spacer for header (reduced by 8px) */}

        {messages.map((msg, index) => {
          const isFirstInGroup = index === 0 || messages[index - 1].sender !== msg.sender;
          
          return (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              key={msg.id} 
              className={`flex flex-col px-4 w-full ${msg.sender === 'user' ? 'items-end' : 'items-start'} ${index === 0 ? 'mt-0' : isFirstInGroup ? 'mt-4' : 'mt-1'}`}
            >
              <div className={`relative group ${msg.sender === 'user' ? 'max-w-[85%]' : 'w-full'}`}>
                <AnimatePresence>
                  {activeMessageId === msg.id && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.5, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.5, y: 20 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      className={`absolute z-30 flex gap-1 bg-white/90 backdrop-blur-md shadow-xl rounded-full px-2 py-1.5 border border-slate-200/50 ${msg.sender === 'user' ? 'right-0 -top-14' : 'left-0 -top-14'}`}
                    >
                      {EMOJIS.map((emoji, i) => (
                        <motion.button 
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.05, type: 'spring', stiffness: 500 }}
                          key={emoji}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleReaction(msg.id, emoji);
                            setActiveMessageId(null);
                          }}
                          className="w-9 h-9 flex items-center justify-center hover:bg-slate-100 rounded-full text-2xl transition-transform hover:scale-125 active:scale-95"
                        >
                          {emoji}
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {msg.type === 'property_details' && msg.properties && msg.properties[0] ? (
                  <div 
                    onClick={() => setActiveMessageId(activeMessageId === msg.id ? null : msg.id)}
                    className="w-full cursor-pointer"
                  >
                    {/* Markdown-style Content (Top) */}
                    <div className="text-[15px] leading-relaxed break-words min-w-0 prose prose-slate prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-[#1e1e1e] prose-pre:text-slate-50 prose-code:text-pink-500 prose-code:bg-slate-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none prose-headings:mt-4 prose-headings:mb-2 prose-h1:text-2xl prose-h1:font-bold prose-h1:leading-tight prose-h2:text-lg prose-h3:text-base prose-li:my-0.5 mb-4">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {`# ${msg.properties[0].title}

**Цена:** ${msg.properties[0].price}
**📍 Локация:** ${msg.properties[0].location}`}
                      </ReactMarkdown>
                    </div>

                    {/* Swipeable Photo Gallery */}
                    <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar -mx-4 px-4 mb-4 gap-3 after:content-[''] after:w-1 after:shrink-0">
                      {msg.properties[0].images && msg.properties[0].images.length > 0 ? (
                        msg.properties[0].images.map((img, idx) => (
                          <div key={idx} className="relative w-[85vw] sm:w-[320px] h-64 shrink-0 snap-start snap-always rounded-2xl overflow-hidden shadow-sm border border-slate-200/60">
                            <Image src={img} fill className="object-cover" alt={`Property image ${idx + 1}`} />
                          </div>
                        ))
                      ) : (
                        <div className="relative w-[85vw] sm:w-[320px] h-64 shrink-0 snap-start snap-always rounded-2xl overflow-hidden shadow-sm border border-slate-200/60">
                          <Image src={msg.properties[0].image} fill className="object-cover" alt="Property" />
                        </div>
                      )}
                    </div>

                    {/* Markdown-style Content (Bottom) */}
                    <div className="text-[15px] leading-relaxed break-words min-w-0 prose prose-slate prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-[#1e1e1e] prose-pre:text-slate-50 prose-code:text-pink-500 prose-code:bg-slate-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none prose-headings:mt-4 prose-headings:mb-2 prose-h1:text-2xl prose-h1:font-bold prose-h1:leading-tight prose-h2:text-lg prose-h3:text-base prose-li:my-0.5">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {`### Основная информация
* **Тип:** ${msg.properties[0].type || 'Квартира'}
* **Комнаты:** ${msg.properties[0].rooms || '—'}
* **Площадь:** ${msg.properties[0].area ? `${msg.properties[0].area} м²` : '—'}
* **Этаж:** ${msg.properties[0].floor ? `${msg.properties[0].floor} из ${msg.properties[0].totalFloors || '—'}` : '—'}

${msg.properties[0].livingArea || msg.properties[0].kitchenArea || msg.properties[0].ceilingHeight ? `### Детали помещения
${msg.properties[0].livingArea ? `* **Жилая площадь:** ${msg.properties[0].livingArea} м²\n` : ''}${msg.properties[0].kitchenArea ? `* **Кухня:** ${msg.properties[0].kitchenArea} м²\n` : ''}${msg.properties[0].ceilingHeight ? `* **Потолки:** ${msg.properties[0].ceilingHeight} м\n` : ''}${msg.properties[0].renovation ? `* **Ремонт:** ${msg.properties[0].renovation}\n` : ''}${msg.properties[0].bathroomType ? `* **Санузел:** ${msg.properties[0].bathroomType}\n` : ''}` : ''}

### Описание
${msg.properties[0].description || "Прекрасный объект недвижимости в отличном районе. Современные удобства и просторные комнаты."}

${msg.properties[0].building ? `### О здании
* **Название:** ${msg.properties[0].building.name || '—'}
* **Год постройки:** ${msg.properties[0].building.year || '—'}
* **Тип дома:** ${msg.properties[0].building.type || '—'}
* **Лифты:** ${msg.properties[0].building.elevatorPassenger || 0} пасс., ${msg.properties[0].building.elevatorFreight || 0} груз.
` : ''}

${msg.properties[0].rentalConditions ? `### Условия аренды
* **Залог:** ${msg.properties[0].rentalConditions.deposit ? `${msg.properties[0].rentalConditions.deposit} $` : '—'}
* **Комиссия:** ${msg.properties[0].rentalConditions.commission || 0}${msg.properties[0].rentalConditions.commissionType === 'percent' ? '%' : ' $'}
* **Мин. срок:** ${msg.properties[0].rentalConditions.minRentalMonths || '—'} мес.
* **Животные:** ${msg.properties[0].rentalConditions.petsAllowed ? 'Можно' : 'Нет'}
` : ''}

${msg.properties[0].nearbyTransportList && msg.properties[0].nearbyTransportList.length > 0 ? `### Транспорт
${msg.properties[0].nearbyTransportList.map(t => `* ${t.type === 'metro' ? '🚇' : '🚌'} **${t.name}** (${t.walkMinutes} мин. пешком)`).join('\n')}
` : ''}

${msg.properties[0].amenities ? `### Удобства
${msg.properties[0].amenities.map((a: string) => `* ${a}`).join('\n')}
` : ''}`}
                      </ReactMarkdown>
                    </div>

                    {/* Agent Card */}
                    {msg.properties[0].author && (
                      <div className="mt-6 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-full overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center">
                            {msg.properties[0].author.avatar ? (
                              <Image src={msg.properties[0].author.avatar} fill className="object-cover" alt={msg.properties[0].author.name} />
                            ) : (
                              <span className="text-slate-400 font-medium text-lg">{msg.properties[0].author.name.charAt(0)}</span>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="font-semibold text-slate-800 text-[15px]">{msg.properties[0].author.name}</h4>
                              {msg.properties[0].author.isVerified && (
                                <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
                              )}
                            </div>
                            <div className="text-[13px] text-slate-500 font-medium">
                              {msg.properties[0].author.type === 'agent' ? 'Агент' : msg.properties[0].author.type === 'agency' ? 'Агентство' : 'Собственник'}
                              {msg.properties[0].author.agencyName && ` • ${msg.properties[0].author.agencyName}`}
                            </div>
                            <div className="flex items-center gap-2 text-[12px] text-slate-500 mt-1">
                              {msg.properties[0].author.rating && (
                                <span className="flex items-center gap-0.5 text-amber-500 font-medium">
                                  <Star className="w-3.5 h-3.5 fill-current" /> {msg.properties[0].author.rating}
                                </span>
                              )}
                              {msg.properties[0].author.reviewsCount && (
                                <>
                                  <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                  <span>{msg.properties[0].author.reviewsCount} отзывов</span>
                                </>
                              )}
                              {msg.properties[0].author.objectsCount && (
                                <>
                                  <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                  <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {msg.properties[0].author.objectsCount} объектов</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="w-8 h-8 shrink-0 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 ml-2">
                          <ChevronRight className="w-5 h-5" />
                        </div>
                      </div>
                    )}
                  </div>
                ) : msg.type === 'map' ? (
                  <div className="bg-white rounded-[24px] shadow-sm overflow-hidden border border-slate-200 w-full max-w-[340px] relative flex flex-col">
                    <div className="relative w-full h-[240px] bg-slate-100">
                      <Image 
                        src="https://picsum.photos/seed/map/600/600" 
                        fill 
                        className="object-cover" 
                        alt="Map view" 
                      />
                      {/* Map Pins */}
                      <div className="absolute top-[20%] left-[20%] bg-white px-2 py-1 rounded-full shadow-md flex items-center gap-1 text-[13px] font-bold text-slate-800">
                        <span>★ 4.6</span>
                      </div>
                      <div className="absolute top-[45%] right-[25%] bg-slate-900 text-white px-2 py-1 rounded-full shadow-md flex items-center gap-1 text-[13px] font-bold">
                        <span>★ 4.9</span>
                      </div>
                      
                      <button 
                        onClick={() => setFullscreenMapId(msg.id)} 
                        className="absolute top-3 right-3 bg-white/90 backdrop-blur-md p-2 rounded-xl shadow-sm text-slate-700 hover:bg-white transition-colors"
                      >
                        <Maximize2 className="w-5 h-5" />
                      </button>
                    </div>
                    
                    {/* Filters (Scrollable) */}
                    <div className="bg-white p-3 border-t border-slate-100 shrink-0">
                      <div className="flex overflow-x-auto gap-2 hide-scrollbar pb-1">
                        {['🚇 Транспорт', '🛒 Магазины', '🏥 Медицина', '🎓 Школы', '🌳 Парки'].map(filter => (
                          <button key={filter} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-[12px] font-medium shrink-0 transition-colors whitespace-nowrap">
                            {filter}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : msg.type === 'contact_card' ? (
                  <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-slate-100 w-full max-w-[340px] p-4 space-y-3">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-slate-200 rounded-full overflow-hidden relative shrink-0">
                        <Image src="https://picsum.photos/seed/agent2/100/100" fill className="object-cover" alt="Agent" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-900 truncate">{activeProperty?.author?.name || 'Агент'}</h4>
                        <p className="text-[13px] text-slate-500 truncate">{activeProperty?.author?.type === 'owner' ? 'Собственник' : 'Агентство'}</p>
                      </div>
                    </div>
                    <a href={`tel:${activeProperty?.author?.phone || '+1234567890'}`} className="flex items-center justify-center gap-2 p-3 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors font-medium text-[15px]">
                      <Phone className="w-5 h-5" /> Позвонить
                    </a>
                    <div className="grid grid-cols-2 gap-2">
                      <a href={`https://wa.me/${(activeProperty?.author?.phone || '1234567890').replace(/\D/g,'')}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 p-3 rounded-xl bg-green-50 text-green-600 hover:bg-green-100 transition-colors font-medium text-[14px]">
                        <MessageCircle className="w-5 h-5" /> WhatsApp
                      </a>
                      <a href={`https://t.me/username`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 p-3 rounded-xl bg-sky-50 text-sky-600 hover:bg-sky-100 transition-colors font-medium text-[14px]">
                        <Send className="w-5 h-5" /> Telegram
                      </a>
                    </div>
                    <a href={`mailto:contact@example.com`} className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors font-medium text-[14px]">
                      <Mail className="w-5 h-5" /> Email
                    </a>
                  </div>
                ) : msg.type === 'form' ? (
                  <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-slate-100 w-full max-w-[340px]">
                    <div className="p-4 border-b border-slate-100 bg-slate-50">
                      <span className="text-[15px] font-semibold text-slate-900 leading-relaxed break-words min-w-0">{msg.text}</span>
                    </div>
                    <div className="p-4 space-y-3">
                      <input type="text" placeholder="Your Name" className="w-full p-3 rounded-xl border border-slate-200 text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50" />
                      <input type="tel" placeholder="Phone Number" className="w-full p-3 rounded-xl border border-slate-200 text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50" />
                      <textarea placeholder="Message" rows={2} className="w-full p-3 rounded-xl border border-slate-200 text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none bg-slate-50"></textarea>
                      <Button className="w-full rounded-xl bg-slate-900 hover:bg-slate-800 text-white py-3 text-[14px] font-medium mt-2">
                        Send Request
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div 
                    onClick={() => setActiveMessageId(activeMessageId === msg.id ? null : msg.id)}
                    className={`relative cursor-pointer transition-transform active:scale-[0.98] ${
                      msg.sender === 'user' 
                        ? `px-4 py-2.5 shadow-sm bg-slate-100 text-slate-900 rounded-3xl ${isFirstInGroup ? 'rounded-tr-sm' : ''}` 
                        : `w-full text-slate-900`
                    }`}
                  >
                    {msg.sender === 'user' ? (
                      <div className="flex flex-wrap items-end gap-x-3 gap-y-1">
                        <span className="text-[15px] leading-relaxed break-words min-w-0">{msg.text}</span>
                        <div className="flex items-center shrink-0 ml-auto text-slate-400">
                          <span className="text-[11px]">{formatTime(msg.timestamp)}</span>
                          <CheckCheck className="w-3.5 h-3.5 ml-1 text-slate-400" />
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-y-1">
                        <div className="text-[15px] leading-relaxed break-words min-w-0 prose prose-slate prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-[#1e1e1e] prose-pre:text-slate-50 prose-code:text-pink-500 prose-code:bg-slate-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none prose-headings:mt-4 prose-headings:mb-2 prose-h1:text-xl prose-h2:text-lg prose-h3:text-base prose-li:my-0.5">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Display Reactions */}
                {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                  <div className={`flex flex-wrap gap-1 mt-1 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <AnimatePresence>
                      {Object.entries(msg.reactions).map(([emoji, count]) => (
                        <motion.button
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          whileTap={{ scale: 0.8 }}
                          key={emoji}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleReaction(msg.id, emoji);
                          }}
                          className={`flex items-center justify-center gap-1 px-2 py-0.5 rounded-full text-[12px] font-medium border shadow-sm transition-colors ${
                            msg.sender === 'user' 
                              ? 'bg-blue-500 text-white border-blue-400 hover:bg-blue-600' 
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <span>{emoji}</span>
                          {count > 1 && <span className="text-[10px] opacity-80">{count}</span>}
                        </motion.button>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}

        {isTyping && (
          <div className="flex items-start mt-4">
            <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex gap-1 items-center h-[38px]">
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="bg-white/95 backdrop-blur-sm flex flex-col z-20 shrink-0 border-t border-slate-100">
        {/* Hot Buttons */}
        <div className="flex overflow-x-auto gap-2 px-3 pt-3 pb-1 hide-scrollbar">
          {hotButtons.map((btn, i) => (
            <Button 
              key={i} 
              variant="outline" 
              size="sm" 
              className="rounded-full shrink-0 border-slate-200 text-slate-700 bg-white hover:bg-slate-50 h-8"
              onClick={() => handleSend(btn.action)}
            >
              {btn.icon}
              {btn.label}
            </Button>
          ))}
        </div>

        <div className="p-2 flex items-end gap-2">
          <Button variant="ghost" size="icon" className="text-slate-400 shrink-0 mb-0.5">
            <Paperclip className="w-6 h-6" />
          </Button>
          <div className="flex-1 bg-slate-100 rounded-2xl relative min-h-[44px] flex items-center">
            <textarea 
              ref={textareaRef}
              value={input} 
              onChange={e => setInput(e.target.value)}
              onInput={handleInput}
              placeholder="Message..." 
              className="w-full bg-transparent border-none px-4 py-3 text-[15px] focus:outline-none resize-none max-h-32 min-h-[44px]"
              rows={1}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
          </div>
          {input.trim() ? (
            <Button onClick={() => handleSend()} size="icon" className="rounded-full bg-blue-500 hover:bg-blue-600 text-white shrink-0 w-11 h-11 mb-0.5 shadow-sm">
              <Send className="w-5 h-5 ml-0.5" />
            </Button>
          ) : (
            <Button variant="ghost" size="icon" className="text-slate-400 shrink-0 mb-0.5 w-11 h-11">
              <Mic className="w-6 h-6" />
            </Button>
          )}
        </div>
      </div>

      {/* Fullscreen Map Overlay */}
      <AnimatePresence>
        {fullscreenMapId && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute inset-0 z-50 bg-white flex flex-col"
          >
            <div className="absolute top-0 left-0 right-0 p-4 z-20 flex justify-between items-start pointer-events-none">
              <button onClick={() => setFullscreenMapId(null)} className="pointer-events-auto w-10 h-10 bg-white/90 backdrop-blur-md shadow-sm rounded-full flex items-center justify-center text-slate-700 hover:bg-white transition-colors">
                <ChevronLeft className="w-6 h-6 pr-0.5" />
              </button>
            </div>
            
            <div className="relative flex-1 bg-slate-100 w-full">
              <Image src="https://picsum.photos/seed/map/1200/1200" fill className="object-cover" alt="Map view" />
              {/* Map Pins */}
              <div className="absolute top-[30%] left-[30%] bg-white px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1 text-[14px] font-bold text-slate-800">
                <span>★ 4.6</span>
              </div>
              <div className="absolute top-[60%] right-[30%] bg-slate-900 text-white px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1 text-[14px] font-bold">
                <span>★ 4.9</span>
              </div>
              
              {/* Place Card Overlay */}
              <div className="absolute bottom-6 left-4 right-4 bg-white rounded-2xl shadow-xl p-4 flex gap-4 items-center">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0">
                  <Image src={activeProperty?.images?.[0] || activeProperty?.image || "https://picsum.photos/seed/office/100/100"} fill className="object-cover" alt="Place" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-slate-900 text-[16px] truncate">{activeProperty?.title || 'Объект'}</span>
                  <span className="text-slate-600 text-[14px] truncate">{activeProperty?.location}</span>
                  <span className="text-blue-600 font-semibold text-[14px] mt-1">{activeProperty?.price}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 border-t border-slate-100 shrink-0 z-10 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
              <div className="flex overflow-x-auto gap-2 hide-scrollbar pb-2">
                {['🚇 Транспорт', '🛒 Магазины', '🏥 Медицина', '🎓 Школы', '🌳 Парки', '💪 Фитнес'].map(filter => (
                  <button key={filter} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-[14px] font-medium shrink-0 transition-colors whitespace-nowrap">
                    {filter}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
  так же без эмодзы. Без хардкода, архитектура fsd. Стили карточек должны быть из нашего приложения. Без хардкода. Производительно. Чаты по дефолту долнжы быть с ии агентом которого зовут bro, (предложения и пожелания) = обычный чат куда предлагют пользователи 
  улучшения и служба поддержки, тоже обычный чат
  
