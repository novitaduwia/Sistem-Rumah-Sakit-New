import { AgentType, SubAgentDefinition } from './types';
import { Activity, Calendar, CreditCard, Database, ShieldAlert } from 'lucide-react';
import React from 'react';

export const SUB_AGENTS: Record<AgentType, SubAgentDefinition> = {
  [AgentType.COORDINATOR]: {
    type: AgentType.COORDINATOR,
    name: "Koordinator Pusat",
    description: "Menganalisis maksud & mendelegasikan tugas.",
    icon: "ShieldAlert",
    color: "bg-blue-600",
    isSecure: false
  },
  [AgentType.MEDICAL_RECORDS]: {
    type: AgentType.MEDICAL_RECORDS,
    name: "Sub-agen Rekam Medis",
    description: "Akses riwayat medis, lab, diagnosis (Sangat Rahasia).",
    icon: "Activity",
    color: "bg-red-600",
    isSecure: true
  },
  [AgentType.PATIENT_MANAGEMENT]: {
    type: AgentType.PATIENT_MANAGEMENT,
    name: "Sub-agen Manajemen Pasien",
    description: "Pendaftaran & info umum pasien.",
    icon: "Database",
    color: "bg-emerald-600",
    isSecure: false
  },
  [AgentType.APPOINTMENTS]: {
    type: AgentType.APPOINTMENTS,
    name: "Sub-agen Penjadwal",
    description: "Booking & modifikasi jadwal.",
    icon: "Calendar",
    color: "bg-amber-600",
    isSecure: false
  },
  [AgentType.BILLING]: {
    type: AgentType.BILLING,
    name: "Sub-agen Penagihan",
    description: "Biaya, klaim asuransi & tagihan.",
    icon: "CreditCard",
    color: "bg-purple-600",
    isSecure: false
  }
};

export const SYSTEM_INSTRUCTION = `
# PERAN KOORDINATOR PUSAT (SISTEM RUMAH SAKIT)

Anda adalah 'Sistem Rumah Sakit,' Koordinator Pusat untuk seluruh layanan berbasis Agen AI. Misi Anda adalah menyediakan layanan kesehatan yang efisien dan aman dengan mendelegasikan tugas secara sempurna.

[8] DAFTAR SUB-AGEN YANG TERSEDIA:
- Sub-agen Manajemen Pasien (Untuk pendaftaran, identitas, atau info umum pasien yang tidak sensitif).
- Sub-agen Penjadwal Janji Temu (Untuk booking atau modifikasi jadwal).
- Sub-agen Rekam Medis (Untuk data klinis, riwayat, hasil lab, diagnosis).
- Sub-agen Penagihan dan Asuransi (Untuk kueri biaya, klaim, atau penagihan).

[9] PRINSIP OPERASIONAL KETAT (HARUS DIIKUTI):
A. DELEGASI WAJIB: Anda tidak pernah boleh mencoba memproses atau menjawab permintaan pengguna secara langsung. Tugas Anda adalah MENGANALISIS maksud pengguna dan HANYA mendelegasikannya melalui Function Call.
B. PRINSIP SATU PANGGILAN: Anda harus memanggil HANYA SATU sub-agen yang paling sesuai per permintaan pengguna.
C. TRANSMISI DATA: Anda harus menyertakan semua detail yang relevan dari kueri asli pengguna dalam pemanggilan (arguments) ke sub-agen yang dipilih.

[10] PRIORITAS TINGGI (KHUSUS REKAM MEDIS):
Jika permintaan melibatkan riwayat medis, hasil lab, atau diagnosis, Anda harus memilih 'Sub-agen Rekam Medis'. Ingat, sub-agen tersebut diinstruksikan untuk memproses data tersebut dengan prioritas keamanan dan privasi data tertinggi.
`;
