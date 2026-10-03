import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { InventoryCategory, InventoryItem } from '../types';
import {
  FlaskConical,
  Plus,
  AlertTriangle,
  Barcode,
  Search,
  CheckCircle2,
  Trash2,
  Edit2,
  ArrowUpRight,
  ArrowDownLeft,
  Printer,
  Calendar,
  Thermometer,
  Package,
  Layers
} from 'lucide-react';
import { generateBarcodeSVG, playScanSuccessSound } from '../utils/barcode';

export const InventoryModule: React.FC = () => {
  const {
    inventory,
    addInventoryItem,
    updateInventoryItem,
    restockItem,
    consumeReagent,
    deleteInventoryItem,
    currentUser,
    language,
    scannedBarcode,
    setScannedBarcode
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | InventoryCategory>('all');
  const [stockStatusFilter, setStockStatusFilter] = useState<'all' | 'low' | 'expiring' | 'ok'>('all');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [editItemName, setEditItemName] = useState('');
  const [editItemQty, setEditItemQty] = useState<number>(0);
  const [editItemThreshold, setEditItemThreshold] = useState<number>(0);
  const [editItemCost, setEditItemCost] = useState<number>(0);
  const [editItemSupplier, setEditItemSupplier] = useState('');
  const [editItemExpiry, setEditItemExpiry] = useState('');
  const [restockModalItem, setRestockModalItem] = useState<InventoryItem | null>(null);
  const [restockQty, setRestockQty] = useState<number>(5);
  const [restockCost, setRestockCost] = useState<number>(0);

  const [barcodePrintItem, setBarcodePrintItem] = useState<InventoryItem | null>(null);

  // New Item State
  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [category, setCategory] = useState<InventoryCategory>('chemistry_reagents');
  const [itemCode, setItemCode] = useState('');
  const [barcode, setBarcode] = useState('');
  const [currentQuantity, setCurrentQuantity] = useState<number>(5);
  const [unit, setUnit] = useState('Kit');
  const [minThreshold, setMinThreshold] = useState<number>(3);
  const [unitCost, setUnitCost] = useState<number>(500);
  const [supplierName, setSupplierName] = useState('');
  const [supplierPhone, setSupplierPhone] = useState('');
  const [lotNumber, setLotNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('2027-06-30');
  const [storageTemp, setStorageTemp] = useState<'2-8°C' | '15-25°C' | '-20°C'>('2-8°C');
  const [testsPerKit, setTestsPerKit] = useState<number>(200);

  // Catch scanned barcode
  React.useEffect(() => {
    if (scannedBarcode) {
      setSearchTerm(scannedBarcode);
      setScannedBarcode(null);
    }
  }, [scannedBarcode, setScannedBarcode]);

  // Inventory Metrics
  const now = new Date();
  const metrics = useMemo(() => {
    let lowCount = 0;
    let expiringCount = 0;
    let totalStockValue = 0;

    inventory.forEach(item => {
      const cost = item.unitCost ?? item.costPerUnit ?? 0;
      totalStockValue += item.currentQuantity * cost;
      if (item.currentQuantity <= item.minThreshold) {
        lowCount++;
      }
      const exp = new Date(item.expiryDate);
      const diffDays = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays <= 30) {
        expiringCount++;
      }
    });

    return { lowCount, expiringCount, totalStockValue, totalItems: inventory.length };
  }, [inventory, now]);

  // Filtered List
  const filteredInventory = useMemo(() => {
    return inventory.filter(item => {
      if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;

      const isLow = item.currentQuantity <= item.minThreshold;
      const exp = new Date(item.expiryDate);
      const diffDays = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const isExpiring = diffDays <= 30;

      if (stockStatusFilter === 'low' && !isLow) return false;
      if (stockStatusFilter === 'expiring' && !isExpiring) return false;
      if (stockStatusFilter === 'ok' && (isLow || isExpiring)) return false;

      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesNameAr = item.nameAr.toLowerCase().includes(term);
        const matchesNameEn = item.nameEn.toLowerCase().includes(term);
        const matchesCode = (item.itemCode || item.code || '').toLowerCase().includes(term);
        const matchesBarcode = (item.barcode || '').includes(term);
        const matchesLot = item.lotNumber.toLowerCase().includes(term);
        if (!matchesNameAr && !matchesNameEn && !matchesCode && !matchesBarcode && !matchesLot) {
          return false;
        }
      }

      return true;
    });
  }, [inventory, categoryFilter, stockStatusFilter, searchTerm, now]);

  const handleOpenEditItem = (item: InventoryItem) => {
    setEditingItem(item);
    setEditItemName(item.nameAr);
    setEditItemQty(item.currentQuantity);
    setEditItemThreshold(item.minThreshold);
    setEditItemCost(item.unitCost ?? item.costPerUnit ?? 0);
    setEditItemSupplier(item.supplierName || item.supplier || "");
    setEditItemExpiry(item.expiryDate);
  };

  const handleSaveEditItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    updateInventoryItem(editingItem.id, {
      nameAr: editItemName,
      currentQuantity: editItemQty,
      minThreshold: editItemThreshold,
      unitCost: editItemCost,
      supplierName: editItemSupplier,
      expiryDate: editItemExpiry
    });
    setEditingItem(null);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameAr.trim()) {
      alert('يرجى إدخال اسم الكاشف/المستلزم');
      return;
    }

    const genCode = itemCode.trim() || `REAG-${Date.now().toString().slice(-4)}`;
    const genBarcode = barcode.trim() || `622300188${(200 + inventory.length).toString()}`;

    addInventoryItem({
      itemCode: genCode,
      barcode: genBarcode,
      nameAr: nameAr.trim(),
      nameEn: nameEn.trim() || nameAr.trim(),
      category,
      currentQuantity: Number(currentQuantity) || 1,
      unit,
      minThreshold: Number(minThreshold) || 2,
      unitCost: Number(unitCost) || 100,
      supplierName: supplierName.trim() || 'المؤسسة الطبية للتوريدات',
      supplierPhone: supplierPhone.trim() || '01000000000',
      lotNumber: lotNumber.trim() || `LOT-${new Date().getFullYear()}`,
      expiryDate,
      storageTemp,
      testsPerKit: Number(testsPerKit) || 100
    });

    setIsAddModalOpen(false);
    setNameAr('');
    setNameEn('');
    setItemCode('');
    setBarcode('');
  };

  const handleConfirmRestock = () => {
    if (!restockModalItem || restockQty <= 0) return;
    restockItem(restockModalItem.id, restockQty, restockCost > 0 ? restockCost : undefined);
    playScanSuccessSound();
    setRestockModalItem(null);
  };

  const categoryNames: Record<string, string> = {
    chemistry_reagents: 'كواشف كيمياء الدم',
    elisa_clia_kits: 'كيتات مناعة وهرمونات (CLIA/ELISA)',
    hematology_diluents: 'محاليل ومخففات صورة الدم (CBC)',
    tubes_vacutainers: 'أنابيب سحب العينات (Vacutainer)',
    tips_consumables: 'تيبس وسرنجات ومستهلكات',
    rapid_tests: 'كواشف الاختبارات السريعة (Rapid Tests)',
    control_calibrator: 'عينات تحكم ومعايرة (Controls/Calibrators)',
    controls_calibrators: 'عينات تحكم ومعايرة (Controls/Calibrators)',
    reagent: 'كواشف ومحاليل عامة',
    consumable: 'مستهلكات عامة',
    tube: 'أنابيب',
    ppe: 'مهمات وقاية شخصية'
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Quick Actions */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-rose-800" />
              <span>{language === 'ar' ? 'مخزن المستلزمات والكيماويات والكواشف المخبرية' : 'Reagents & Chemicals Inventory'}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {language === 'ar'
                ? 'إدارة أرصدة المحاليل، تواريخ الصلاحية، درجات حرارة الحفظ، الربط بالباركود والتوريدات.'
                : 'Track reagent stock levels, expiration dates, lot numbers, storage conditions and barcodes.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setItemCode(`REAG-${(inventory.length + 9).toString().padStart(2, '0')}`);
                setBarcode(`622300188${(209 + inventory.length).toString()}`);
                setIsAddModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-rose-900 hover:bg-rose-950 rounded-lg transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'ar' ? 'إضافة مادة / كاشف جديد' : 'Add Item'}</span>
            </button>
          </div>
        </div>

        {/* Inventory Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-[11px] text-slate-500 block">إجمالي أصناف المخزن:</span>
            <span className="text-lg font-black font-mono text-slate-900 mt-0.5 block">
              {metrics.totalItems} صنف
            </span>
            <span className="text-[10px] text-slate-400">كواشف، أنابيب، محاليل</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-[11px] text-slate-500 block">قيمة المخزون الإجمالية:</span>
            <span className="text-lg font-black font-mono text-rose-900 mt-0.5 block">
              {metrics.totalStockValue.toLocaleString()} ج.م
            </span>
            <span className="text-[10px] text-slate-400">سعر التكلفة التقديري</span>
          </div>

          <div className={`p-3 rounded-lg border ${metrics.lowCount > 0 ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-100'}`}>
            <span className="text-[11px] text-slate-500 block">أصناف أوشكت على النفاد:</span>
            <span className={`text-lg font-black font-mono mt-0.5 block ${metrics.lowCount > 0 ? 'text-amber-700' : 'text-slate-900'}`}>
              {metrics.lowCount} أصناف
            </span>
            <span className="text-[10px] text-slate-500">تحت الحد الأدنى للطلب</span>
          </div>

          <div className={`p-3 rounded-lg border ${metrics.expiringCount > 0 ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-100'}`}>
            <span className="text-[11px] text-slate-500 block">قريبة الانتهاء (&lt;30 يوم):</span>
            <span className={`text-lg font-black font-mono mt-0.5 block ${metrics.expiringCount > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
              {metrics.expiringCount} أصناف
            </span>
            <span className="text-[10px] text-slate-500">تتطلب فحص عاجل</span>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="ابحث باسم الكاشف، الكود، الباركود، رقم التشغيلة LOT..."
              className="w-full text-xs pr-8 pl-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-800"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value as 'all' | InventoryCategory)}
              className="text-xs py-2 px-3 rounded-lg border border-slate-300 bg-white font-medium"
            >
              <option value="all">جميع أقسام المخزن</option>
              {Object.entries(categoryNames).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>

            <select
              value={stockStatusFilter}
              onChange={e => setStockStatusFilter(e.target.value as 'all' | 'low' | 'expiring' | 'ok')}
              className="text-xs py-2 px-3 rounded-lg border border-slate-300 bg-white font-medium"
            >
              <option value="all">جميع الحالات</option>
              <option value="low">الرصيد المنخفض فقط</option>
              <option value="expiring">قرب انتهاء الصلاحية</option>
              <option value="ok">أرصدة آمنة ومستقرة</option>
            </select>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right">
            <thead>
              <tr className="bg-slate-100/75 text-slate-700 font-bold border-b border-slate-200">
                <th className="py-3 px-4">كود الصنف / الباركود</th>
                <th className="py-3 px-4">اسم الكاشف / المستلزم الطبي</th>
                <th className="py-3 px-4">التصنيف</th>
                <th className="py-3 px-4">الرصيد الحالي</th>
                <th className="py-3 px-4">الحد الأدنى</th>
                <th className="py-3 px-4">التشغيلة (LOT)</th>
                <th className="py-3 px-4">تاريخ الصلاحية</th>
                <th className="py-3 px-4">حرارة الحفظ</th>
                <th className="py-3 px-4">سعر الوحدة</th>
                <th className="py-3 px-4 text-center">إجراءات المستودع</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-10 text-center text-slate-400">
                    لا توجد أصناف مطابقة لمعايير البحث
                  </td>
                </tr>
              ) : (
                filteredInventory.map(item => {
                  const isLow = item.currentQuantity <= item.minThreshold;
                  const expDate = new Date(item.expiryDate);
                  const diffDays = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                  const isExpired = diffDays <= 0;
                  const isExpiring = diffDays <= 30 && !isExpired;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      {/* Code & Barcode */}
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-slate-900">{item.itemCode}</div>
                        <div className="font-mono text-[10px] text-slate-500 mt-0.5">{item.barcode}</div>
                      </td>

                      {/* Name */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{item.nameAr}</div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">{item.nameEn}</div>
                        {item.testsPerKit && (
                          <div className="text-[10px] text-rose-800 mt-0.5">
                            سعة الكيت: {item.testsPerKit} اختبار
                          </div>
                        )}
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4">
                        <span className="text-slate-700 font-medium">
                          {categoryNames[item.category]}
                        </span>
                      </td>

                      {/* Current Quantity */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className={`font-mono text-sm font-black ${isLow ? 'text-amber-700' : 'text-slate-900'}`}>
                            {item.currentQuantity}
                          </span>
                          <span className="text-[11px] text-slate-500">{item.unit}</span>
                          {isLow && (
                            <span title="كمية منخفضة">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Minimum Threshold */}
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {item.minThreshold} {item.unit}
                      </td>

                      {/* Lot number */}
                      <td className="py-3 px-4 font-mono text-slate-700">
                        {item.lotNumber}
                      </td>

                      {/* Expiry Date */}
                      <td className="py-3 px-4">
                        <div className={`font-mono font-bold ${
                          isExpired ? 'text-rose-600' : isExpiring ? 'text-amber-700' : 'text-slate-800'
                        }`}>
                          {item.expiryDate}
                        </div>
                        <div className="text-[10px]">
                          {isExpired ? (
                            <span className="text-rose-600 font-bold">منتهي الصلاحية!</span>
                          ) : isExpiring ? (
                            <span className="text-amber-600">ينتهي خلال {diffDays} يوم</span>
                          ) : (
                            <span className="text-slate-400">صالح ومطابق</span>
                          )}
                        </div>
                      </td>

                      {/* Storage Temp */}
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                          <Thermometer className="w-3 h-3 text-rose-800" />
                          <span>{item.storageTemp}</span>
                        </span>
                      </td>

                      {/* Cost */}
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">
                        {item.unitCost} ج.م
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          
                          {/* Quick Restock (+Qty) */}
                          <button
                            onClick={() => {
                              setRestockModalItem(item);
                              setRestockQty(5);
                              setRestockCost(item.unitCost ?? item.costPerUnit ?? 0);
                            }}
                            className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded border border-emerald-200 transition-colors"
                            title="توريد وإضافة كمية"
                          >
                            <ArrowDownLeft className="w-3.5 h-3.5" />
                          </button>

                          {/* Quick Consume (-1) */}
                          <button
                            onClick={() => {
                              if (item.currentQuantity > 0) {
                                consumeReagent(item.id, 1);
                                playScanSuccessSound();
                              }
                            }}
                            disabled={item.currentQuantity === 0}
                            className="p-1.5 text-amber-700 hover:bg-amber-50 rounded border border-amber-200 disabled:opacity-40 transition-colors"
                            title="صرف واستهلاك عبوة واحدة (-1)"
                          >
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit Item Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenEditItem(item)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded border border-blue-200 transition-colors"
                            title="تعديل بيانات الصنف والمخزون"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {/* Barcode label print */}
                          <button
                            onClick={() => setBarcodePrintItem(item)}
                            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded border border-slate-200 transition-colors"
                            title="طباعة باركود العبوة"
                          >
                            <Barcode className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete (CEO only) */}
                          {currentUser.role === 'admin_ceo' && (
                            <button
                              onClick={() => {
                                if (confirm(`هل أنت متأكد من حذف المادة "${item.nameAr}" من المخزن؟`)) {
                                  deleteInventoryItem(item.id);
                                }
                              }}
                              className="p-1.5 text-rose-500 hover:bg-rose-50 rounded transition-colors"
                              title="حذف الصنف"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: ADD INVENTORY ITEM */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full my-auto overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Plus className="w-4 h-4 text-rose-400" />
                <span>إضافة كاشف / مستلزم جديد إلى مخزن المعمل</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">اسم المادة / الكاشف بالعربية *</label>
                  <input
                    type="text"
                    required
                    value={nameAr}
                    onChange={e => setNameAr(e.target.value)}
                    placeholder="مثال: كاشف سكر أو أنابيب EDTA"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">الاسم العلمي بالإنجليزي</label>
                  <input
                    type="text"
                    value={nameEn}
                    onChange={e => setNameEn(e.target.value)}
                    placeholder="e.g. Glucose GOD-PAP Kit"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">القسم والتصنيف</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as InventoryCategory)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                  >
                    {Object.entries(categoryNames).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">كود المادة الداخلي</label>
                  <input
                    type="text"
                    value={itemCode}
                    onChange={e => setItemCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">رقم الباركود (EAN / 128)</label>
                  <input
                    type="text"
                    value={barcode}
                    onChange={e => setBarcode(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">الرصيد المتاح</label>
                  <input
                    type="number"
                    min={0}
                    value={currentQuantity}
                    onChange={e => setCurrentQuantity(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">الوحدة</label>
                  <select
                    value={unit}
                    onChange={e => setUnit(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="Kit">كيت (Kit)</option>
                    <option value="Vial">زجاجة (Vial)</option>
                    <option value="Box">علبة (Box)</option>
                    <option value="Pack">باكت (Pack)</option>
                    <option value="Test">اختبار (Test)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">الحد الأدنى للإنذار</label>
                  <input
                    type="number"
                    min={1}
                    value={minThreshold}
                    onChange={e => setMinThreshold(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">سعر الشراء (ج.م)</label>
                  <input
                    type="number"
                    min={0}
                    value={unitCost}
                    onChange={e => setUnitCost(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">رقم التشغيلة (LOT Number)</label>
                  <input
                    type="text"
                    value={lotNumber}
                    onChange={e => setLotNumber(e.target.value)}
                    placeholder="LOT-2026-X"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">تاريخ انتهاء الصلاحية</label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={e => setExpiryDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">حرارة الحفظ المطلوبة</label>
                  <select
                    value={storageTemp}
                    onChange={e => setStorageTemp(e.target.value as '2-8°C' | '15-25°C' | '-20°C')}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="2-8°C">ثلاجة (2 إلى 8 مئوية)</option>
                    <option value="15-25°C">حرارة الغرفة (15 إلى 25 مئوية)</option>
                    <option value="-20°C">تجميد عميق (-20 مئوية)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-900 hover:bg-rose-950 text-white font-bold rounded-lg shadow-sm"
                >
                  إضافة للمستودع
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RESTOCK QUANTITY */}
      {restockModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-sm w-full overflow-hidden">
            <div className="px-5 py-3 bg-slate-900 text-white font-bold text-xs flex justify-between items-center">
              <span>توريد وإضافة كمية: {restockModalItem.nameAr}</span>
              <button onClick={() => setRestockModalItem(null)}>✕</button>
            </div>
            <div className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  الكمية المضافة حديثاً ({restockModalItem.unit}):
                </label>
                <input
                  type="number"
                  min={1}
                  value={restockQty}
                  onChange={e => setRestockQty(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-sm font-bold"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  الرصيد الحالي: {restockModalItem.currentQuantity} {restockModalItem.unit} → سيصبح: {restockModalItem.currentQuantity + restockQty}
                </span>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  سعر التكلفة للوحدة (ج.م):
                </label>
                <input
                  type="number"
                  min={0}
                  value={restockCost}
                  onChange={e => setRestockCost(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRestockModalItem(null)}
                  className="px-3 py-1.5 bg-slate-100 rounded text-slate-700 font-medium"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleConfirmRestock}
                  className="px-4 py-1.5 bg-emerald-700 text-white rounded font-bold shadow-sm"
                >
                  تأكيد التوريد
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PRINT BARCODE LABEL */}
      {barcodePrintItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-sm w-full overflow-hidden">
            <div className="px-5 py-3 bg-slate-900 text-white font-bold text-xs flex justify-between items-center">
              <span>طباعة باركود المادة</span>
              <button onClick={() => setBarcodePrintItem(null)}>✕</button>
            </div>
            <div className="p-6 text-center space-y-4">
              <div className="border border-slate-300 p-3 rounded-lg bg-slate-50 space-y-1">
                <div className="text-xs font-bold text-slate-900">{barcodePrintItem.nameAr}</div>
                <div className="text-[10px] text-slate-500 font-mono">{barcodePrintItem.itemCode} · LOT: {barcodePrintItem.lotNumber}</div>
                <div className="py-2" dangerouslySetInnerHTML={{ __html: generateBarcodeSVG(barcodePrintItem.barcode || barcodePrintItem.itemCode || barcodePrintItem.id, 220, 50, true) }} />
                <div className="text-[10px] text-slate-500">Exp: {barcodePrintItem.expiryDate} | {barcodePrintItem.storageTemp}</div>
              </div>

              <div className="flex justify-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-rose-900 text-white text-xs font-bold rounded-lg flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة الملصق الحراري</span>
                </button>
                <button
                  onClick={() => setBarcodePrintItem(null)}
                  className="px-3 py-2 bg-slate-100 text-slate-700 text-xs font-medium rounded-lg"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT INVENTORY ITEM */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">تعديل بيانات المادة المخزنية</h3>
                  <p className="text-[11px] text-slate-500 font-mono">{editingItem.itemCode}</p>
                </div>
              </div>
              <button type="button" onClick={() => setEditingItem(null)} className="text-slate-400 hover:text-slate-700 text-sm">✕</button>
            </div>

            <form onSubmit={handleSaveEditItem} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">اسم الكاشف / المستلزم *</label>
                <input
                  type="text"
                  required
                  value={editItemName}
                  onChange={e => setEditItemName(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">الرصيد الحالي ({editingItem.unit}) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={editItemQty}
                    onChange={e => setEditItemQty(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-rose-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">حد الأمان الحرج</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={editItemThreshold}
                    onChange={e => setEditItemThreshold(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">سعر الوحدة (ج.م)</label>
                  <input
                    type="number"
                    min="0"
                    value={editItemCost}
                    onChange={e => setEditItemCost(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">تاريخ الصلاحية</label>
                  <input
                    type="date"
                    value={editItemExpiry}
                    onChange={e => setEditItemExpiry(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">المورد / الشركة</label>
                <input
                  type="text"
                  value={editItemSupplier}
                  onChange={e => setEditItemSupplier(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-100 font-bold transition-all"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold shadow-md transition-all"
                >
                  حفظ تعديل الصنف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
