import { GoogleGenAI, FunctionDeclaration, Type } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";
import { AgentType } from "../types";

// Tool Definitions
const callMedicalRecordsTool: FunctionDeclaration = {
  name: "panggil_sub_agen_rekam_medis",
  description: "Mengambil dan merangkum riwayat medis pasien, hasil lab, diagnosis, dan rencana perawatan. PERHATIAN: Hanya untuk data klinis sensitif.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      permintaan_pengguna: {
        type: Type.STRING,
        description: "Kueri lengkap pengguna yang akan diteruskan.",
      },
    },
    required: ["permintaan_pengguna"],
  },
};

const callPatientManagementTool: FunctionDeclaration = {
  name: "panggil_sub_agen_manajemen_pasien",
  description: "Menangani pendaftaran pasien baru, pembaruan data identitas, dan info umum non-klinis.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      permintaan_pengguna: {
        type: Type.STRING,
        description: "Kueri lengkap pengguna yang akan diteruskan.",
      },
    },
    required: ["permintaan_pengguna"],
  },
};

const callAppointmentTool: FunctionDeclaration = {
  name: "panggil_sub_agen_penjadwal",
  description: "Menangani pembuatan janji temu, perubahan jadwal, atau pembatalan konsultasi dokter.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      permintaan_pengguna: {
        type: Type.STRING,
        description: "Kueri lengkap pengguna yang akan diteruskan.",
      },
    },
    required: ["permintaan_pengguna"],
  },
};

const callBillingTool: FunctionDeclaration = {
  name: "panggil_sub_agen_penagihan",
  description: "Menangani informasi biaya, status pembayaran, dan klaim asuransi.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      permintaan_pengguna: {
        type: Type.STRING,
        description: "Kueri lengkap pengguna yang akan diteruskan.",
      },
    },
    required: ["permintaan_pengguna"],
  },
};

export const classifyAndDelegate = async (apiKey: string, userQuery: string) => {
  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: userQuery }] }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{
          functionDeclarations: [
            callMedicalRecordsTool,
            callPatientManagementTool,
            callAppointmentTool,
            callBillingTool
          ]
        }],
        toolConfig: {
            functionCallingConfig: {
                mode: 'ANY' // Force the model to use a tool
            }
        }
      }
    });

    const candidates = response.candidates;
    if (!candidates || candidates.length === 0) {
      throw new Error("No candidates returned");
    }

    const firstPart = candidates[0].content.parts[0];

    // Check for function call
    if (firstPart.functionCall) {
      return {
        type: 'DELEGATION',
        functionName: firstPart.functionCall.name,
        args: firstPart.functionCall.args,
      };
    } 
    
    // Fallback if model refuses to call tool (rare with 'ANY' mode)
    return {
      type: 'ERROR',
      message: "Koordinator gagal mendelegasikan tugas. Mohon ulangi permintaan."
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      type: 'ERROR',
      message: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
};

// Mock response generator for the sub-agents (since we don't have a real hospital DB)
export const simulateSubAgentResponse = (agentType: AgentType, originalQuery: string): string => {
    // Artificial delay simulation is handled in UI, this just returns text
    switch(agentType) {
        case AgentType.MEDICAL_RECORDS:
            return `[SISTEM AMAN] Mengakses basis data Rekam Medis Elektronik (EHR)...\n\nVerifikasi otentikasi berhasil.\n\nBerdasarkan ID Pasien yang tersirat, berikut ringkasan klinis:\n- Diagnosis Terakhir: Bronkitis Akut (ICD-10 J20.9)\n- Hasil Lab (Hematologi): Leukosit sedikit meningkat (12.000/uL).\n- Rencana: Lanjutkan antibiotik selama 3 hari lagi.\n\n*Catatan: Data ini dilindungi enkripsi end-to-end.*`;
        case AgentType.APPOINTMENTS:
            return `[SISTEM JADWAL] Memeriksa slot ketersediaan dokter...\n\n- Dr. Budi (Sp.PD): Tersedia Selasa, 10:00 WIB.\n- Dr. Siti (Sp.P): Penuh hingga Jumat.\n\nApakah Anda ingin saya memproses booking untuk slot Dr. Budi?`;
        case AgentType.BILLING:
            return `[SISTEM KEUANGAN] Mengakses data billing...\n\nTotal tagihan tertunggak: Rp 450.000 (Konsultasi + Obat).\nStatus Asuransi: BPJS Kesehatan (Aktif).\n\nSilakan menuju loket kasir atau gunakan aplikasi mobile untuk pelunasan mandiri.`;
        case AgentType.PATIENT_MANAGEMENT:
            return `[ADMINISTRASI] Data demografis pasien ditemukan.\n\nNama: [DISAMARKAN]\nUsia: 45 Tahun\nAlamat: Jl. Merdeka No. 10.\n\nData telah diverifikasi dengan Dukcapil. Tidak ada pembaruan data yang tertunda.`;
        default:
            return "Agen tidak merespons.";
    }
};

export const mapFunctionToAgentType = (functionName: string): AgentType => {
    switch (functionName) {
        case "panggil_sub_agen_rekam_medis": return AgentType.MEDICAL_RECORDS;
        case "panggil_sub_agen_manajemen_pasien": return AgentType.PATIENT_MANAGEMENT;
        case "panggil_sub_agen_penjadwal": return AgentType.APPOINTMENTS;
        case "panggil_sub_agen_penagihan": return AgentType.BILLING;
        default: return AgentType.COORDINATOR;
    }
};
