export type Employment = "internship" | "full-time" | "apprenticeship" | "contract" | "unknown";
export type ApplyType = "auto" | "assisted";

export interface RawJob {
  source: string;
  external_id: string;
  title: string;
  company: string;
  company_type?: "startup" | "company" | "unknown";
  location?: string;
  is_remote?: boolean;
  employment?: Employment;
  salary?: string;
  description?: string;
  url: string;
  apply_type?: ApplyType;
  tags?: string[];
  posted_at?: string;
}

export interface SearchParams {
  query?: string;
  location?: string;
  remoteOnly?: boolean;
  limit?: number;
}

export type FetchFn = (p: SearchParams) => Promise<RawJob[]>;

export function classifyEmployment(text: string): Employment {
  const t = text.toLowerCase();
  if (/\bintern(ship)?\b/.test(t)) return "internship";
  if (/\bapprentic/.test(t)) return "apprenticeship";
  if (/\bcontract|freelance\b/.test(t)) return "contract";
  if (/\bfull[-\s]?time|permanent\b/.test(t)) return "full-time";
  return "unknown";
}
