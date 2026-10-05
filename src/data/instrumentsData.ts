import { LabInstrument, InstrumentTransmission } from '../types';

export const INITIAL_INSTRUMENTS: LabInstrument[] = [
  {
    id: "inst-cbc-01",
    name: "Mindray BC-5380",
    model: "BC-5380 Auto Hematology",
    manufacturer: "Mindray Medical",
    category: "hematology",
    protocol: "ASTM-E1381",
    connectionPort: "COM3 (RS-232 / 9600-8-N-1)",
    status: "online",
    supportedProfiles: ["CBC"],
    lastSyncTime: "منذ 4 دقائق",
    totalTestsRun: 1420,
    serialNumber: "MIND-BC5380-EG-8821",
    autoApproveNormal: true
  },
  {
    id: "inst-chem-01",
    name: "Roche Cobas c311",
    model: "Cobas c311 Chemistry Analyzer",
    manufacturer: "Roche Diagnostics",
    category: "biochemistry",
    protocol: "HL7-v2",
    connectionPort: "192.168.1.105:5100 (TCP/IP LAN)",
    status: "online",
    supportedProfiles: ["LFT", "KFT", "LIPID", "GLYCEMIC"],
    lastSyncTime: "منذ 9 دقائق",
    totalTestsRun: 3890,
    serialNumber: "ROCHE-C311-2024-KASR",
    autoApproveNormal: false
  },
  {
    id: "inst-cbc-02",
    name: "Sysmex XN-550",
    model: "XN-550 Automated Hematology",
    manufacturer: "Sysmex Corporation",
    category: "hematology",
    protocol: "ASTM-E1381",
    connectionPort: "COM4 (USB-Serial / 19200-8-N-1)",
    status: "online",
    supportedProfiles: ["CBC"],
    lastSyncTime: "منذ 15 دقيقة",
    totalTestsRun: 2150,
    serialNumber: "SYSMEX-XN550-9941-RT",
    autoApproveNormal: true
  },
  {
    id: "inst-coag-01",
    name: "Horiba Yumizen G200",
    model: "Yumizen G200 Coagulation",
    manufacturer: "Horiba Medical",
    category: "coagulation",
    protocol: "RS232_Serial",
    connectionPort: "COM1 (RS-232 / 9600-8-N-1)",
    status: "online",
    supportedProfiles: ["COAG"],
    lastSyncTime: "منذ 22 دقيقة",
    totalTestsRun: 840,
    serialNumber: "HORIBA-G200-EGY-04",
    autoApproveNormal: true
  },
  {
    id: "inst-immuno-01",
    name: "Roche Cobas e411",
    model: "Cobas e411 Immunoassay (ECLIA)",
    manufacturer: "Roche Diagnostics",
    category: "immunoassay",
    protocol: "HL7-v2",
    connectionPort: "192.168.1.110:5100 (TCP/IP LAN)",
    status: "online",
    supportedProfiles: ["THYROID", "HORMONES", "FERRITIN", "TUMOR_MARKERS"],
    lastSyncTime: "منذ 35 دقيقة",
    totalTestsRun: 1680,
    serialNumber: "ROCHE-E411-9844-RT",
    autoApproveNormal: false
  }
];

export const SAMPLE_INSTRUMENT_TRANSMISSIONS: InstrumentTransmission[] = [
  {
    id: "tx-cbc-801",
    instrumentId: "inst-cbc-01",
    instrumentName: "Mindray BC-5380",
    timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    sampleBarcode: "RT-10029",
    patientLabNumber: "RT-2026-001",
    patientName: "أحمد محمود إبراهيم",
    testCode: "CBC",
    status: "mapped",
    results: {
      "Hemoglobin (Hb)": 8.6,
      "RBC Count": 3.8,
      "Hematocrit (Hct / PCV)": 27.2,
      "MCV": 71.5,
      "MCH": 22.6,
      "MCHC": 31.6,
      "RDW-CV": 17.8,
      "Total Leucocytic Count (TLC / WBC)": 6.8,
      "Platelet Count": 410,
      "Neutrophils": 62,
      "Lymphocytes": 29,
      "Monocytes": 6,
      "Eosinophils": 2,
      "Basophils": 1
    },
    rawMessage: "H|\\^&|||Mindray^BC-5380|||||||P|1\rP|1|||RT-10029\rO|1|RT-10029||^^^CBC\rR|1|^^^HGB|8.6|g/dL|13.0-17.0|L||F\rR|2|^^^RBC|3.80|10^12/L|4.5-5.9|L||F\rR|3|^^^HCT|27.2|%|40.0-52.0|L||F\rR|4|^^^MCV|71.5|fL|80.0-98.0|L||F\rR|5|^^^MCH|22.6|pg|27.0-33.0|L||F\rR|6|^^^MCHC|31.6|g/dL|32.0-36.0|L||F\rR|7|^^^PLT|410|10^9/L|150-450|N||F\rR|8|^^^WBC|6.8|10^9/L|4.0-11.0|N||F\rL|1|N"
  },
  {
    id: "tx-chem-802",
    instrumentId: "inst-chem-01",
    instrumentName: "Roche Cobas c311",
    timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    sampleBarcode: "RT-10030",
    patientLabNumber: "RT-2026-002",
    patientName: "منى عادل عبد الرحمن",
    testCode: "LFT_KFT",
    status: "received",
    results: {
      "Fasting Blood Glucose": 115,
      "Serum Creatinine": 0.85,
      "Blood Urea": 26,
      "Uric Acid": 4.8,
      "ALT (SGPT)": 28,
      "AST (SGOT)": 24,
      "Total Bilirubin": 0.7,
      "Direct Bilirubin": 0.15,
      "Total Protein": 7.2,
      "Serum Albumin": 4.3
    },
    rawMessage: "MSH|^~\\&|Cobas_c311|ROCHE|LIS_RT_LAB|RTLAB|20261005||ORU^R01|MSG00981|P|2.3.1\rPID|1||RT-10030||منى عادل عبد الرحمن||19850412|F\rOBR|1||RT-10030|LFT^Liver Functions\rOBX|1|NM|GLU^Glucose Fasting||115|mg/dL|70-105|H|||F\rOBX|2|NM|CREAT^Creatinine||0.85|mg/dL|0.5-1.1|N|||F\rOBX|3|NM|ALT^SGPT||28|U/L|0-41|N|||F"
  }
];
