import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Employee, AttendanceRecord, PayrollRecord } from '../types';
import {
  Users,
  Clock,
  DollarSign,
  Plus,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Phone,
  Printer,
  Edit2,
  Trash2,
  FileSpreadsheet,
  Award,
  MinusCircle
} from 'lucide-react';
import { playScanSuccessSound } from '../utils/barcode';

export const HRModule: React.FC = () => {
  const {
    employees,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    attendance,
    recordAttendance,
    payroll,
    generatePayrollForMonth,
    updatePayrollRecord,
    currentUser,
    language
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'attendance' | 'payroll' | 'staff'>('attendance');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().substring(0, 7));

  // Staff Modal
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [jobTitleAr, setJobTitleAr] = useState('');
  const [department, setDepartment] = useState('الكيمياء الطبية');
  const [basicSalary, setBasicSalary] = useState<number>(15000);
  const [phone, setPhone] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [shiftHours, setShiftHours] = useState<number>(8);
  const [branch, setBranch] = useState('الفرع الرئيسي');

  // Edit Payroll Modal
  const [editingPayroll, setEditingPayroll] = useState<PayrollRecord | null>(null);
  const [editingStaff, setEditingStaff] = useState<Employee | null>(null);
  const [editStaffName, setEditStaffName] = useState('');
  const [editStaffTitle, setEditStaffTitle] = useState('');
  const [editStaffDept, setEditStaffDept] = useState('');
  const [editStaffSalary, setEditStaffSalary] = useState<number>(0);
  const [editStaffPhone, setEditStaffPhone] = useState('');
  const [editStaffBranch, setEditStaffBranch] = useState('');
  const [editStaffShift, setEditStaffShift] = useState<number>(8);
  const [bonusInput, setBonusInput] = useState<number>(0);
  const [deductionInput, setDeductionInput] = useState<number>(0);
  const [advanceInput, setAdvanceInput] = useState<number>(0);

  // Payslip Print Preview
  const [payslipPrint, setPayslipPrint] = useState<PayrollRecord | null>(null);

  // Filter attendance for selected date
  const dateAttendance = useMemo(() => {
    return attendance.filter(a => a.date === selectedDate);
  }, [attendance, selectedDate]);

  // Attendance stats for selected date
  const attendanceStats = useMemo(() => {
    const present = dateAttendance.filter(a => a.status === 'present').length;
    const late = dateAttendance.filter(a => a.status === 'late').length;
    const absent = dateAttendance.filter(a => a.status === 'absent').length;
    return { present, late, absent, total: employees.filter(e => e.isActive).length };
  }, [dateAttendance, employees]);

  // Filter payroll for selected month
  const monthPayroll = useMemo(() => {
    return payroll.filter(p => p.monthYear === selectedMonth);
  }, [payroll, selectedMonth]);

  const totalPayrollBudget = useMemo(() => {
    return monthPayroll.reduce((sum, p) => sum + p.netSalary, 0);
  }, [monthPayroll]);

    const handleOpenEditStaff = (emp: Employee) => {
    setEditingStaff(emp);
    setEditStaffName(emp.fullName);
    setEditStaffTitle(emp.jobTitleAr);
    setEditStaffDept(emp.department);
    setEditStaffSalary(emp.basicSalary);
    setEditStaffPhone(emp.phone);
    setEditStaffBranch(emp.branch);
    setEditStaffShift(emp.shiftHours);
  };

  const handleSaveEditStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;
    updateEmployee(editingStaff.id, {
      fullName: editStaffName,
      jobTitleAr: editStaffTitle,
      department: editStaffDept,
      basicSalary: editStaffSalary,
      phone: editStaffPhone,
      branch: editStaffBranch,
      shiftHours: editStaffShift
    });
    setEditingStaff(null);
  };

  const handleSaveStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    addEmployee({
      code: `EMP-00${employees.length + 1}`,
      fullName: fullName.trim(),
      role: 'chemist',
      jobTitleAr: jobTitleAr.trim() || 'أخصائي تحاليل طبية',
      jobTitleEn: 'Clinical Laboratory Specialist',
      department,
      basicSalary: Number(basicSalary) || 10000,
      phone: phone.trim() || '01000000000',
      nationalId: nationalId.trim() || '29000000000000',
      hireDate: new Date().toISOString().split('T')[0],
      shiftHours: Number(shiftHours) || 8,
      isActive: true,
      branch
    });

    setIsAddStaffOpen(false);
    setFullName('');
    setJobTitleAr('');
  };

  const handleQuickAttendance = (employeeId: string, status: AttendanceRecord['status']) => {
    const currentTime = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    recordAttendance(employeeId, status, currentTime);
    playScanSuccessSound();
  };

  const handleClockOut = (employeeId: string) => {
    const existing = attendance.find(a => a.employeeId === employeeId && a.date === selectedDate);
    if (!existing) return;
    const currentTime = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    recordAttendance(employeeId, existing.status, existing.checkInTime, currentTime);
    playScanSuccessSound();
  };

  const handleSavePayrollEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPayroll) return;

    updatePayrollRecord(editingPayroll.id, {
      bonusAmount: Number(bonusInput) || 0,
      deductionAmount: Number(deductionInput) || 0,
      advancePayment: Number(advanceInput) || 0
    });

    setEditingPayroll(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Sub Header & Switcher */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Users className="w-5 h-5 text-rose-800" />
              <span>{language === 'ar' ? 'الموارد البشرية وشؤون الموظفين والمرتبات' : 'HR, Attendance & Payroll Management'}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {language === 'ar'
                ? 'سجل الحضور والانصراف، احتساب الساعات الإضافية، ومسير الرواتب والمكافآت والخصومات الشهرية.'
                : 'Track staff attendance, working shifts, and monthly payroll slips.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveSubTab('attendance')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  activeSubTab === 'attendance' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {language === 'ar' ? 'الحضور والانصراف' : 'Attendance'}
              </button>
              <button
                type="button"
                onClick={() => setActiveSubTab('payroll')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  activeSubTab === 'payroll' ? 'bg-white text-rose-950 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {language === 'ar' ? 'الرواتب والمرتبات' : 'Payroll'}
              </button>
              <button
                type="button"
                onClick={() => setActiveSubTab('staff')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  activeSubTab === 'staff' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {language === 'ar' ? 'دليل العاملين' : 'Staff Directory'}
              </button>
            </div>

            {activeSubTab === 'staff' && (
              <button
                onClick={() => setIsAddStaffOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-rose-900 hover:bg-rose-950 rounded-lg transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة موظف</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* VIEW 1: DAILY ATTENDANCE */}
      {activeSubTab === 'attendance' && (
        <div className="space-y-6">
          
          {/* Attendance Summary Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-slate-700">تاريخ الحضور:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="text-xs px-3 py-1.5 rounded-lg border border-slate-300 font-mono font-semibold"
              />
            </div>

            <div className="flex items-center gap-4 text-xs">
              <span className="text-slate-600">
                إجمالي الكادر: <strong className="font-mono text-slate-900">{attendanceStats.total}</strong>
              </span>
              <span className="text-emerald-700">
                حاضر: <strong className="font-mono">{attendanceStats.present}</strong>
              </span>
              <span className="text-amber-700">
                متأخر: <strong className="font-mono">{attendanceStats.late}</strong>
              </span>
              <span className="text-rose-600">
                غياب: <strong className="font-mono">{attendanceStats.absent}</strong>
              </span>
            </div>
          </div>

          {/* Attendance Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-right">
                <thead>
                  <tr className="bg-slate-100/75 text-slate-700 font-bold border-b border-slate-200">
                    <th className="py-3 px-4">كود الموظف</th>
                    <th className="py-3 px-4">اسم الموظف</th>
                    <th className="py-3 px-4">المسمى الوظيفي والقسم</th>
                    <th className="py-3 px-4">وقت الحضور</th>
                    <th className="py-3 px-4">وقت الانصراف</th>
                    <th className="py-3 px-4">ساعات العمل</th>
                    <th className="py-3 px-4">إضافي (Overtime)</th>
                    <th className="py-3 px-4">الحالة اليومية</th>
                    <th className="py-3 px-4 text-center">تسجيل سريع</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {employees.filter(e => e.isActive).map(emp => {
                    const rec = dateAttendance.find(a => a.employeeId === emp.id);

                    return (
                      <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-800">{emp.code}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">{emp.fullName}</td>
                        <td className="py-3 px-4 text-slate-600">
                          <div>{emp.jobTitleAr}</div>
                          <div className="text-[10px] text-slate-400">{emp.department}</div>
                        </td>

                        {/* Check-In */}
                        <td className="py-3 px-4 font-mono font-semibold">
                          {rec?.checkInTime ? (
                            <span className="text-emerald-700">{rec.checkInTime}</span>
                          ) : (
                            <span className="text-slate-400">--:--</span>
                          )}
                        </td>

                        {/* Check-Out */}
                        <td className="py-3 px-4 font-mono font-semibold">
                          {rec?.checkOutTime ? (
                            <span className="text-blue-700">{rec.checkOutTime}</span>
                          ) : (
                            <span className="text-slate-400">--:--</span>
                          )}
                        </td>

                        {/* Hours Worked */}
                        <td className="py-3 px-4 font-mono text-slate-800">
                          {rec ? `${rec.hoursWorked} ساعة` : '-'}
                        </td>

                        {/* Overtime */}
                        <td className="py-3 px-4 font-mono text-rose-900 font-bold">
                          {rec && rec.overtimeHours > 0 ? `+${rec.overtimeHours} س` : '0'}
                        </td>

                        {/* Status badge */}
                        <td className="py-3 px-4">
                          {rec?.status === 'present' ? (
                            <span className="font-bold text-emerald-700">حاضر</span>
                          ) : rec?.status === 'late' ? (
                            <span className="font-bold text-amber-700">متأخر</span>
                          ) : rec?.status === 'absent' ? (
                            <span className="font-bold text-rose-600">غائب</span>
                          ) : (
                            <span className="text-slate-400">لم يسجل</span>
                          )}
                        </td>

                        {/* Quick Action buttons */}
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {!rec ? (
                              <>
                                <button
                                  onClick={() => handleQuickAttendance(emp.id, 'present')}
                                  className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded border border-emerald-200 transition-colors"
                                >
                                  حضور الآن
                                </button>
                                <button
                                  onClick={() => handleQuickAttendance(emp.id, 'late')}
                                  className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-bold rounded border border-amber-200 transition-colors"
                                >
                                  تأخير
                                </button>
                                <button
                                  onClick={() => handleQuickAttendance(emp.id, 'absent')}
                                  className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold rounded border border-rose-200 transition-colors"
                                >
                                  غياب
                                </button>
                              </>
                            ) : !rec.checkOutTime ? (
                              <button
                                onClick={() => handleClockOut(emp.id)}
                                className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 text-[11px] font-bold rounded border border-blue-200 transition-colors"
                              >
                                انصراف الآن
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-mono">مكتمل اليوم</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* VIEW 2: PAYROLL & SALARIES */}
      {activeSubTab === 'payroll' && (
        <div className="space-y-6">
          
          {/* Payroll Month Selector & Budget Overview */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-slate-700">مسير رواتب شهر:</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={e => setSelectedMonth(e.target.value)}
                className="text-xs px-3 py-2 rounded-lg border border-slate-300 font-mono font-bold"
              />
              <button
                onClick={() => generatePayrollForMonth(selectedMonth)}
                className="px-4 py-2 bg-rose-900 hover:bg-rose-950 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
              >
                توليد / تحديث مسير الشهر
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-left">
              <span className="text-[11px] text-slate-500 block">إجمالي صافي رواتب الشهر:</span>
              <span className="text-lg font-black font-mono text-emerald-800">
                {totalPayrollBudget.toLocaleString()} ج.م
              </span>
            </div>
          </div>

          {/* Payroll Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-right">
                <thead>
                  <tr className="bg-slate-100/75 text-slate-700 font-bold border-b border-slate-200">
                    <th className="py-3 px-4">اسم الموظف</th>
                    <th className="py-3 px-4">الراتب الأساسي</th>
                    <th className="py-3 px-4">بدل إضافي (Overtime)</th>
                    <th className="py-3 px-4">مكافآت وحوافز (+)</th>
                    <th className="py-3 px-4">خصومات وجزاءات (-)</th>
                    <th className="py-3 px-4">سلف مستردة (-)</th>
                    <th className="py-3 px-4">صافي الراتب المستحق</th>
                    <th className="py-3 px-4">حالة الصرف</th>
                    <th className="py-3 px-4 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {monthPayroll.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-400">
                        لم يتم توليد مسير رواتب لشهر {selectedMonth} بعد. اضغط على "توليد / تحديث مسير الشهر".
                      </td>
                    </tr>
                  ) : (
                    monthPayroll.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900">{p.employeeName}</td>
                        <td className="py-3 px-4 font-mono">{p.basicSalary.toLocaleString()} ج</td>
                        <td className="py-3 px-4 font-mono text-rose-900 font-bold">
                          {p.overtimePay > 0 ? `+${p.overtimePay} ج` : '0'}
                        </td>
                        <td className="py-3 px-4 font-mono text-emerald-700 font-bold">
                          {p.bonusAmount > 0 ? `+${p.bonusAmount} ج` : '0'}
                        </td>
                        <td className="py-3 px-4 font-mono text-rose-600">
                          {p.deductionAmount > 0 ? `-${p.deductionAmount} ج` : '0'}
                        </td>
                        <td className="py-3 px-4 font-mono text-amber-700">
                          {p.advancePayment > 0 ? `-${p.advancePayment} ج` : '0'}
                        </td>
                        <td className="py-3 px-4 font-mono text-sm font-black text-slate-900">
                          {p.netSalary.toLocaleString()} ج.م
                        </td>
                        <td className="py-3 px-4">
                          {p.paymentStatus === 'paid' ? (
                            <span className="font-bold text-emerald-700 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>تم الصرف</span>
                            </span>
                          ) : (
                            <span className="font-bold text-amber-700">مسودة معتمدة</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Edit incentives / deductions */}
                            <button
                              onClick={() => {
                                setEditingPayroll(p);
                                setBonusInput(p.bonusAmount || 0);
                                setDeductionInput(p.deductionAmount || 0);
                                setAdvanceInput(p.advancePayment || 0);
                              }}
                              className="p-1.5 text-slate-600 hover:text-rose-900 hover:bg-slate-100 rounded"
                              title="تعديل الحوافز والخصومات"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Mark Paid */}
                            {p.paymentStatus !== 'paid' && (
                              <button
                                onClick={() => {
                                  updatePayrollRecord(p.id, {
                                    paymentStatus: 'paid',
                                    paymentDate: new Date().toISOString().split('T')[0]
                                  });
                                  playScanSuccessSound();
                                }}
                                className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded border border-emerald-200"
                              >
                                صرف
                              </button>
                            )}

                            {/* Print Payslip */}
                            <button
                              onClick={() => setPayslipPrint(p)}
                              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded"
                              title="طباعة قسيمة الراتب (Payslip)"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* VIEW 3: STAFF DIRECTORY */}
      {activeSubTab === 'staff' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {employees.map(emp => (
            <div key={emp.id} className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{emp.fullName}</h3>
                  <div className="text-xs text-rose-900 font-semibold">{emp.jobTitleAr}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{emp.code}</div>
                </div>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {emp.isActive ? 'على رأس العمل' : 'إجازة / غير نشط'}
                </span>
              </div>

              <div className="space-y-1 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <div className="flex justify-between">
                  <span>القسم:</span>
                  <span className="font-semibold text-slate-900">{emp.department}</span>
                </div>
                <div className="flex justify-between">
                  <span>الراتب الأساسي:</span>
                  <span className="font-mono font-bold text-slate-900">{emp.basicSalary.toLocaleString()} ج.م</span>
                </div>
                <div className="flex justify-between">
                  <span>ساعات الوردية:</span>
                  <span className="font-mono">{emp.shiftHours} ساعات يومياً</span>
                </div>
                <div className="flex justify-between">
                  <span>الفرع:</span>
                  <span className="text-slate-800">{emp.branch}</span>
                </div>
                <div className="flex justify-between">
                  <span>الهاتف:</span>
                  <span className="font-mono">{emp.phone}</span>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenEditStaff(emp)}
                  className="px-2.5 py-1 text-xs font-bold text-blue-700 hover:bg-blue-50 rounded-lg border border-blue-200 flex items-center gap-1 transition-colors"
                  title="تعديل بيانات الموظف والراتب"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>تعديل</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm()) {
                      deleteEmployee(emp.id);
                    }
                  }}
                  className="px-2.5 py-1 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200 flex items-center gap-1 transition-colors"
                  title="حذف الموظف"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>حذف</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: ADD EMPLOYEE */}
      {isAddStaffOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white font-bold text-sm flex justify-between items-center">
              <span>إضافة كادر طبي / إداري جديد</span>
              <button onClick={() => setIsAddStaffOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleSaveStaff} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">الاسم بالكامل *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="مثال: د. إسلام ممدوح"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">المسمى الوظيفي</label>
                  <input
                    type="text"
                    value={jobTitleAr}
                    onChange={e => setJobTitleAr(e.target.value)}
                    placeholder="كيميائي تحاليل / فني سحب"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">القسم</label>
                  <input
                    type="text"
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">الراتب الأساسي (ج.م)</label>
                  <input
                    type="number"
                    min={1000}
                    value={basicSalary}
                    onChange={e => setBasicSalary(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">ساعات الوردية</label>
                  <input
                    type="number"
                    min={4}
                    max={12}
                    value={shiftHours}
                    onChange={e => setShiftHours(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">رقم الهاتف</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">الفرع التابع له</label>
                  <input
                    type="text"
                    value={branch}
                    onChange={e => setBranch(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddStaffOpen(false)}
                  className="px-4 py-2 bg-slate-100 rounded text-slate-700 font-medium"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-900 text-white rounded font-bold shadow-sm"
                >
                  حفظ الموظف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT PAYROLL RECORD */}
      {editingPayroll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-sm w-full overflow-hidden">
            <div className="px-5 py-3 bg-slate-900 text-white font-bold text-xs flex justify-between items-center">
              <span>تعديل مفردات الراتب: {editingPayroll.employeeName}</span>
              <button onClick={() => setEditingPayroll(null)}>✕</button>
            </div>
            <form onSubmit={handleSavePayrollEdit} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">مكافآت وحوافز تميز (+):</label>
                <input
                  type="number"
                  min={0}
                  value={bonusInput}
                  onChange={e => setBonusInput(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded border border-slate-300 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">خصومات وجزاءات تأخير (-):</label>
                <input
                  type="number"
                  min={0}
                  value={deductionInput}
                  onChange={e => setDeductionInput(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded border border-slate-300 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">سلف مستقطعة من الراتب (-):</label>
                <input
                  type="number"
                  min={0}
                  value={advanceInput}
                  onChange={e => setAdvanceInput(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded border border-slate-300 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingPayroll(null)}
                  className="px-3 py-1.5 bg-slate-100 rounded text-slate-700"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-rose-900 text-white rounded font-bold"
                >
                  حفظ التعديل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PRINT PAYSLIP */}
      {payslipPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden">
            <div className="px-5 py-3 bg-slate-900 text-white font-bold text-xs flex justify-between items-center print:hidden">
              <span>قسيمة راتب شهرية معتمدة</span>
              <button onClick={() => setPayslipPrint(null)}>✕</button>
            </div>
            <div className="p-6 text-xs space-y-4 printable-content">
              <div className="text-center border-b pb-3">
                <h3 className="font-black text-sm text-slate-900">معامل RT للتشخيص والتحاليل الطبية</h3>
                <div className="text-[11px] text-slate-500 font-semibold">إشعار صرف راتب شهري - شهر {payslipPrint.monthYear}</div>
              </div>

              <div className="bg-slate-50 p-3 rounded space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">اسم الموظف:</span>
                  <span className="font-bold text-slate-900">{payslipPrint.employeeName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">الراتب الأساسي:</span>
                  <span className="font-mono font-bold">{payslipPrint.basicSalary.toLocaleString()} ج.م</span>
                </div>
                {payslipPrint.overtimePay > 0 && (
                  <div className="flex justify-between text-rose-900 font-semibold">
                    <span>بدل ساعات إضافية:</span>
                    <span className="font-mono">+{payslipPrint.overtimePay} ج.م</span>
                  </div>
                )}
                {payslipPrint.bonusAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>حوافز ومكافآت:</span>
                    <span className="font-mono">+{payslipPrint.bonusAmount} ج.م</span>
                  </div>
                )}
                {payslipPrint.deductionAmount > 0 && (
                  <div className="flex justify-between text-rose-600 font-semibold">
                    <span>خصومات:</span>
                    <span className="font-mono">-{payslipPrint.deductionAmount} ج.م</span>
                  </div>
                )}
                {payslipPrint.advancePayment > 0 && (
                  <div className="flex justify-between text-amber-700 font-semibold">
                    <span>سلف مستقطعة:</span>
                    <span className="font-mono">-{payslipPrint.advancePayment} ج.م</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t">
                  <span>الصافي المنصرف:</span>
                  <span className="font-mono text-emerald-900">{payslipPrint.netSalary.toLocaleString()} ج.م</span>
                </div>
              </div>

              <div className="flex justify-between pt-4 text-[10px] text-slate-500">
                <span>توقيع الموظف المستلم: ........................</span>
                <span>اعتماد الحسابات: أ / حازم الشريف</span>
              </div>

              <div className="flex justify-center gap-2 pt-2 print:hidden">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-rose-900 text-white rounded font-bold flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة القسيمة</span>
                </button>
                <button
                  onClick={() => setPayslipPrint(null)}
                  className="px-3 py-2 bg-slate-100 rounded text-slate-700"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT EMPLOYEE */}
      {editingStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">تعديل بيانات الكادر الطبي / الإداري</h3>
                  <p className="text-[11px] text-slate-500 font-mono">الكود: {editingStaff.code}</p>
                </div>
              </div>
              <button type="button" onClick={() => setEditingStaff(null)} className="text-slate-400 hover:text-slate-700 text-sm">✕</button>
            </div>

            <form onSubmit={handleSaveEditStaff} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">الاسم بالكامل *</label>
                <input
                  type="text"
                  required
                  value={editStaffName}
                  onChange={e => setEditStaffName(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">المسمى الوظيفي</label>
                  <input
                    type="text"
                    value={editStaffTitle}
                    onChange={e => setEditStaffTitle(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">القسم</label>
                  <input
                    type="text"
                    value={editStaffDept}
                    onChange={e => setEditStaffDept(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">الراتب الأساسي (ج.م) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={editStaffSalary}
                    onChange={e => setEditStaffSalary(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-rose-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">ساعات الوردية</label>
                  <input
                    type="number"
                    min="1"
                    max="24"
                    value={editStaffShift}
                    onChange={e => setEditStaffShift(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">الفرع</label>
                  <input
                    type="text"
                    value={editStaffBranch}
                    onChange={e => setEditStaffBranch(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">رقم الهاتف</label>
                  <input
                    type="text"
                    value={editStaffPhone}
                    onChange={e => setEditStaffPhone(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingStaff(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-100 font-bold transition-all"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold shadow-md transition-all"
                >
                  حفظ تعديل الموظف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
