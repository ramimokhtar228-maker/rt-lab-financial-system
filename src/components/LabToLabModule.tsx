import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { LabToLabOrder } from '../types';
import {
  Network,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  DollarSign,
  FileCheck,
  Edit2,
  Trash2,
  Building2,
  Calendar
} from 'lucide-react';
import { playScanSuccessSound } from '../utils/barcode';

export const LabToLabModule: React.FC = () => {
  const {
    labToLabOrders,
    addLabToLabOrder,
    updateLabToLabOrder,
    deleteLabToLabOrder,
    language
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | LabToLabOrder['resultStatus']>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<LabToLabOrder | null>(null);
  const [editPatient, setEditPatient] = useState('');
  const [editLab, setEditLab] = useState('');
  const [editTests, setEditTests] = useState('');
  const [editOutsourcedCost, setEditOutsourcedCost] = useState<number>(0);
  const [editPatientCharged, setEditPatientCharged] = useState<number>(0);
  const [editSampleType, setEditSampleType] = useState('');

  // Form State
  const [patientName, setPatientName] = useState('');
  const [patientLabNumber, setPatientLabNumber] = useState('');
  const [externalLabName, setExternalLabName] = useState('معمل ألفا التخصصي (Alfa Lab)');
  const [testsText, setTestsText] = useState('');
  const [sampleType, setSampleType] = useState('EDTA Whole Blood (Frozen)');
  const [outsourcedCost, setOutsourcedCost] = useState<number>(500);
  const [patientChargedPrice, setPatientChargedPrice] = useState<number>(900);
  const [expectedDate, setExpectedDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  });
  const [notes, setNotes] = useState('');

  // Metrics
  const metrics = useMemo(() => {
    const totalOrders = labToLabOrders.length;
    const totalOutsourcedCost = labToLabOrders.reduce((acc, o) => acc + o.outsourcedCost, 0);
    const totalCharged = labToLabOrders.reduce((acc, o) => acc + o.patientChargedPrice, 0);
    const totalProfit = labToLabOrders.reduce((acc, o) => acc + o.profitMargin, 0);
    const pendingOrders = labToLabOrders.filter(o => o.resultStatus === 'sent' || o.resultStatus === 'processing').length;

    return { totalOrders, totalOutsourcedCost, totalCharged, totalProfit, pendingOrders };
  }, [labToLabOrders]);

  const filteredOrders = useMemo(() => {
    return labToLabOrders.filter(order => {
      if (statusFilter !== 'all' && order.resultStatus !== statusFilter) return false;
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesPatient = order.patientName.toLowerCase().includes(term);
        const matchesLabNo = order.patientLabNumber.toLowerCase().includes(term);
        const matchesExtLab = order.externalLabName.toLowerCase().includes(term);
        const matchesOrderNo = order.orderNumber.toLowerCase().includes(term);
        if (!matchesPatient && !matchesLabNo && !matchesExtLab && !matchesOrderNo) return false;
      }
      return true;
    });
  }, [labToLabOrders, statusFilter, searchTerm]);

    const handleOpenEditOrder = (o: LabToLabOrder) => {
    setEditingOrder(o);
    setEditPatient(o.patientName);
    setEditLab(o.externalLabName);
    setEditTests(o.testNames.join(', '));
    setEditOutsourcedCost(o.outsourcedCost);
    setEditPatientCharged(o.patientChargedPrice);
    setEditSampleType(o.sampleType);
  };

  const handleSaveEditOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;
    const testList = editTests.split(',').map(s => s.trim()).filter(Boolean);
    updateLabToLabOrder(editingOrder.id, {
      patientName: editPatient,
      externalLabName: editLab,
      testNames: testList.length > 0 ? testList : editingOrder.testNames,
      outsourcedCost: editOutsourcedCost,
      patientChargedPrice: editPatientCharged,
      sampleType: editSampleType
    });
    setEditingOrder(null);
  };

  const handleSaveOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) return;

    const profit = Math.max(0, patientChargedPrice - outsourcedCost);

    addLabToLabOrder({
      orderNumber: `L2L-${new Date().getFullYear()}-${(labToLabOrders.length + 104).toString().padStart(4, '0')}`,
      patientName: patientName.trim(),
      patientLabNumber: patientLabNumber.trim() || `RT-${Date.now().toString().slice(-4)}`,
      externalLabName,
      testNames: testsText.split(',').map(s => s.trim()).filter(Boolean),
      sampleType,
      dateSent: new Date().toISOString().split('T')[0],
      expectedDate,
      outsourcedCost: Number(outsourcedCost) || 0,
      patientChargedPrice: Number(patientChargedPrice) || 0,
      profitMargin: profit,
      paymentToExternalStatus: 'unpaid',
      resultStatus: 'sent',
      notes
    });

    playScanSuccessSound();
    setIsAddModalOpen(false);
    setPatientName('');
    setPatientLabNumber('');
    setTestsText('');
  };

  const handleStatusChange = (orderId: string, nextStatus: LabToLabOrder['resultStatus']) => {
    updateLabToLabOrder(orderId, { resultStatus: nextStatus });
    playScanSuccessSound();
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Network className="w-5 h-5 text-rose-800" />
              <span>{language === 'ar' ? 'إدارة تحاليل وعينات اللاب تو لاب (Lab-to-Lab)' : 'Lab-to-Lab Referral Orders'}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {language === 'ar'
                ? 'متابعة الفحوصات التخصصية المرسلة للمعامل المرجعية الخارجية، حساب التكلفة وهامش ربح معمل RT.'
                : 'Track outsourced diagnostic tests sent to reference labs, costs and profit margins.'}
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-rose-900 hover:bg-rose-950 rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'ar' ? 'إرسال عينة جديدة لمعمل خارجي' : 'New Referral'}</span>
          </button>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-[11px] text-slate-500 block">إجمالي العينات المحولة:</span>
            <span className="text-lg font-black font-mono text-slate-900 mt-0.5 block">
              {metrics.totalOrders} عينة
            </span>
            <span className="text-[10px] text-slate-400">إحالات خارجية</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-[11px] text-slate-500 block">سعر تحصيل RT من المرضى:</span>
            <span className="text-lg font-black font-mono text-slate-900 mt-0.5 block">
              {metrics.totalCharged.toLocaleString()} ج.م
            </span>
            <span className="text-[10px] text-slate-400">إجمالي إيراد الإحالات</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-[11px] text-slate-500 block">تكلفة المعامل الخارجية:</span>
            <span className="text-lg font-black font-mono text-rose-600 mt-0.5 block">
              {metrics.totalOutsourcedCost.toLocaleString()} ج.م
            </span>
            <span className="text-[10px] text-slate-400">المستحق للمرجعيات</span>
          </div>

          <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
            <span className="text-[11px] text-emerald-800 font-bold block">صافي أرباح معمل RT منها:</span>
            <span className="text-lg font-black font-mono text-emerald-900 mt-0.5 block">
              {metrics.totalProfit.toLocaleString()} ج.م
            </span>
            <span className="text-[10px] text-emerald-700">هامش الربح التشغيلي</span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="ابحث باسم المريض، كود العينة، اسم المعمل المرجعي..."
              className="w-full text-xs pr-8 pl-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-800"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as 'all' | LabToLabOrder['resultStatus'])}
            className="text-xs py-2 px-3 rounded-lg border border-slate-300 bg-white font-medium"
          >
            <option value="all">جميع حالات النتائج</option>
            <option value="sent">تم الإرسال (Sent)</option>
            <option value="processing">قيد التشغيل (Processing)</option>
            <option value="received">تم استلام النتيجة (Received)</option>
            <option value="delivered">تم التسليم للمريض (Delivered)</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right">
            <thead>
              <tr className="bg-slate-100/75 text-slate-700 font-bold border-b border-slate-200">
                <th className="py-3 px-4">رقم الإحالة / العينة</th>
                <th className="py-3 px-4">اسم المريض</th>
                <th className="py-3 px-4">المعمل الخارجي المرجعي</th>
                <th className="py-3 px-4">التحاليل المحولة</th>
                <th className="py-3 px-4">نوع وحالة العينة</th>
                <th className="py-3 px-4">تاريخ الإرسال / المتوقع</th>
                <th className="py-3 px-4">تكلفة المعمل الخارجي</th>
                <th className="py-3 px-4">المحصل من المريض</th>
                <th className="py-3 px-4">ربح معمل RT</th>
                <th className="py-3 px-4">حالة النتيجة</th>
                <th className="py-3 px-4 text-center">تحديث الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    لا توجد إحالات معملية خارجية مسجلة
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-slate-900">{order.orderNumber}</div>
                      <div className="text-[10px] font-mono text-rose-900">{order.patientLabNumber}</div>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">{order.patientName}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{order.externalLabName}</td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-900 max-w-[200px] truncate" title={order.testNames.join(', ')}>
                        {order.testNames.join(' · ')}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{order.sampleType}</td>
                    <td className="py-3 px-4 font-mono">
                      <div>{order.dateSent}</div>
                      <div className="text-[10px] text-slate-400">متوقع: {order.expectedDate}</div>
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-rose-600">
                      {order.outsourcedCost.toLocaleString()} ج
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {order.patientChargedPrice.toLocaleString()} ج
                    </td>
                    <td className="py-3 px-4 font-mono font-black text-emerald-800">
                      +{order.profitMargin.toLocaleString()} ج
                    </td>
                    <td className="py-3 px-4">
                      {order.resultStatus === 'delivered' ? (
                        <span className="font-bold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>سُلِّمت للمريض</span>
                        </span>
                      ) : order.resultStatus === 'received' ? (
                        <span className="font-bold text-blue-700 flex items-center gap-1">
                          <FileCheck className="w-3.5 h-3.5" />
                          <span>وصلت النتيجة</span>
                        </span>
                      ) : order.resultStatus === 'processing' ? (
                        <span className="font-bold text-amber-700 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>قيد التشغيل</span>
                        </span>
                      ) : (
                        <span className="font-bold text-slate-600">أُرسلت</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditOrder(order)}
                          className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                          title="تعديل بيانات طلب التحويل"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm()) {
                              deleteLabToLabOrder(order.id);
                            }
                          }}
                          className="p-1 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded transition-colors"
                          title="حذف الطلب"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        {order.resultStatus === 'sent' && (
                          <button
                            onClick={() => handleStatusChange(order.id, 'processing')}
                            className="px-2 py-1 bg-amber-50 text-amber-800 rounded border border-amber-200 text-[10px] font-bold"
                          >
                            تشغيل
                          </button>
                        )}
                        {order.resultStatus === 'processing' && (
                          <button
                            onClick={() => handleStatusChange(order.id, 'received')}
                            className="px-2 py-1 bg-blue-50 text-blue-800 rounded border border-blue-200 text-[10px] font-bold"
                          >
                            استلام
                          </button>
                        )}
                        {order.resultStatus === 'received' && (
                          <button
                            onClick={() => handleStatusChange(order.id, 'delivered')}
                            className="px-2 py-1 bg-emerald-50 text-emerald-800 rounded border border-emerald-200 text-[10px] font-bold"
                          >
                            تسليم
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: ADD L2L ORDER */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white font-bold text-sm flex justify-between items-center">
              <span>تحويل عينة جديدة إلى معمل خارجي (Lab-to-Lab)</span>
              <button onClick={() => setIsAddModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleSaveOrder} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">اسم المريض *</label>
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={e => setPatientName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">كود عينة RT</label>
                  <input
                    type="text"
                    value={patientLabNumber}
                    onChange={e => setPatientLabNumber(e.target.value)}
                    placeholder="RT-2026-0899"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">المعمل المرجعي الخارجي</label>
                <select
                  value={externalLabName}
                  onChange={e => setExternalLabName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="معمل ألفا التخصصي (Alfa Lab)">معمل ألفا التخصصي (Alfa Lab)</option>
                  <option value="معمل البرج المرجعي المركزي (Al Borg Central Reference)">معمل البرج المرجعي المركزي (Al Borg Central)</option>
                  <option value="مختبرات سيتي لاب للوراثة الجزيئية">مختبرات سيتي لاب للوراثة الجزيئية (City Lab)</option>
                  <option value="كايرو سكان للباثولوجي والأورام">كايرو سكان للباثولوجي والأورام (Cairo Scan)</option>
                  <option value="معمل مبرة العصافرة التخصصي">معمل مبرة العصافرة التخصصي</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">أسماء التحاليل المحولة (مفصولة بفاصلة)</label>
                <input
                  type="text"
                  required
                  value={testsText}
                  onChange={e => setTestsText(e.target.value)}
                  placeholder="مثال: PCR Viral Load, Karyotyping, AMH..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">نوع وحفظ العينة</label>
                  <input
                    type="text"
                    value={sampleType}
                    onChange={e => setSampleType(e.target.value)}
                    placeholder="سيروم مجمد، دم كامل..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">تاريخ استلام النتيجة المتوقع</label>
                  <input
                    type="date"
                    value={expectedDate}
                    onChange={e => setExpectedDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <label className="block text-rose-700 font-bold mb-1">تكلفة المعمل الخارجي (ج.م):</label>
                  <input
                    type="number"
                    min={0}
                    value={outsourcedCost}
                    onChange={e => setOutsourcedCost(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">المحصل من المريض (ج.م):</label>
                  <input
                    type="number"
                    min={0}
                    value={patientChargedPrice}
                    onChange={e => setPatientChargedPrice(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-mono font-bold"
                  />
                </div>
                <div className="col-span-2 text-left pt-1">
                  <span className="text-[11px] text-slate-500">هامش ربح معمل RT المقدر: </span>
                  <span className="font-mono font-black text-emerald-800">
                    {(patientChargedPrice - outsourcedCost).toLocaleString()} ج.م
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 rounded text-slate-700"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-900 text-white rounded font-bold shadow-sm"
                >
                  تسجيل الإحالة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT ORDER */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">تعديل طلب التحويل الخارجي</h3>
                  <p className="text-[11px] text-slate-500 font-mono">{editingOrder.orderNumber}</p>
                </div>
              </div>
              <button type="button" onClick={() => setEditingOrder(null)} className="text-slate-400 hover:text-slate-700 text-sm">✕</button>
            </div>

            <form onSubmit={handleSaveEditOrder} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">اسم المريض *</label>
                <input
                  type="text"
                  required
                  value={editPatient}
                  onChange={e => setEditPatient(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-semibold"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">المعمل الخارجي المحول إليه *</label>
                <input
                  type="text"
                  required
                  value={editLab}
                  onChange={e => setEditLab(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">الفحوصات المحولة (مفصولة بفاصلة)</label>
                <input
                  type="text"
                  value={editTests}
                  onChange={e => setEditTests(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">تكلفة المعمل الخارجي (ج.م)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={editOutsourcedCost}
                    onChange={e => setEditOutsourcedCost(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-rose-700"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">سعر المريض المحصل (ج.م)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={editPatientCharged}
                    onChange={e => setEditPatientCharged(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-emerald-700"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingOrder(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-100 font-bold transition-all"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold shadow-md transition-all"
                >
                  حفظ التعديل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
