import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetAndReload = () => {
    try {
      // Clear app state but keep catalog templates if possible
      localStorage.removeItem('rt_lab_reports_v2');
      localStorage.removeItem('rt_lab_reports_v1');
      localStorage.removeItem('rt_lab_incoming_orders_queue');
      localStorage.removeItem('rt_lab_cases_sync_v1');
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(regs => {
          regs.forEach(r => r.unregister());
        });
      }
      if ('caches' in window) {
        caches.keys().then(keys => {
          keys.forEach(k => caches.delete(k));
        });
      }
    } catch (e) {
      console.error(e);
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4 font-sans" dir="rtl">
          <div className="max-w-xl w-full bg-slate-800 border border-rose-900/50 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-rose-600/20 text-rose-500 flex items-center justify-center border border-rose-500/30">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-lg font-black text-white">منظومة RT LAB - تنبيه تشغيل</h1>
                <p className="text-xs text-rose-300">حدث استثناء أثناء تحميل أو عرض بيانات البرنامج</p>
              </div>
            </div>

            <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-700/60 font-mono text-xs text-rose-400 overflow-x-auto space-y-2">
              <div className="font-bold text-slate-300">رسالة الخطأ:</div>
              <div className="whitespace-pre-wrap">{this.state.error?.message || 'خطأ غير معروف أثناء التشغيل'}</div>
            </div>

            <div className="text-xs text-slate-400 leading-relaxed">
              إذا ظهرت هذه الرسالة، يمكنك ببساطة تحديث الصفحة أو تصفير الذاكرة المؤقتة لإعادة فتح النظام فوراً دون أي مشاكل.
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-800 to-rose-700 hover:from-red-900 hover:to-rose-800 text-white rounded-xl text-xs font-bold shadow-md transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                <span>إعادة تحميل البرنامج</span>
              </button>

              <button
                type="button"
                onClick={this.handleResetAndReload}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl text-xs font-bold transition-all border border-slate-600"
              >
                <Trash2 className="w-4 h-4 text-rose-400" />
                <span>مسح الذاكرة المؤقتة والتشغيل من جديد</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
