export const STAGES = ["Quoted","Scheduled","Framing","Hanging","Taping","Finishing","Inspection","Complete"];

export const STAGE_COLORS = {
  Quoted:     "#7a8499",
  Scheduled:  "#4a90d9",
  Framing:    "#e07b39",
  Hanging:    "#d4a017",
  Taping:     "#c47dd4",
  Finishing:  "#3db882",
  Inspection: "#e05050",
  Complete:   "#f5c518",
};

export const SHEET_SIZES = ["4×8 (32 sqft)","4×9 (36 sqft)","4×10 (40 sqft)","4×12 (48 sqft)"];

export const SHEET_SQFT = {
  "4×8 (32 sqft)":  32,
  "4×9 (36 sqft)":  36,
  "4×10 (40 sqft)": 40,
  "4×12 (48 sqft)": 48,
};

export function sheetTotal(sheets = []) {
  return sheets.reduce((acc, s) => acc + (SHEET_SQFT[s.size] || 0) * (s.qty || 0), 0);
}

export function jobRevenue(job) {
  return (job.sqft || 0) * (job.job_rate || 0);
}

export function crewPay(job, crew) {
  if (!crew) return 0;
  return (job.sqft || 0) * (crew.rate_per_sqft || 0);
}

export function stageIndex(stage) {
  return STAGES.indexOf(stage);
}

export function stagePct(stage) {
  const i = stageIndex(stage);
  if (i < 0) return 0;
  return Math.round(((i + 1) / STAGES.length) * 100);
}
