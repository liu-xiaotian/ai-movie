import React from "react";
import {
  Mail,
  Edit3,
  Lock,
  Zap,
  BarChart3,
  Clock,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  LogOut,
  Camera,
  ChevronRight,
} from "lucide-react";

export default function AccountPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FD] p-12 text-slate-800">
      <div className="max-w-5xl mx-auto">
        {/* --- Header Section: User Info --- */}
        <header className="flex items-center gap-8 mb-12">
          <div className="relative">
            <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=300"
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <button className="absolute bottom-0 right-0 p-2 bg-indigo-600 text-white rounded-full border-2 border-white hover:bg-indigo-700 transition-all">
              <Camera size={16} />
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-bold text-slate-900">Xiaotian</h1>
              <span className="flex items-center gap-1 px-2.5 py-0.5 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-md border border-indigo-100">
                ★ 专业版用户
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-400 font-medium">
              <Mail size={16} /> xiaotian3303@gmail.com
            </div>
            <div className="flex gap-4 pt-1">
              <button className="text-indigo-600 text-sm font-bold hover:underline">
                编辑个人资料
              </button>
              <span className="text-slate-200">|</span>
              <button className="text-slate-400 text-sm font-medium hover:text-slate-600 transition-colors">
                更改密码
              </button>
            </div>
          </div>
        </header>

        {/* --- Top Stats Row --- */}
        <div className="grid grid-cols-3 gap-6 mb-10">
          <StatCard
            icon={<Zap className="text-indigo-600" />}
            label="已翻译字幕"
            value="12,450"
            bgColor="bg-indigo-50/50"
          />
          <StatCard
            icon={<BarChart3 className="text-indigo-600" />}
            label="项目总数"
            value="42"
            bgColor="bg-slate-100/50"
          />
          <StatCard
            icon={<Clock className="text-indigo-600" />}
            label="活跃天数"
            value="156"
            bgColor="bg-slate-100/50"
          />
        </div>

        <div className="grid grid-cols-12 gap-10">
          {/* --- Left Column: Subscription & Usage --- */}
          <div className="col-span-7 space-y-10">
            {/* Subscription Plan Card */}
            <section className="bg-white border border-slate-100 rounded-[40px] p-10 shadow-sm relative overflow-hidden">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold mb-1">订阅计划</h3>
                  <p className="text-slate-400 text-sm">
                    您的专业版订阅将于 2026 年 10 月 15 日续订。
                  </p>
                </div>
                <div className="bg-indigo-50 px-4 py-2 rounded-xl text-indigo-600 font-bold text-sm border border-indigo-100">
                  $19.99 / 月
                </div>
              </div>

              <div className="grid grid-cols-2 gap-y-4 mb-10">
                <FeatureItem label="无限 AI 翻译额度" />
                <FeatureItem label="优先处理队列" />
                <FeatureItem label="支持 4K 视频预览" />
                <FeatureItem label="自定义术语库" />
                <FeatureItem label="团队协作功能" />
                <FeatureItem label="全天候技术支持" />
              </div>

              <div className="flex gap-4">
                <button className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
                  升级订阅
                </button>
                <button className="flex-1 bg-slate-50 text-slate-500 border border-slate-100 py-4 rounded-2xl font-bold hover:bg-slate-100 transition-all">
                  管理账单
                </button>
              </div>
            </section>

            {/* Usage Records */}
            <section className="bg-slate-100/40 rounded-[40px] p-10">
              <h3 className="text-xl font-bold mb-8">使用记录</h3>
              <div className="space-y-6">
                <UsageRow title="星际穿越" date="2026-03-21" amount="1,240" />
                <UsageRow
                  title="银翼杀手 2049"
                  date="2026-03-20"
                  amount="850"
                />
                <UsageRow title="降临" date="2026-03-18" amount="2,100" />
                <button className="w-full text-indigo-600 text-sm font-bold pt-4 hover:underline transition-all">
                  查看完整报告
                </button>
              </div>
            </section>
          </div>

          {/* --- Right Column: Security & Settings --- */}
          <div className="col-span-5 space-y-6">
            {/* Account Security Card */}
            <section className="bg-slate-100/40 border border-white/50 rounded-[40px] p-8">
              <h3 className="text-xl font-bold mb-6">账户安全</h3>
              <div className="space-y-3">
                <SecurityOption
                  icon={<ShieldCheck size={20} />}
                  label="双重身份验证"
                />
                <SecurityOption
                  icon={<CreditCard size={20} />}
                  label="支付方式"
                />
              </div>
            </section>

            {/* Logout Button */}
            <button className="w-full flex items-center justify-center gap-2 py-5 rounded-3xl border border-red-100 bg-white text-red-500 font-bold hover:bg-red-50 transition-all shadow-sm">
              <LogOut size={20} /> 退出登录
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Sub-components ---

const StatCard = ({ icon, label, value, bgColor }: any) => (
  <div
    className={`p-6 rounded-[32px] border border-white shadow-sm flex items-center gap-5 ${bgColor}`}
  >
    <div className="p-4 bg-white rounded-2xl text-indigo-600 shadow-sm">
      {icon}
    </div>
    <div>
      <p className="text-slate-400 text-xs font-bold mb-0.5">{label}</p>
      <p className="text-2xl font-bold text-slate-800 tracking-tight">
        {value}
      </p>
    </div>
  </div>
);

const FeatureItem = ({ label }: { label: string }) => (
  <div className="flex items-center gap-2.5 text-slate-500 font-medium text-sm">
    <CheckCircle2 size={16} className="text-indigo-400" />
    {label}
  </div>
);

const UsageRow = ({ title, date, amount }: any) => (
  <div className="flex justify-between items-center group">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm border border-slate-50 group-hover:text-indigo-600 transition-colors">
        <Zap size={18} />
      </div>
      <div>
        <p className="font-bold text-slate-700">{title}</p>
        <p className="text-xs text-slate-400">{date}</p>
      </div>
    </div>
    <div className="text-right">
      <span className="font-bold text-slate-700">{amount}</span>
      <span className="text-xs text-slate-400 ml-1">字幕行</span>
    </div>
  </div>
);

const SecurityOption = ({ icon, label }: any) => (
  <button className="w-full flex items-center justify-between p-5 bg-slate-200/50 hover:bg-slate-200/80 rounded-2xl transition-all group">
    <div className="flex items-center gap-3 font-bold text-slate-600">
      <span className="text-slate-400">{icon}</span> {label}
    </div>
    <ChevronRight
      size={18}
      className="text-slate-400 group-hover:translate-x-1 transition-transform"
    />
  </button>
);
