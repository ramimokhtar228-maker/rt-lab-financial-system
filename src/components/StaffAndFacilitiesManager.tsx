import React, { useState } from 'react';
import { StaffMember, LabFacility, LabStaffSignatures, StaffRole, StaffDepartment, LabInfo } from '../types/lab';
import { INITIAL_LAB_INFO } from '../data/staffAndFacilitiesData';
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
  Award,
  Stamp, 
  ShieldCheck, 
  UserCheck, 
  X,
  FileCheck,
  Stethoscope,
  Building,
  Check
} from 'lucide-react';

interface StaffAndFacilitiesManagerProps {
  staffMembers: StaffMember[];
  onUpdateStaffMembers: (staff: StaffMember[]) => void;
  facilities: LabFacility[];
  onUpdateFacilities: (facilities: LabFacility[]) => void;
  defaultSignatures: LabStaffSignatures;
  onUpdateDefaultSignatures: (sigs: LabStaffSignatures) => void;
  labInfo?: LabInfo;
  onUpdateLabInfo?: (info: LabInfo) => void;
}

export const StaffAndFacilitiesManager: React.FC<StaffAndFacilitiesManagerProps> = ({
  staffMembers,
  onUpdateStaffMembers,
  facilities,
  onUpdateFacilities,
  defaultSignatures,
  onUpdateDefaultSignatures,
  labInfo = INITIAL_LAB_INFO,
  onUpdateLabInfo
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'staff' | 'facilities'>('staff');
  const [labInfoForm, setLabInfoForm] = useState<LabInfo>(labInfo);
  const [infoSavedAlert, setInfoSavedAlert] = useState(false);
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('all');

  // Staff Modal State
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [staffFormData, setStaffFormData] = useState<Partial<StaffMember>>({
    name: '',
    role: 'chemist',
    title: '',
    specialty: '',
    licenseNumber: '',
    phone: '',
    branchId: facilities[0]?.id || 'branch-kasr',
    signatureLabel: '',
    isActive: true
  });

  // Facility Modal State
  const [isFacilityModalOpen, setIsFacilityModalOpen] = useState(false);
  const [editingFacility, setEditingFacility] = useState<LabFacility | null>(null);
  const [facilityFormData, setFacilityFormData] = useState<Partial<LabFacility>>({
    nameAr: '',
    nameEn: '',
    branchCode: '',
    address: '',
    city: 'القاهرة',
    phones: [''],
    whatsapp: '',
    managerName: '',
    operatingHours: 'يومياً من 8:00 صباحاً حتى 11:00 مساءً',
    availableServices: [],
    isMainBranch: false,
    isActive: true
  });
  const [newServiceInput, setNewServiceInput] = useState('');

  // Signatures quick picker state
  const [activeChemistSig, setActiveChemistSig] = useState(defaultSignatures.labChemist);
  const [selectedChemistId, setSelectedChemistId] = useState('');
  const [selectedVerifierId, setSelectedVerifierId] = useState('');
  const [selectedPathologistId, setSelectedPathologistId] = useState('');
  const [includeOfficialSeal, setIncludeOfficialSeal] = useState(true);
  const [activeVerifierSig, setActiveVerifierSig] = useState(defaultSignatures.verifiedBy);
  const [activePathologistSig, setActivePathologistSig] = useState(defaultSignatures.pathologist);
  const [saveSigToast, setSaveSigToast] = useState(false);

  // STAFF HANDLERS
  const handleOpenAddStaff = () => {
    setEditingStaff(null);
    setStaffFormData({
      name: '',
      role: 'chemist',
      title: 'أخصائي كيمياء طبية',
      specialty: 'Clinical Chemistry',
      licenseNumber: `EGY-MED-${Math.floor(10000 + Math.random() * 90000)}`,
      phone: '01',
      branchId: facilities[0]?.id || 'branch-kasr',
      signatureLabel: '',
      isActive: true
    });
    setIsStaffModalOpen(true);
  };

  const handleOpenEditStaff = (staff: StaffMember) => {
    setEditingStaff(staff);
    setStaffFormData({ ...staff });
    setIsStaffModalOpen(true);
  };

  const handleDeleteStaff = (id: string, name: string) => {
    if (confirm(`هل أنت متأكد من حذف عضو الطاقم "${name}" نهائياً من النظام؟`)) {
      onUpdateStaffMembers(staffMembers.filter(s => s.id !== id));
    }
  };

  const handleSaveStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffFormData.name?.trim()) {
      alert('يرجى إدخال اسم الموظف');
      return;
    }

    const sigText = staffFormData.signatureLabel?.trim() || `${staffFormData.name} - ${staffFormData.title || ''}`;

    if (editingStaff) {
      const updated = staffMembers.map(s => 
        s.id === editingStaff.id 
          ? { ...s, ...staffFormData, signatureLabel: sigText } as StaffMember 
          : s
      );
      onUpdateStaffMembers(updated);
    } else {
      const newStaff: StaffMember = {
        id: `staff-${Date.now()}`,
        name: staffFormData.name.trim(),
        role: staffFormData.role as StaffRole || 'chemist',
        title: staffFormData.title?.trim() || 'أخصائي معمل',
        specialty: staffFormData.specialty?.trim() || 'General Pathology',
        licenseNumber: staffFormData.licenseNumber?.trim() || 'EGY-REG',
        phone: staffFormData.phone?.trim() || '',
        branchId: staffFormData.branchId || 'branch-kasr',
        signatureLabel: sigText,
        isActive: staffFormData.isActive ?? true
      };
      onUpdateStaffMembers([...staffMembers, newStaff]);
    }

    setIsStaffModalOpen(false);
  };

  // FACILITY HANDLERS
  const handleOpenAddFacility = () => {
    setEditingFacility(null);
    const codeNum = facilities.length + 1;
    setFacilityFormData({
      nameAr: '',
      nameEn: '',
      branchCode: `RT-BR-0${codeNum}`,
      address: '',
      city: 'القاهرة',
      phones: ['02-'],
      whatsapp: '010',
      managerName: '',
      operatingHours: 'يومياً من 8:00 ص إلى 11:00 م',
      availableServices: ['سحب عينات دم', 'تحاليل فورية', 'زيارات منزلية'],
      isMainBranch: false,
      isActive: true
    });
    setIsFacilityModalOpen(true);
  };

  const handleOpenEditFacility = (facility: LabFacility) => {
    setEditingFacility(facility);
    setFacilityFormData({ ...facility });
    setIsFacilityModalOpen(true);
  };

  const handleDeleteFacility = (id: string, name: string) => {
    if (confirm(`هل أنت متأكد من حذف فرع/منشأة "${name}"؟`)) {
      onUpdateFacilities(facilities.filter(f => f.id !== id));
    }
  };

  const handleSaveFacility = (e: React.FormEvent) => {
    e.preventDefault();
    if (!facilityFormData.nameAr?.trim() || !facilityFormData.address?.trim()) {
      alert('يرجى إدخال اسم الفرع وعنوانه');
      return;
    }

    if (editingFacility) {
      const updated = facilities.map(f => 
        f.id === editingFacility.id 
          ? { ...f, ...facilityFormData } as LabFacility 
          : f
      );
      onUpdateFacilities(updated);
    } else {
      const newFacility: LabFacility = {
        id: `branch-${Date.now()}`,
        nameAr: facilityFormData.nameAr.trim(),
        nameEn: facilityFormData.nameEn?.trim() || facilityFormData.nameAr.trim(),
        branchCode: facilityFormData.branchCode?.trim() || `RT-BR-${Date.now().toString().slice(-3)}`,
        address: facilityFormData.address.trim(),
        city: facilityFormData.city || 'القاهرة',
        phones: facilityFormData.phones?.filter(p => p.trim()) || ['02-23658900'],
        whatsapp: facilityFormData.whatsapp?.trim() || '01001234567',
        managerName: facilityFormData.managerName?.trim() || 'إدارة المعامل',
        operatingHours: facilityFormData.operatingHours?.trim() || 'يومياً 24 ساعة',
        availableServices: facilityFormData.availableServices || [],
        isMainBranch: !!facilityFormData.isMainBranch,
        isActive: facilityFormData.isActive ?? true
      };
      onUpdateFacilities([...facilities, newFacility]);
    }

    setIsFacilityModalOpen(false);
  };

  const handleAddService = () => {
    if (!newServiceInput.trim()) return;
    const current = facilityFormData.availableServices || [];
    setFacilityFormData({
      ...facilityFormData,
      availableServices: [...current, newServiceInput.trim()]
    });
    setNewServiceInput('');
  };

  const handleRemoveService = (service: string) => {
    const current = facilityFormData.availableServices || [];
    setFacilityFormData({
      ...facilityFormData,
      availableServices: current.filter(s => s !== service)
    });
  };

    const handleChemistSelect = (staffId: string) => {
    setSelectedChemistId(staffId);
    if (staffId === 'custom') return;
    const member = staffMembers.find(s => s.id === staffId);
    if (member) {
      setActiveChemistSig(member.signatureLabel || (member.name + " - " + member.title));
    }
  };

  const handleVerifierSelect = (staffId: string) => {
    setSelectedVerifierId(staffId);
    if (staffId === 'custom') return;
    const member = staffMembers.find(s => s.id === staffId);
    if (member) {
      setActiveVerifierSig(member.signatureLabel || (member.name + " - " + member.title));
    }
  };

  const handlePathologistSelect = (staffId: string) => {
    setSelectedPathologistId(staffId);
    if (staffId === 'custom') return;
    const member = staffMembers.find(s => s.id === staffId);
    if (member) {
      setActivePathologistSig(member.signatureLabel || (member.name + " - " + member.title));
    }
  };

  const handleSaveSignatures = () => {
    onUpdateDefaultSignatures({
      labChemist: activeChemistSig,
      verifiedBy: activeVerifierSig,
      pathologist: activePathologistSig
    });
    setSaveSigToast(true);
    setTimeout(() => setSaveSigToast(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-red-900/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-red-600/30 text-rose-300 border border-red-500/40">
              <Building2 className="w-5 h-5 text-rose-400" />
            </span>
            <h2 className="text-xl font-black tracking-wide">
              إدارة الطاقم الطبي والإنشاءات والفروع
            </h2>
          </div>
          <p className="text-xs text-rose-200/80">
            تعديل وإضافة وحذف أطباء الباثولوجيا، الكيميائيين، أخصائيي الجودة، وفروع معامل RT المعتمدة
          </p>
        </div>

        {/* Tab Toggle buttons */}
        <div className="flex items-center gap-2 bg-slate-800/80 p-1 rounded-xl border border-slate-700">
          <button
            onClick={() => setActiveTab('staff')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'staff' ? 'bg-rose-700 text-white shadow-md' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>الطاقم الطبي والفني ({staffMembers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('facilities')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'facilities' ? 'bg-rose-700 text-white shadow-md' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>الإنشاءات والفروع ({facilities.length})</span>
          </button>
        </div>
      </div>


      {/* TAB 0: LAB INFO & GENERAL MANAGEMENT */}
      {activeTab === 'info' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">بيانات المعمل والإدارة الطبية العامة</h3>
              <p className="text-xs text-slate-500">
                يتم تطبيق هذه البيانات فوراً على ترويسة التقارير، الفواتير، ورسائل الحجز
              </p>
            </div>
            {infoSavedAlert && (
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                ✓ تم حفظ بيانات المعمل وتحديث التقارير بنجاح!
              </span>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (onUpdateLabInfo) onUpdateLabInfo(labInfoForm);
              try {
                localStorage.setItem('rt_lab_info_v1', JSON.stringify(labInfoForm));
              } catch {}
              setInfoSavedAlert(true);
              setTimeout(() => setInfoSavedAlert(false), 3000);
            }}
            className="space-y-4 text-xs"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-bold mb-1">اسم المعمل (عربي) *</label>
                <input
                  type="text"
                  value={labInfoForm.labNameAr}
                  onChange={e => setLabInfoForm({ ...labInfoForm, labNameAr: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">اسم المعمل (إنجليزي)</label>
                <input
                  type="text"
                  value={labInfoForm.labNameEn}
                  onChange={e => setLabInfoForm({ ...labInfoForm, labNameEn: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">الإشراف الطبي والاستشاري</label>
                <input
                  type="text"
                  value={labInfoForm.supervisionAr}
                  onChange={e => setLabInfoForm({ ...labInfoForm, supervisionAr: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg font-semibold text-rose-950"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">الشعار (Slogan)</label>
                <input
                  type="text"
                  value={labInfoForm.sloganAr}
                  onChange={e => setLabInfoForm({ ...labInfoForm, sloganAr: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-slate-700 font-bold mb-1">العنوان والمقر الرئيسي للمعمل</label>
                <input
                  type="text"
                  value={labInfoForm.mainAddress}
                  onChange={e => setLabInfoForm({ ...labInfoForm, mainAddress: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg font-semibold"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">الخط الساخن / الهاتف الموحد</label>
                <input
                  type="text"
                  value={labInfoForm.hotline}
                  onChange={e => setLabInfoForm({ ...labInfoForm, hotline: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg font-mono font-bold"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">رقم الواتساب الرسمي</label>
                <input
                  type="text"
                  value={labInfoForm.whatsapp}
                  onChange={e => setLabInfoForm({ ...labInfoForm, whatsapp: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg font-mono font-bold text-emerald-800"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">شهادة الاعتماد الدولية</label>
                <input
                  type="text"
                  value={labInfoForm.accreditation}
                  onChange={e => setLabInfoForm({ ...labInfoForm, accreditation: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">معرف إنستاباي للدفع (InstaPay)</label>
                <input
                  type="text"
                  value={labInfoForm.instapay}
                  onChange={e => setLabInfoForm({ ...labInfoForm, instapay: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg font-mono text-indigo-700 font-bold"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="pt-4 border-t flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-rose-900 hover:bg-rose-950 text-white font-bold rounded-xl shadow transition-all"
              >
                حفظ بيانات المعمل والاعتماد
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 1: STAFF MANAGEMENT */}
      {activeTab === 'staff' && (
        <div className="space-y-6">
          {/* Quick Signatures Defaults Box */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  تحديد التوقيعات الافتراضية المعتمدة للتقارير
                </h3>
                <p className="text-xs text-slate-500">
                  اختر من الطاقم الطبي المسجل لاعتماد أسمائهم تلقائياً على كل تقرير مطبوع
                </p>
              </div>

              <button
                onClick={handleSaveSignatures}
                className="flex items-center gap-1.5 px-4 py-2 bg-rose-900 hover:bg-rose-800 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>اعتماد التوقيعات الافتراضية</span>
              </button>
            </div>

            {saveSigToast && (
              <div className="p-3 bg-emerald-50 text-emerald-900 rounded-lg text-xs font-bold border border-emerald-300 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>تم تحديث التوقيعات الافتراضية بنجاح!</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {/* Chemist Selector */}
              <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex justify-between items-center">
                  <label className="font-bold text-slate-800 block">1. Lab CHEMIST (كيميائي الفحص):</label>
                </div>
                <select
                  value={selectedChemistId}
                  onChange={e => handleChemistSelect(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
                >
                  <option value="">-- اختر كيميائي من الطاقم المسجل --</option>
                  {staffMembers.filter(s => (s.role as string) === 'chemist' || (s.role as string) === 'technician' || true).map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.specialty})</option>
                  ))}
                  <option value="custom">-- إدخال اسم مخصص يدوياً --</option>
                </select>
                <input
                  type="text"
                  value={activeChemistSig}
                  onChange={(e) => setActiveChemistSig(e.target.value)}
                  placeholder="صيغة الاسم في التقرير..."
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg font-semibold text-slate-900 text-xs"
                />
              </div>

              {/* Verifier Selector */}
              <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex justify-between items-center">
                  <label className="font-bold text-slate-800 block">2. Verify By (مراجع النتائج والاعتماد):</label>
                </div>
                <select
                  value={selectedVerifierId}
                  onChange={e => handleVerifierSelect(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
                >
                  <option value="">-- اختر مراجع تحاليل معتمد --</option>
                  {staffMembers.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.title})</option>
                  ))}
                  <option value="custom">-- إدخال اسم مخصص يدوياً --</option>
                </select>
                <input
                  type="text"
                  value={activeVerifierSig}
                  onChange={(e) => setActiveVerifierSig(e.target.value)}
                  placeholder="صيغة اسم المراجع..."
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg font-semibold text-slate-900 text-xs"
                />
              </div>

              {/* Pathologist Selector */}
              <div className="space-y-1.5 p-3 rounded-xl bg-rose-50/60 border border-rose-200">
                <div className="flex justify-between items-center">
                  <label className="font-bold text-rose-950 block">3. Consultant Pathologist (المدير الطبي):</label>
                </div>
                <select
                  value={selectedPathologistId}
                  onChange={e => handlePathologistSelect(e.target.value)}
                  className="w-full p-2 bg-white border border-rose-300 rounded-lg text-xs font-bold text-rose-950"
                >
                  <option value="">-- اختر استشاري الباثولوجيا --</option>
                  {staffMembers.filter(s => (s.role as string) === 'pathologist' || (s.role as string) === 'director' || true).map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.specialty})</option>
                  ))}
                  <option value="custom">-- إدخال اسم مخصص يدوياً --</option>
                </select>
                <input
                  type="text"
                  value={activePathologistSig}
                  onChange={(e) => setActivePathologistSig(e.target.value)}
                  placeholder="صيغة اسم الاستشاري..."
                  className="w-full p-2 bg-white border border-rose-300 rounded-lg font-bold text-rose-950 text-xs"
                />
              </div>
            </div>

            {/* Official Digital Stamp & Signature Footer Live Preview */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 to-rose-950 text-white space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-xs text-rose-200">معاينة شريط التوقيعات وخاتم الاعتماد كما سيظهر على تقارير A4 المطبوعة</span>
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                  اعتماد إلكتروني نشط
                </span>
              </div>

              <div className="bg-white rounded-lg p-3 text-slate-900 grid grid-cols-3 gap-3 text-center border border-slate-200 text-xs shadow-inner">
                <div className="border-l border-slate-200 pl-2">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Lab CHEMIST</div>
                  <div className="font-serif italic font-bold text-slate-700 py-1">Approved</div>
                  <div className="font-bold text-[11px] text-slate-900 truncate">{activeChemistSig || 'كيميائي المعمل'}</div>
                </div>

                <div className="border-l border-slate-200 pl-2">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Verified By</div>
                  <div className="font-serif italic font-bold text-slate-700 py-1">Quality Audit</div>
                  <div className="font-bold text-[11px] text-slate-900 truncate">{activeVerifierSig || 'مراجع الجودة المخبرية'}</div>
                </div>

                <div className="pr-2">
                  <div className="text-[10px] font-bold text-rose-900 uppercase">Consultant Pathologist</div>
                  <div className="py-1">
                    <span className="inline-block px-2 py-0.5 rounded border border-rose-800 bg-rose-50 text-rose-900 font-serif italic font-black text-[11px]">
                      Dr. Rami Mokhtar
                    </span>
                  </div>
                  <div className="font-bold text-[11px] text-rose-950 truncate">{activePathologistSig || 'استشاري الباثولوجيا'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Staff Members List */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                قائمة أعضاء الطاقم الطبي والفني المسجلين
              </h3>

              <button
                onClick={handleOpenAddStaff}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة فرد جديد للطاقم</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {staffMembers.filter(s => selectedDeptFilter === 'all' || s.department === selectedDeptFilter).map((staff) => {
                const assignedBranch = facilities.find(f => f.id === staff.branchId);

                return (
                  <div
                    key={staff.id}
                    className="p-4 rounded-xl border border-slate-200 hover:border-red-400 bg-slate-50/50 hover:bg-white transition-all space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-900 border border-rose-200 uppercase">
                          {staff.role}
                        </span>
                        <span className="text-[11px] font-mono text-slate-500">
                          {staff.licenseNumber}
                        </span>
                      </div>

                      <h4 className="text-sm font-black text-slate-900">
                        {staff.name}
                      </h4>
                      <p className="text-xs text-slate-600 font-medium">
                        {staff.title}
                      </p>

                      <div className="text-[11px] text-slate-500 space-y-1 pt-1">
                        <div>التخصص: <strong className="text-slate-700">{staff.specialty}</strong></div>
                        <div>الفرع: <strong className="text-slate-700">{assignedBranch?.nameAr || 'الفرع الرئيسي'}</strong></div>
                        <div className="font-mono">الهاتف: {staff.phone}</div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        نشط ومفعل
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditStaff(staff)}
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors"
                          title="تعديل بيانات الموظف"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteStaff(staff.id, staff.name)}
                          className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors"
                          title="حذف من الطاقم"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FACILITIES & BRANCHES MANAGEMENT */}
      {activeTab === 'facilities' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  شبكة معامل ومراكز RT التشخيصية (الإنشاءات والفروع)
                </h3>
                <p className="text-xs text-slate-500">
                  إدارة العناوين، أرقام التواصل، غرف السحب، والأجهزة والتجهيزات الطبية لكل فرع
                </p>
              </div>

              <button
                onClick={handleOpenAddFacility}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-900 hover:bg-rose-800 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة فرع / معمل جديد</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {facilities.map((fac) => (
                <div
                  key={fac.id}
                  className={`p-5 rounded-2xl border transition-all space-y-4 flex flex-col justify-between ${
                    fac.isMainBranch
                      ? 'bg-rose-50/40 border-rose-300 shadow-md'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono font-bold text-rose-900 bg-rose-100 px-2 py-0.5 rounded">
                        {fac.branchCode}
                      </span>

                      {fac.isMainBranch && (
                        <span className="text-[10px] font-black bg-gradient-to-r from-red-800 to-rose-700 text-white px-2.5 py-0.5 rounded-full shadow-xs">
                          المقر الرئيسي (HQ)
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 className="text-base font-black text-slate-900">
                        {fac.nameAr}
                      </h4>
                      <p className="text-xs text-slate-500 font-medium" dir="ltr">
                        {fac.nameEn}
                      </p>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-700">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
                        <span className="leading-snug">{fac.address}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-slate-500 shrink-0" />
                        <span className="font-mono">{fac.phones.join(' / ')}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-500 shrink-0" />
                        <span>{fac.operatingHours}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-slate-500 shrink-0" />
                        <span>مدير الفرع: <strong>{fac.managerName}</strong></span>
                      </div>
                    </div>

                    {/* Services / Equipment list */}
                    <div className="space-y-1 pt-2 border-t border-slate-100">
                      <span className="text-[11px] font-bold text-slate-800 block">
                        التجهيزات والخدمات المتاحة:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {(fac.availableServices || []).map((srv, idx) => (
                          <span key={idx} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                            {srv}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      الفرع يعمل ومعتمد
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditFacility(fac)}
                        className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors"
                        title="تعديل بيانات الفرع"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      {!fac.isMainBranch && (
                        <button
                          onClick={() => handleDeleteFacility(fac.id, fac.nameAr)}
                          className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors"
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
        </div>
      )}

      {/* MODAL: ADD / EDIT STAFF */}
      {isStaffModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                {editingStaff ? 'تعديل بيانات عضو الطاقم' : 'إضافة عضو جديد للطاقم الطبي'}
              </h3>
              <button onClick={() => setIsStaffModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSaveStaff} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">الاسم الكامل *</label>
                <input
                  type="text"
                  required
                  value={staffFormData.name || ''}
                  onChange={(e) => setStaffFormData({ ...staffFormData, name: e.target.value })}
                  placeholder="مثال: د. أحمد الشريف"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الدور الوظيفي *</label>
                  <select
                    value={staffFormData.role || 'chemist'}
                    onChange={(e) => setStaffFormData({ ...staffFormData, role: e.target.value as StaffRole })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold"
                  >
                    <option value="pathologist">استشاري باثولوجيا (Pathologist)</option>
                    <option value="verifier">مراجعة وتدقيق إكلينيكي (Verifier)</option>
                    <option value="chemist">كيميائي معمل (Lab Chemist)</option>
                    <option value="phlebotomist">أخصائي سحب عينات (Phlebotomist)</option>
                    <option value="receptionist">استقبال وتسجيل (Receptionist)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">المسمى الوظيفي والدرجة</label>
                  <input
                    type="text"
                    value={staffFormData.title || ''}
                    onChange={(e) => setStaffFormData({ ...staffFormData, title: e.target.value })}
                    placeholder="مثال: أخصائي كيمياء طبية"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">التخصص الدقيق</label>
                  <input
                    type="text"
                    value={staffFormData.specialty || ''}
                    onChange={(e) => setStaffFormData({ ...staffFormData, specialty: e.target.value })}
                    placeholder="Clinical Chemistry, Hematology..."
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">رقم الترخيص / القيد</label>
                  <input
                    type="text"
                    value={staffFormData.licenseNumber || ''}
                    onChange={(e) => setStaffFormData({ ...staffFormData, licenseNumber: e.target.value })}
                    placeholder="EGY-MED-..."
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">رقم الهاتف</label>
                  <input
                    type="text"
                    value={staffFormData.phone || ''}
                    onChange={(e) => setStaffFormData({ ...staffFormData, phone: e.target.value })}
                    placeholder="01012345678"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">الفرع التابع له</label>
                  <select
                    value={staffFormData.branchId || 'branch-kasr'}
                    onChange={(e) => setStaffFormData({ ...staffFormData, branchId: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  >
                    {facilities.map((f) => (
                      <option key={f.id} value={f.id}>{f.nameAr}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">صيغة التوقيع في التقرير</label>
                <input
                  type="text"
                  value={staffFormData.signatureLabel || ''}
                  onChange={(e) => setStaffFormData({ ...staffFormData, signatureLabel: e.target.value })}
                  placeholder="الاسم واللقب كما سيظهر في مطبوعات التقارير..."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsStaffModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-900 hover:bg-rose-800 text-white font-bold rounded-lg shadow-sm"
                >
                  {editingStaff ? 'حفظ التعديل' : 'إضافة الموظف'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT FACILITY */}
      {isFacilityModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                {editingFacility ? 'تعديل بيانات المنشأة / الفرع' : 'إضافة فرع / معمل جديد'}
              </h3>
              <button onClick={() => setIsFacilityModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSaveFacility} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم الفرع (عربي) *</label>
                <input
                  type="text"
                  required
                  value={facilityFormData.nameAr || ''}
                  onChange={(e) => setFacilityFormData({ ...facilityFormData, nameAr: e.target.value })}
                  placeholder="مثال: معامل RT - فرع الشيخ زايد"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم الفرع (English)</label>
                <input
                  type="text"
                  dir="ltr"
                  value={facilityFormData.nameEn || ''}
                  onChange={(e) => setFacilityFormData({ ...facilityFormData, nameEn: e.target.value })}
                  placeholder="RT LAB - Sheikh Zayed Branch"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">كود الفرع</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={facilityFormData.branchCode || ''}
                    onChange={(e) => setFacilityFormData({ ...facilityFormData, branchCode: e.target.value })}
                    placeholder="RT-BR-06"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">المدينة / المحافظة</label>
                  <input
                    type="text"
                    value={facilityFormData.city || 'القاهرة'}
                    onChange={(e) => setFacilityFormData({ ...facilityFormData, city: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">العنوان التفصيلي *</label>
                <input
                  type="text"
                  required
                  value={facilityFormData.address || ''}
                  onChange={(e) => setFacilityFormData({ ...facilityFormData, address: e.target.value })}
                  placeholder="الشارع، رقم المبنى، علامة مميزة..."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">رقم الهاتف الأرضي أو المحمول</label>
                  <input
                    type="text"
                    value={facilityFormData.phones?.[0] || ''}
                    onChange={(e) => setFacilityFormData({ ...facilityFormData, phones: [e.target.value] })}
                    placeholder="02-23658900"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">رقم الواتساب للفرع</label>
                  <input
                    type="text"
                    value={facilityFormData.whatsapp || ''}
                    onChange={(e) => setFacilityFormData({ ...facilityFormData, whatsapp: e.target.value })}
                    placeholder="01001234567"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">مدير الفرع</label>
                  <input
                    type="text"
                    value={facilityFormData.managerName || ''}
                    onChange={(e) => setFacilityFormData({ ...facilityFormData, managerName: e.target.value })}
                    placeholder="د. ..."
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">مواعيد العمل</label>
                  <input
                    type="text"
                    value={facilityFormData.operatingHours || ''}
                    onChange={(e) => setFacilityFormData({ ...facilityFormData, operatingHours: e.target.value })}
                    placeholder="يومياً من 8 ص إلى 11 م"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Services Tags */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">الخدمات والتجهيزات المتاحة بالفرع</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newServiceInput}
                    onChange={(e) => setNewServiceInput(e.target.value)}
                    placeholder="إضافة خدمة (سحب أطفال، زيارات منزلية...)"
                    className="flex-1 p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={handleAddService}
                    className="px-3 py-1.5 bg-slate-800 text-white rounded-lg font-bold"
                  >
                    إضافة
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                  {(facilityFormData.availableServices || []).map((srv, idx) => (
                    <span key={idx} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md flex items-center gap-1 font-medium">
                      {srv}
                      <button type="button" onClick={() => handleRemoveService(srv)} className="text-slate-400 hover:text-rose-600">
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsFacilityModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-900 hover:bg-rose-800 text-white font-bold rounded-lg shadow-sm"
                >
                  {editingFacility ? 'حفظ التعديل' : 'إضافة الفرع'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
