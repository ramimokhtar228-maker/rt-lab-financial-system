import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LabFacility, StaffMember, StaffDepartment, StaffRole } from '../types';
import {
  Building2,
  Users,
  Plus,
  Edit3,
  Trash2,
  Phone,
  Clock,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  Building,
  Save,
  Award,
  Sparkles,
  Search,
  Filter,
  CreditCard,
  Briefcase,
  FileCheck,
  Stethoscope,
  X
} from 'lucide-react';

export const LabManagementModule: React.FC = () => {
  const {
    labInfo,
    updateLabInfo,
    facilities,
    addFacility,
    updateFacility,
    deleteFacility,
    staffMembers,
    addStaffMember,
    updateStaffMember,
    deleteStaffMember,
    language
  } = useApp();

  const [activeTab, setActiveTab] = useState<'info' | 'branches' | 'staff'>('info');

  // Lab Info form local state
  const [infoForm, setInfoForm] = useState(labInfo);
  const [infoSavedSuccess, setInfoSavedSuccess] = useState(false);

  // Branch Modal State
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<LabFacility | null>(null);
  const [branchForm, setBranchForm] = useState<Partial<LabFacility>>({
    nameAr: '',
    nameEn: '',
    branchCode: '',
    address: '',
    city: 'شبرا الخيمة',
    phones: [''],
    whatsapp: '',
    managerName: '',
    operatingHours: 'يومياً على مدار 24 ساعة',
    isMainBranch: false,
    isActive: true
  });

  // Staff Modal State
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [staffForm, setStaffForm] = useState<Partial<StaffMember>>({
    name: '',
    role: 'chemist',
    department: 'chemists',
    title: '',
    specialty: '',
    licenseNumber: '',
    phone: '',
    branchId: facilities[0]?.id || 'branch-behteem',
    signatureLabel: '',
    isActive: true,
    nationalId: ''
  });

  // Staff filters
  const [staffSearch, setStaffSearch] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('all');

  // Handle Lab Info Save
  const handleSaveLabInfo = (e: React.FormEvent) => {
    e.preventDefault();
    updateLabInfo(infoForm);
    setInfoSavedSuccess(true);
    setTimeout(() => setInfoSavedSuccess(false), 3000);
  };

  // Branch Handlers
  const handleOpenAddBranch = () => {
    setEditingBranch(null);
    setBranchForm({
      nameAr: '',
      nameEn: '',
      branchCode: `BR-0${facilities.length + 1}`,
      address: '',
      city: 'القاهرة الكبرى',
      phones: [''],
      whatsapp: '',
      managerName: '',
      operatingHours: 'من 8:00 ص إلى 12:00 منتصف الليل',
      isMainBranch: facilities.length === 0,
      isActive: true
    });
    setIsBranchModalOpen(true);
  };

  const handleOpenEditBranch = (b: LabFacility) => {
    setEditingBranch(b);
    setBranchForm({ ...b });
    setIsBranchModalOpen(true);
  };

  const handleSaveBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchForm.nameAr?.trim()) {
      alert('يرجى كتابة اسم الفرع بالعربي');
      return;
    }
    const cleanPhones = (branchForm.phones || []).filter(p => p && p.trim().length > 0);

    if (editingBranch) {
      updateFacility(editingBranch.id, {
        ...branchForm,
        phones: cleanPhones.length > 0 ? cleanPhones : ['01012345678']
      });
    } else {
      addFacility({
        nameAr: branchForm.nameAr || '',
        nameEn: branchForm.nameEn || '',
        branchCode: branchForm.branchCode || `BR-0${facilities.length + 1}`,
        address: branchForm.address || '',
        city: branchForm.city || '',
        phones: cleanPhones.length > 0 ? cleanPhones : ['01012345678'],
        whatsapp: branchForm.whatsapp || '',
        managerName: branchForm.managerName || '',
        operatingHours: branchForm.operatingHours || '24/7',
        isMainBranch: !!branchForm.isMainBranch,
        isActive: branchForm.isActive !== undefined ? branchForm.isActive : true
      });
    }
    setIsBranchModalOpen(false);
  };

  // Staff Handlers
  const handleOpenAddStaff = () => {
    setEditingStaff(null);
    setStaffForm({
      name: '',
      role: 'chemist',
      department: 'chemists',
      title: '',
      specialty: '',
      licenseNumber: '',
      phone: '',
      branchId: facilities[0]?.id || 'branch-behteem',
      signatureLabel: '',
      isActive: true,
      nationalId: ''
    });
    setIsStaffModalOpen(true);
  };

  const handleOpenEditStaff = (s: StaffMember) => {
    setEditingStaff(s);
    setStaffForm({ ...s });
    setIsStaffModalOpen(true);
  };

  const handleSaveStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffForm.name?.trim()) {
      alert('يرجى إدخال اسم الموظف / الطبيب / الكيميائي');
      return;
    }
    const targetBranch = facilities.find(f => f.id === staffForm.branchId);

    if (editingStaff) {
      updateStaffMember(editingStaff.id, {
        ...staffForm,
        branchName: targetBranch ? targetBranch.nameAr : editingStaff.branchName
      });
    } else {
      addStaffMember({
        name: staffForm.name || '',
        role: staffForm.role || 'chemist',
        department: staffForm.department || 'chemists',
        title: staffForm.title || '',
        specialty: staffForm.specialty || '',
        licenseNumber: staffForm.licenseNumber || '',
        phone: staffForm.phone || '',
        branchId: staffForm.branchId || (facilities[0]?.id || 'branch-behteem'),
        branchName: targetBranch ? targetBranch.nameAr : 'الفرع الرئيسي',
        signatureLabel: staffForm.signatureLabel || `${staffForm.name} - ${staffForm.title}`,
        isActive: staffForm.isActive !== undefined ? staffForm.isActive : true,
        nationalId: staffForm.nationalId || ''
      });
    }
    setIsStaffModalOpen(false);
  };

  // Filtered staff
  const filteredStaff = staffMembers.filter(s => {
    const matchesDept = selectedDeptFilter === 'all' || s.department === selectedDeptFilter;
    const q = staffSearch.toLowerCase();
    const matchesQuery =
      !staffSearch ||
      s.name.toLowerCase().includes(q) ||
      s.specialty.toLowerCase().includes(q) ||
      s.phone.includes(q) ||
      (s.branchName && s.branchName.toLowerCase().includes(q));
    return matchesDept && matchesQuery;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white p-6 rounded-2xl shadow-xl border border-rose-900/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-600/30 text-rose-300 border border-rose-500/40">
              إدارة المنشأة والمعامل
            </span>
            <span className="text-xs text-slate-300 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              مزامنة معتمدة للفواتير والتقارير ورسائل المرضى
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <Building2 className="w-7 h-7 text-amber-400" />
            إدارة المعامل، الفروع، والكادر الإداري والطبي
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            التحكم الشامل ببيانات معمل RT، شبكة الفروع وأرقام الهواتف، توزيع المهام والتخصصات (الإدارة، الحسابات، الاستقبال، الكيميائيين، وسحب الزيارات)، وتفعيلها الفوري في التقارير الطبية وفواتير المرضى ورسائل الواتساب.
          </p>
        </div>

        {/* Quick Stats Badges */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="bg-slate-800/80 backdrop-blur px-3.5 py-2 rounded-xl border border-slate-700 text-center min-w-[90px]">
            <div className="text-[10px] text-slate-400 font-bold">الفروع النشطة</div>
            <div className="text-xl font-black text-amber-400">{facilities.filter(f => f.isActive).length}</div>
          </div>
          <div className="bg-slate-800/80 backdrop-blur px-3.5 py-2 rounded-xl border border-slate-700 text-center min-w-[90px]">
            <div className="text-[10px] text-slate-400 font-bold">إجمالي الكادر</div>
            <div className="text-xl font-black text-rose-400">{staffMembers.length}</div>
          </div>
          <div className="bg-slate-800/80 backdrop-blur px-3.5 py-2 rounded-xl border border-slate-700 text-center min-w-[90px]">
            <div className="text-[10px] text-slate-400 font-bold">الكيميائيين</div>
            <div className="text-xl font-black text-emerald-400">
              {staffMembers.filter(s => s.department === 'chemists').length}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-4 pt-2 shadow-sm gap-2">
        <button
          onClick={() => setActiveTab('info')}
          className={`flex items-center gap-2 px-5 py-3 font-bold text-xs sm:text-sm border-b-2 transition-all ${
            activeTab === 'info'
              ? 'border-rose-700 text-rose-800 bg-rose-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>بيانات المعمل والإدارة العامة</span>
        </button>

        <button
          onClick={() => setActiveTab('branches')}
          className={`flex items-center gap-2 px-5 py-3 font-bold text-xs sm:text-sm border-b-2 transition-all ${
            activeTab === 'branches'
              ? 'border-rose-700 text-rose-800 bg-rose-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>الفروع والإنشاءات ({facilities.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('staff')}
          className={`flex items-center gap-2 px-5 py-3 font-bold text-xs sm:text-sm border-b-2 transition-all ${
            activeTab === 'staff'
              ? 'border-rose-700 text-rose-800 bg-rose-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>الكادر الوظيفي والتخصصات ({staffMembers.length})</span>
        </button>
      </div>

      {/* TAB 1: LAB GENERAL INFO */}
      {activeTab === 'info' && (
        <div className="bg-white rounded-b-xl rounded-t-none p-6 shadow-md border border-slate-200 border-t-0">
          <form onSubmit={handleSaveLabInfo} className="space-y-6">
            {infoSavedSuccess && (
              <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-3 rounded-xl flex items-center gap-2 text-xs font-bold animate-fadeIn">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>تم حفظ بيانات المعمل بنجاح، وتفعيلها تلقائياً على كل الفواتير والتقارير ورسائل الواتساب!</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">اسم المعمل (باللغة العربية)</label>
                <input
                  type="text"
                  value={infoForm.labNameAr}
                  onChange={e => setInfoForm({ ...infoForm, labNameAr: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-600 font-bold text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Lab Name (English)</label>
                <input
                  type="text"
                  value={infoForm.labNameEn}
                  onChange={e => setInfoForm({ ...infoForm, labNameEn: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-600 text-slate-900"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">شعار المعمل (Slogan)</label>
                <input
                  type="text"
                  value={infoForm.sloganAr}
                  onChange={e => setInfoForm({ ...infoForm, sloganAr: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-600 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">الإشراف الطبي والاستشاري</label>
                <input
                  type="text"
                  value={infoForm.supervisionAr}
                  onChange={e => setInfoForm({ ...infoForm, supervisionAr: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-600 font-bold text-rose-950"
                  placeholder="أطباء واستشاريو كلية طب قصر العيني"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-slate-700 font-bold mb-1">المقر الرئيسي والعنوان العام</label>
                <input
                  type="text"
                  value={infoForm.mainAddress}
                  onChange={e => setInfoForm({ ...infoForm, mainAddress: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-600 text-slate-900"
                  placeholder="ميدان بهتيم برج صيدليه العزبى الدور الثالث امام الأسانسير شبرا الخيمه"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">الخط الساخن / هاتف الحجوزات</label>
                <input
                  type="text"
                  value={infoForm.hotline}
                  onChange={e => setInfoForm({ ...infoForm, hotline: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-600 font-mono text-slate-900"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">رقم الواتساب الرسمي (WhatsApp)</label>
                <input
                  type="text"
                  value={infoForm.whatsapp}
                  onChange={e => setInfoForm({ ...infoForm, whatsapp: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-600 font-mono text-emerald-800 font-bold"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">اعتمادات الجودة والشهادات</label>
                <input
                  type="text"
                  value={infoForm.accreditation}
                  onChange={e => setInfoForm({ ...infoForm, accreditation: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-600 text-slate-700 font-mono"
                  placeholder="ISO 15189 Certified Quality Management"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">معرف إنستاباي للدفع (InstaPay IPA)</label>
                <input
                  type="text"
                  value={infoForm.instapay}
                  onChange={e => setInfoForm({ ...infoForm, instapay: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-600 font-mono text-indigo-700 font-bold"
                  dir="ltr"
                  placeholder="ramirtlab@instapay"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 bg-rose-800 hover:bg-rose-900 text-white font-bold text-xs rounded-xl shadow-md transition-all"
              >
                <Save className="w-4 h-4" />
                <span>حفظ بيانات المعمل وتحديث الفواتير والرسائل فوراً</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: BRANCHES & FACILITIES */}
      {activeTab === 'branches' && (
        <div className="bg-white rounded-b-xl rounded-t-none p-6 shadow-md border border-slate-200 border-t-0 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="font-bold text-base text-slate-900">شبكة فروع ومقرات معمل RT</h3>
              <p className="text-xs text-slate-500">
                إدارة عناوين وأرقام هواتف ومواعيد عمل الفروع لاستخدامها في الحجوزات والفواتير والتقارير.
              </p>
            </div>
            <button
              onClick={handleOpenAddBranch}
              className="flex items-center gap-2 px-4 py-2 bg-rose-700 hover:bg-rose-900 text-white text-xs font-bold rounded-xl shadow transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة فرع جديد</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {facilities.map(branch => (
              <div
                key={branch.id}
                className={`p-5 rounded-2xl border transition-all relative ${
                  branch.isMainBranch
                    ? 'border-rose-400 bg-gradient-to-br from-rose-50/70 to-white shadow-md ring-1 ring-rose-200'
                    : 'border-slate-200 bg-white hover:border-slate-300 shadow-sm'
                }`}
              >
                {branch.isMainBranch && (
                  <span className="absolute top-4 left-4 bg-rose-700 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-sm">
                    الفرع الرئيسي
                  </span>
                )}

                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-rose-100/70 text-rose-800 rounded-xl mt-1">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div className="space-y-1 pr-1 flex-1">
                    <div className="font-mono text-[10px] text-slate-400 font-bold">{branch.branchCode}</div>
                    <h4 className="font-black text-slate-900 text-sm">{branch.nameAr}</h4>
                    {branch.nameEn && <div className="text-[11px] text-slate-500 font-medium">{branch.nameEn}</div>}
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-3">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
                    <span className="leading-snug text-slate-800 font-medium">{branch.address}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="font-mono text-slate-800 font-semibold" dir="ltr">
                      {branch.phones.join(' / ')}
                    </span>
                  </div>

                  {branch.whatsapp && (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        واتساب
                      </span>
                      <span className="font-mono text-emerald-800 font-semibold" dir="ltr">
                        {branch.whatsapp}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-slate-500">
                    <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{branch.operatingHours}</span>
                  </div>

                  {branch.managerName && (
                    <div className="text-[11px] text-slate-600 pt-1">
                      <span className="text-slate-400">المدير المسؤول: </span>
                      <span className="font-bold text-slate-800">{branch.managerName}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  {!branch.isMainBranch && (
                    <button
                      onClick={() => {
                        facilities.forEach(f => {
                          updateFacility(f.id, { isMainBranch: f.id === branch.id });
                        });
                      }}
                      className="text-[10px] text-rose-700 hover:text-rose-900 font-bold hover:underline"
                    >
                      تعيين كفرع رئيسي
                    </button>
                  )}
                  {branch.isMainBranch && <span className="text-[10px] font-bold text-rose-800">الفرع المعتمد</span>}

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditBranch(branch)}
                      className="p-1.5 text-slate-500 hover:text-rose-700 hover:bg-slate-100 rounded-lg transition-colors"
                      title="تعديل بيانات الفرع"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    {!branch.isMainBranch && (
                      <button
                        onClick={() => {
                          if (confirm(`هل أنت متأكد من حذف ${branch.nameAr}؟`)) {
                            deleteFacility(branch.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="حذف الفرع"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: STAFF DIRECTORY & SPECIALTIES */}
      {activeTab === 'staff' && (
        <div className="bg-white rounded-b-xl rounded-t-none p-6 shadow-md border border-slate-200 border-t-0 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div>
              <h3 className="font-bold text-base text-slate-900">الكادر الطبي والفني والإداري لمعامل RT</h3>
              <p className="text-xs text-slate-500">
                تسجيل ومتابعة أطباء الإدارة، المحاسبين، الاستقبال، الكيميائيين، وفنيي السحب والزيارات وتحديث توقيعاتهم وبياناتهم.
              </p>
            </div>
            <button
              onClick={handleOpenAddStaff}
              className="flex items-center gap-2 px-4 py-2 bg-rose-700 hover:bg-rose-900 text-white text-xs font-bold rounded-xl shadow transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة عضو جديد بالكادر</span>
            </button>
          </div>

          {/* Department Filter Pills */}
          <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1.5 rounded-xl text-xs font-bold text-slate-600">
            {[
              { id: 'all', label: 'كافة الأقسام', count: staffMembers.length },
              { id: 'administration', label: 'الإدارة والتشغيل', count: staffMembers.filter(s => s.department === 'administration').length },
              { id: 'accounts', label: 'الحسابات والماليات', count: staffMembers.filter(s => s.department === 'accounts').length },
              { id: 'reception', label: 'الاستقبال وخدمة العملاء', count: staffMembers.filter(s => s.department === 'reception').length },
              { id: 'chemists', label: 'الكيميائيين وأخصائيي التحاليل', count: staffMembers.filter(s => s.department === 'chemists').length },
              { id: 'phlebotomists', label: 'التمريض وسحب الزيارات', count: staffMembers.filter(s => s.department === 'phlebotomists').length }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedDeptFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  selectedDeptFilter === tab.id
                    ? 'bg-rose-800 text-white shadow-sm'
                    : 'hover:bg-white text-slate-700'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  selectedDeptFilter === tab.id ? 'bg-rose-950 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute right-3 top-3 text-slate-400" />
            <input
              type="text"
              value={staffSearch}
              onChange={e => setStaffSearch(e.target.value)}
              placeholder="البحث بالاسم، التخصص، رقم الهاتف، أو الفرع..."
              className="w-full pr-10 pl-4 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-rose-600"
            />
          </div>

          {/* Staff Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStaff.map(staff => (
              <div
                key={staff.id}
                className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 shadow-sm transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black mb-1 ${
                        staff.department === 'administration'
                          ? 'bg-purple-100 text-purple-800'
                          : staff.department === 'accounts'
                          ? 'bg-blue-100 text-blue-800'
                          : staff.department === 'reception'
                          ? 'bg-amber-100 text-amber-800'
                          : staff.department === 'chemists'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {staff.department === 'administration' && 'الإدارة والتشغيل'}
                        {staff.department === 'accounts' && 'الحسابات والمالية'}
                        {staff.department === 'reception' && 'الاستقبال وخدمة العملاء'}
                        {staff.department === 'chemists' && 'الكيميائيين والتحاليل'}
                        {staff.department === 'phlebotomists' && 'سحب العينات والزيارات'}
                      </span>
                      <h4 className="font-black text-slate-900 text-sm">{staff.name}</h4>
                      <p className="text-xs font-semibold text-rose-900 mt-0.5">{staff.title}</p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditStaff(staff)}
                        className="p-1 text-slate-400 hover:text-rose-700 hover:bg-slate-100 rounded-md"
                        title="تعديل بيانات الموظف"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`هل أنت متأكد من حذف ${staff.name}؟`)) {
                            deleteStaffMember(staff.id);
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md"
                        title="حذف الموظف"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-2.5">
                    <div>
                      <span className="text-slate-400 font-medium">التخصص الدقيق: </span>
                      <span className="font-semibold text-slate-800">{staff.specialty}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-mono text-slate-800 font-semibold" dir="ltr">
                        {staff.phone}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="text-slate-700">
                        {staff.branchName || (facilities.find(f => f.id === staff.branchId)?.nameAr || 'الفرع الرئيسي')}
                      </span>
                    </div>

                    {staff.licenseNumber && (
                      <div className="text-[11px] text-slate-500 font-mono">
                        رقم القيد/الترخيص: <span className="font-bold text-slate-700">{staff.licenseNumber}</span>
                      </div>
                    )}

                    {staff.signatureLabel && (
                      <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 text-[10px] text-slate-600">
                        <span className="text-slate-400 block font-bold">صيغة التوقيع بالتقارير:</span>
                        <span className="italic font-medium">{staff.signatureLabel}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className={`flex items-center gap-1 font-bold ${staff.isActive ? 'text-emerald-700' : 'text-slate-400'}`}>
                    <span className={`w-2 h-2 rounded-full ${staff.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                    {staff.isActive ? 'على رأس العمل (نشط)' : 'غير نشط'}
                  </span>
                  {staff.nationalId && <span className="font-mono text-slate-400 text-[10px]">ID: {staff.nationalId.slice(0, 6)}...</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BRANCH ADD/EDIT MODAL */}
      {isBranchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center">
              <h4 className="font-bold text-sm flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-400" />
                {editingBranch ? 'تعديل بيانات الفرع' : 'إضافة فرع جديد'}
              </h4>
              <button onClick={() => setIsBranchModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBranch} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-slate-700 font-bold mb-1">اسم الفرع بالعربي *</label>
                  <input
                    type="text"
                    value={branchForm.nameAr || ''}
                    onChange={e => setBranchForm({ ...branchForm, nameAr: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-600 font-bold"
                    placeholder="مثال: فرع بهتيم الرئيسي"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">اسم الفرع (إنجليزي)</label>
                  <input
                    type="text"
                    value={branchForm.nameEn || ''}
                    onChange={e => setBranchForm({ ...branchForm, nameEn: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-600"
                    placeholder="Behteem Branch"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">كود الفرع</label>
                  <input
                    type="text"
                    value={branchForm.branchCode || ''}
                    onChange={e => setBranchForm({ ...branchForm, branchCode: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-600 font-mono font-bold"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-700 font-bold mb-1">العنوان التفصيلي الدقيق *</label>
                  <textarea
                    rows={2}
                    value={branchForm.address || ''}
                    onChange={e => setBranchForm({ ...branchForm, address: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-600"
                    placeholder="مثال: ميدان بهتيم برج صيدلية العزبي الدور الثالث أمام الأسانسير شبرا الخيمة"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">أرقام الهواتف (مفصولة بفاصلة)</label>
                  <input
                    type="text"
                    value={(branchForm.phones || []).join(', ')}
                    onChange={e => setBranchForm({
                      ...branchForm,
                      phones: e.target.value.split(',').map(s => s.trim())
                    })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-600 font-mono"
                    placeholder="01012345678, 0244667788"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">رقم واتساب الفرع</label>
                  <input
                    type="text"
                    value={branchForm.whatsapp || ''}
                    onChange={e => setBranchForm({ ...branchForm, whatsapp: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-600 font-mono"
                    placeholder="01012345678"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">المدير المسؤول عن الفرع</label>
                  <input
                    type="text"
                    value={branchForm.managerName || ''}
                    onChange={e => setBranchForm({ ...branchForm, managerName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-600"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">مواعيد العمل</label>
                  <input
                    type="text"
                    value={branchForm.operatingHours || ''}
                    onChange={e => setBranchForm({ ...branchForm, operatingHours: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-600"
                  />
                </div>

                <div className="col-span-2 flex items-center gap-4 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                    <input
                      type="checkbox"
                      checked={!!branchForm.isMainBranch}
                      onChange={e => setBranchForm({ ...branchForm, isMainBranch: e.target.checked })}
                      className="rounded text-rose-800 focus:ring-rose-700 w-4 h-4"
                    />
                    <span>تعيين هذا الفرع كفرع رئيسي معتمد</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBranchModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-100 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-800 hover:bg-rose-900 text-white rounded-xl font-bold shadow-md"
                >
                  حفظ الفرع
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STAFF ADD/EDIT MODAL */}
      {isStaffModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center">
              <h4 className="font-bold text-sm flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-400" />
                {editingStaff ? 'تعديل بيانات الكادر' : 'إضافة عضو جديد بالكادر'}
              </h4>
              <button onClick={() => setIsStaffModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStaff} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-slate-700 font-bold mb-1">الاسم الكامل *</label>
                  <input
                    type="text"
                    value={staffForm.name || ''}
                    onChange={e => setStaffForm({ ...staffForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-600 font-bold"
                    placeholder="مثال: د/ عمر فؤاد القاضي"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">القسم / التخصص الرئيسي *</label>
                  <select
                    value={staffForm.department || 'chemists'}
                    onChange={e => {
                      const dept = e.target.value as StaffDepartment;
                      const roleMap: Record<StaffDepartment, StaffRole> = {
                        administration: 'admin',
                        accounts: 'accountant',
                        reception: 'receptionist',
                        chemists: 'chemist',
                        pathologists: 'pathologist',
                        phlebotomists: 'phlebotomist'
                      };
                      setStaffForm({
                        ...staffForm,
                        department: dept,
                        role: roleMap[dept]
                      });
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-600 font-bold"
                  >
                    <option value="administration">الإدارة والتشغيل</option>
                    <option value="accounts">الحسابات والمالية</option>
                    <option value="reception">الاستقبال وخدمة المرضى</option>
                    <option value="chemists">الكيميائيين وأخصائيي التحاليل</option>
                    <option value="phlebotomists">التمريض وسحب الزيارات المنزلية</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">الفرع التابع له</label>
                  <select
                    value={staffForm.branchId || (facilities[0]?.id || '')}
                    onChange={e => setStaffForm({ ...staffForm, branchId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-600 font-bold"
                  >
                    {facilities.map(f => (
                      <option key={f.id} value={f.id}>{f.nameAr}</option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-700 font-bold mb-1">المسمى الوظيفي والدرجة *</label>
                  <input
                    type="text"
                    value={staffForm.title || ''}
                    onChange={e => setStaffForm({ ...staffForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-600"
                    placeholder="مثال: أخصائي كيمياء طبية وهرمونات"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-700 font-bold mb-1">التخصص الدقيق</label>
                  <input
                    type="text"
                    value={staffForm.specialty || ''}
                    onChange={e => setStaffForm({ ...staffForm, specialty: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-600"
                    placeholder="كيمياء حيوية، أمراض دم، حسابات المرضى، استقبال..."
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">رقم الهاتف / المحمول *</label>
                  <input
                    type="text"
                    value={staffForm.phone || ''}
                    onChange={e => setStaffForm({ ...staffForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-600 font-mono"
                    placeholder="01012345678"
                    dir="ltr"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">رقم القيد / الترخيص المهني</label>
                  <input
                    type="text"
                    value={staffForm.licenseNumber || ''}
                    onChange={e => setStaffForm({ ...staffForm, licenseNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-600 font-mono"
                    placeholder="EGY-SCI-88402"
                    dir="ltr"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-700 font-bold mb-1">صيغة التوقيع والاعتماد على التقارير أو الفواتير</label>
                  <input
                    type="text"
                    value={staffForm.signatureLabel || ''}
                    onChange={e => setStaffForm({ ...staffForm, signatureLabel: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-600"
                    placeholder="مثال: د/ عمر فؤاد - أخصائي الكيمياء الإكلينيكية"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsStaffModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-100 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-800 hover:bg-rose-900 text-white rounded-xl font-bold shadow-md"
                >
                  حفظ البيانات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
