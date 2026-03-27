import React from "react";
import { User, Mail, Lock, ShieldCheck } from "lucide-react";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-bgLight flex items-center justify-center p-4">
      <div className="w-full max-w-[500px] bg-white rounded-[32px] shadow-sm border border-gray-100 p-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">创建新账号</h1>
          <p className="text-gray-500">加入我们的专业版用户行列</p>
        </div>

        <form className="space-y-5">
          <div className="grid grid-cols-1 gap-5">
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="用户名称"
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-brand/20 outline-none"
              />
            </div>

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                placeholder="邮箱地址"
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-brand/20 outline-none"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="password"
                placeholder="设置密码"
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-brand/20 outline-none"
              />
            </div>
          </div>

          <div className="bg-brand/5 p-4 rounded-2xl border border-brand/10">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-brand mt-0.5" />
              <p className="text-xs text-gray-600 leading-relaxed">
                注册即表示您同意我们的服务条款。您的账户将受双重身份验证保护，确保数据安全。
              </p>
            </div>
          </div>

          <button className="w-full bg-brand hover:bg-opacity-90 text-white font-bold py-4 rounded-2xl shadow-lg shadow-brand/20 transition-all mt-4">
            开启免费试用
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            已有账号？
            <a href="/login" className="text-brand font-bold ml-1">
              返回登录
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
