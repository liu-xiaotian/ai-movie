import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bgLight p-4">
      <div className="w-full max-w-md rounded-[32px] border border-gray-100 bg-white p-10 text-center shadow-sm">
        <h1 className="mb-3 text-3xl font-bold text-gray-900">忘记密码</h1>
        <p className="mb-8 text-sm leading-6 text-gray-500">
          重置密码流程还没有接入，这里先保留页面入口，避免构建被空文件阻塞。
        </p>
        <Link
          href="/login"
          className="inline-flex items-center justify-center rounded-2xl bg-brand px-6 py-3 font-semibold text-white transition-opacity hover:opacity-90"
        >
          返回登录
        </Link>
      </div>
    </div>
  );
}
