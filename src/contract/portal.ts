//
//  portal.ts
//  ascend-kit
//
//  Created by Prakash on 17/10/26.
//

import type { SchoolRole } from "../types.ts";
import type { SiteContent, SiteFacts, SitePhoto, SiteSnapshot } from "./site.ts";

/**
 * What the School Portal asks core: binding CORE, entrypoint PortalApi. Every method below
 * re-checks the person's roles, the plan, the scope and (for changes) a read-only
 * subscription itself; the portal only hides what core says a person cannot open.
 */

export type Level = "view" | "edit" | "full" | "approve";
export type Grant = { level: Level; narrowed?: "own" | "wing"; note?: string };
export type ModuleTile = { module: string; name: string; grant: Grant; locked: boolean };
export type Subscription = { state: "active" | "grace" | "read_only"; termEnd: string; graceEnds: string };

/** A posted form, trimmed. */
export type Form = Record<string, string>;
/** A file from a multipart form. */
export type Upload = { name: string; type: string; bytes: ArrayBuffer };

/** The school a portal address serves; null when nothing is served there or it is suspended. */
export type PortalSchool = { name: string; slug: string; town: string | null; clearCookie: string };

/** What the shell needs about the signed-in person, read fresh on every request. */
export type PortalInfo = {
  userId: string; name: string; roles: SchoolRole[]; logo: boolean;
  /** null: the school has no subscription yet. */
  planKey: string | null; subscription: Subscription | null;
  /** The grant on every module in the matrix (null = none), already narrowed to view when read-only. */
  access: Record<string, Grant | null>;
  /** The plan includes the school website. */
  website: boolean;
  /** The staff roles this person may give. */
  grantable: SchoolRole[];
  tiles: ModuleTile[];
  /** A reissued cookie past half the session's life, for the response. */
  refreshedCookie: string | null;
};

export interface PortalApi {
  school(host: string): Promise<PortalSchool | null>;
  signInPage(host: string): Promise<{ hasLogo: boolean; devHint: string | null }>;
  /** Throws AppError 401 or 429. */
  signIn(a: { host: string; email: string; password: string; ip?: string }): Promise<{ setCookie: string }>;
  requestReset(a: { host: string; email: string; ip?: string }): Promise<void>;
  signOut(a: { host: string; cookie: string }): Promise<{ setCookie: string }>;
  logo(host: string): Promise<Response | null>;
  /** null when there is no valid session at this school. */
  open(a: { host: string; cookie: string }): Promise<PortalSession | null>;
}

export interface PortalSession {
  info(): Promise<PortalInfo>;
  readonly home: HomeApi;
  readonly setup: SetupApi;
  readonly students: StudentsApi;
  readonly staff: StaffApi;
  readonly documents: DocumentsApi;
  readonly privacy: PrivacyApi;
  readonly imports: ImportsApi;
  readonly fees: FeesApi;
  readonly attendance: AttendanceApi;
  readonly timetable: TimetableApi;
  readonly notices: NoticesApi;
  readonly exams: ExamsApi;
  readonly papers: PapersApi;
  readonly people: PeopleApi;
  readonly promotion: PromotionApi;
  readonly idcards: IdCardsApi;
  readonly certificates: CertificatesApi;
  readonly homework: HomeworkApi;
  readonly leave: LeaveApi;
  readonly admissions: AdmissionsApi;
  readonly compliance: ComplianceApi;
  readonly library: LibraryApi;
  readonly inventory: InventoryApi;
  readonly transport: TransportApi;
  readonly cashbook: CashbookApi;
  readonly payroll: PayrollApi;
  readonly marks: MarksApi;
  readonly website: WebsiteApi;
}

// ---- Home ------------------------------------------------------------------------------

export type HomeSection = "notices" | "setup" | "school_figures" | "people" | "academics" | "office" | "dues" | "my_classes" | "children" | "modules";
export type HomeCounts = { students: number; staff: number; classes: number; sections: number; untaught: number; signins: number; profile: number; years: number };
export type Money = { carried: number; raised: number; paid: number };
export type HomeData = {
  /** The sections this person's roles open, in page order. */
  sections: HomeSection[];
  counts: HomeCounts;
  academics?: { wing: boolean; rows: { id: string; cls: string; sec: string; teacher: string | null; n: number }[] };
  dues?: { sum: { owed: number | null; students: number; month: number | null } | null; rows: ({ student_id: string; name: string; admission_no: string; cls: string | null; due_on: string | null } & Money)[] };
  myClasses?: { mine: { id: string; cls: string; sec: string; n: number }[]; subjects: { section_id: string; cls: string; sec: string; subject: string }[] };
  children?: ({ id: string; name: string; cls: string | null; due_on: string | null; today: string | null } & Money)[];
  notices?: Notice[];
  people?: { role: SchoolRole; n: number }[];
};
export interface HomeApi { data(): Promise<HomeData> }

// ---- Setup: profile, calendar, holidays, classes, sections ----------------------------

export type Profile = { name: string; board: string | null; affiliation_no: string | null; address: string | null; town: string | null; logo_key: string | null; working_days: string; day_starts: string | null; day_ends: string | null };
export type Year = { id: string; label: string; starts_on: string; ends_on: string; is_current: number };
export type SectionRow = { id: string; name: string; class_id: string; class_name: string; class_teacher_id: string | null };
export type Choice = [string, string];

export interface SetupApi {
  profile(): Promise<{ edit: boolean; profile: Profile | null }>;
  calendar(): Promise<{ edit: boolean; years: Year[]; terms: { year_id: string; name: string; starts_on: string; ends_on: string }[] }>;
  holidays(): Promise<{ edit: boolean; holidays: { id: string; name: string; starts_on: string; ends_on: string }[] }>;
  saveProfile(f: Form, logo: Upload | null): Promise<void>;
  addYear(f: Form): Promise<void>;
  makeCurrent(id: string): Promise<void>;
  addTerm(f: Form): Promise<void>;
  addHoliday(f: Form): Promise<void>;
  removeHoliday(id: string): Promise<void>;
  classes(): Promise<{ edit: boolean; classes: { id: string; name: string; wing: string | null }[];
    sections: { id: string; class_id: string; name: string; teacher: string | null; students: number }[]; subjects: { class_id: string; name: string }[] }>;
  addClass(f: Form): Promise<void>;
  addToClass(classId: string, what: "sections" | "subjects", f: Form): Promise<void>;
  section(id: string): Promise<{ edit: boolean; section: SectionRow; subjects: { id: string; name: string }[]; mapped: { subject_id: string; staff_id: string }[]; staff: Choice[] }>;
  saveSection(id: string, f: Form): Promise<void>;
}

// ---- Students, parents, documents, privacy ---------------------------------------------

export type StudentRow = { id: string; admission_no: string; name: string; dob: string | null; gender: string | null; admission_date: string | null; section_id: string | null; roll_no: string | null; categories: string; status: string; class_name: string | null; section: string | null };
export type DocRow = { id: string; kind: string; file_name: string; at: string };
/** Documents the viewer may see; identity papers they may not are only counted. */
export type Docs = { docs: DocRow[]; hidden: number; canDelete: boolean };

export interface StudentsApi {
  list(q: { section: string; q: string; status: string }): Promise<{ edit: boolean; sections: Choice[];
    rows: { id: string; admission_no: string; name: string; class_name: string | null; section: string | null; roll_no: string | null; status: string }[] }>;
  newForm(): Promise<{ sections: Choice[] }>;
  /** The new student's id. */
  add(f: Form): Promise<string>;
  overview(id: string): Promise<{ s: StudentRow; edit: boolean }>;
  editForm(id: string): Promise<{ s: StudentRow; sections: Choice[] }>;
  parents(id: string): Promise<{ s: StudentRow; edit: boolean;
    guardians: { id: string; name: string; mobile: string; email: string | null; user_id: string | null; relation: string }[]; siblings: { id: string; name: string }[] }>;
  documents(id: string): Promise<{ s: StudentRow; edit: boolean } & Docs>;
  history(id: string): Promise<{ s: StudentRow; history: { status: string; on_date: string; note: string | null }[] }>;
  update(id: string, f: Form): Promise<void>;
  setStatus(id: string, f: Form): Promise<void>;
  linkGuardian(id: string, f: Form): Promise<void>;
  /** The child to go back to, or null. */
  guardianLogin(guardianId: string, f: Form): Promise<string | null>;
}

export interface DocumentsApi {
  upload(kind: "student" | "staff", ownerId: string, docKind: string, file: Upload | null): Promise<void>;
  /** Where it belonged. */
  remove(id: string): Promise<{ ownerKind: "student" | "staff"; ownerId: string }>;
  download(id: string): Promise<Response>;
}

export interface PrivacyApi {
  page(studentId: string): Promise<{ s: StudentRow }>;
  export(studentId: string): Promise<Response>;
  erase(studentId: string, confirm: string): Promise<void>;
}

// ---- Staff ------------------------------------------------------------------------------

export type StaffRow = { id: string; employee_no: string; name: string; designation: string | null; department: string | null; joining_date: string | null; qualifications: string | null; mobile: string | null; email: string | null; bank_name: string | null; bank_account: string | null; bank_ifsc: string | null; status: string; user_id: string | null };

export interface StaffApi {
  list(status: string): Promise<{ edit: boolean; rows: StaffRow[] }>;
  signins(): Promise<{ rows: StaffRow[]; suggested: Record<string, SchoolRole | "none">; roles: SchoolRole[]; adminLimit: number | null; adminUsers: number }>;
  giveSignins(f: Form): Promise<void>;
  newForm(): Promise<void>;
  add(f: Form): Promise<string>;
  overview(id: string): Promise<{ st: StaffRow; edit: boolean }>;
  editForm(id: string): Promise<{ st: StaffRow }>;
  access(id: string): Promise<{ st: StaffRow; edit: boolean; showBank: boolean; roles: string[] }>;
  documents(id: string): Promise<{ st: StaffRow; edit: boolean } & Docs>;
  update(id: string, f: Form): Promise<void>;
  /** false: nothing to do (they already sign in, or were relieved). */
  giveLogin(id: string, f: Form): Promise<boolean>;
  relieve(id: string): Promise<void>;
}

// ---- Excel import ----------------------------------------------------------------------

export type ImportKind = "students" | "staff" | "fee_balances";
export type RowReport = { row: number; errors: string[] };
export type ImportRun = { id: string; kind: ImportKind; file_name: string; total_rows: number; imported: number; status: string; at: string };

export interface ImportsApi {
  /** The kinds this person may import; throws 403 when none. */
  kinds(): Promise<ImportKind[]>;
  runs(): Promise<ImportRun[]>;
  page(kind: string): Promise<{ kind: ImportKind; runs: ImportRun[]; columns: { required: string[]; optional: string[] } }>;
  template(kind: string): Promise<Response>;
  /** The run's id. */
  run(kind: string, file: Upload | null): Promise<string>;
  report(id: string): Promise<{ kind: ImportKind; file_name: string; total_rows: number; imported: number; status: string; report: RowReport[]; at: string }>;
}

// ---- Fees -------------------------------------------------------------------------------

export type PayMode = "cash" | "upi" | "bank" | "cheque";
export type Payment = { id: string; student_id: string; fy: string; seq: number; amount_paise: number; mode: PayMode; reference: string | null; paid_on: string; note: string | null; status: "paid" | "cancelled"; cancel_reason: string | null; at: string };

export interface FeesApi {
  /** null: a narrowed grant (a parent), whose fees are on each child. */
  overview(): Promise<{ dues: ({ id: string; name: string; admission_no: string; cls: string | null; due_on: string | null } & Money)[];
    recent: (Payment & { name: string })[]; totals: { month: number | null; today: number } | null } | null>;
  structure(year: string | undefined): Promise<{ owner: boolean; all: Year[]; year: Year | null; classes: { id: string; name: string; n: number }[];
    heads: { id: string; class_id: string; head: string; amount_paise: number; due_on: string | null; raised: number }[]; counts: { year_id: string; n: number }[] } | null>;
  /** The year it went into. */
  addHead(f: Form): Promise<string>;
  copy(f: Form): Promise<string>;
  removeHead(id: string): Promise<string>;
  student(id: string): Promise<{ s: StudentRow; edit: boolean; concession: Grant | null; nonce: string; money: Money | null;
    lines: { description: string; amount_paise: number; concession_paise: number; due_on: string | null; kind: string }[]; payments: Payment[];
    current: { percent: number; reason: string } | null; asked: { id: string; percent: number; reason: string; requester: string | null } | null }>;
  concession(studentId: string, f: Form): Promise<void>;
  decide(studentId: string, requestId: string, decision: "approve" | "reject"): Promise<void>;
  /** The receipt's id. */
  collect(studentId: string, f: Form): Promise<string>;
  receipt(id: string): Promise<{ p: Payment; s: StudentRow; edit: boolean; money: Money | null;
    school: { name: string; address: string | null; town: string | null; affiliation_no: string | null; logo_key: string | null } | null }>;
  cancel(id: string, reason: string, origin: string): Promise<void>;
}

// ---- Attendance -------------------------------------------------------------------------

export type Mark = "present" | "absent" | "late" | "leave";
export type CalendarDay = { date: string; kind: "school" | "weekly" | "holiday" | "future"; holiday?: string };

export interface AttendanceApi {
  overview(date: string | undefined): Promise<{ date: string; grant: Grant } & (
    { parent: true; kids: { id: string; name: string; status: Mark | null }[] }
    | { parent: false; closed: string | null; rows: { id: string; cls: string; sec: string; n: number; marked: number; absent: number }[] })>;
  section(id: string, date: string | undefined): Promise<{ date: string; s: { id: string; name: string; class_name: string }; closed: string | null; late: boolean; canMark: boolean;
    students: { id: string; name: string; roll_no: string | null; status: Mark | null }[] }>;
  mark(id: string, f: Form): Promise<{ sectionId: string; date: string }>;
  student(id: string, month: string | undefined): Promise<{ s: StudentRow; year: { label: string } | null; days: { on_date: string; status: Mark }[];
    sum: Record<Mark, number> & { days: number; percent: number | null }; month: string; weeks: (CalendarDay | null)[][] }>;
}

// ---- Timetable --------------------------------------------------------------------------

export type TimetableStatus = { status: "draft" | "submitted" | "approved"; note: string | null; by_name: string; at: string };
export type Slot = { day: number; period: number; subject_id: string; subject: string; teacher: string | null };
export type Shape = { days: number[]; periods: number };

export interface TimetableApi {
  overview(): Promise<{ grant: Grant; shape: Shape; sections: { id: string; cls: string; sec: string; status: TimetableStatus["status"] | null; note: string | null }[];
    mine: { day: number; period: number; cls: string; subject: string }[] }>;
  section(id: string): Promise<{ grant: Grant; shape: Shape; s: { id: string; name: string; class_id: string; class_name: string }; live: Slot[]; draft: Slot[]; st: TimetableStatus | null }>;
  editPage(id: string): Promise<{ grant: Grant; shape: Shape; s: { id: string; name: string; class_id: string; class_name: string }; draft: Slot[]; live: Slot[]; subjects: { id: string; name: string }[] }>;
  setPeriods(periods: string): Promise<void>;
  save(id: string, f: Form): Promise<void>;
  decide(id: string, action: "approve" | "return", note: string | undefined): Promise<void>;
}

// ---- Notices, people, promotion, ID cards ----------------------------------------------

export type Audience = "all" | "staff" | "parents" | "class";
export type Notice = { id: string; title: string; body: string; audience: Audience; class_name: string | null; author: string; at: string; withdrawn: number };

export interface NoticesApi {
  list(): Promise<{ edit: boolean; notices: Notice[]; classes: { id: string; name: string }[] }>;
  post(f: Form): Promise<void>;
  withdraw(id: string): Promise<void>;
}

export interface PeopleApi {
  list(): Promise<{ allowed: SchoolRole[]; people: { user_id: string | null; staff_id: string | null; name: string; designation: string | null; email: string | null }[];
    roles: { user_id: string; role: SchoolRole }[] }>;
  setRoles(userId: string, wanted: string[]): Promise<void>;
}

export type PromoteSection = { id: string; class_id: string; label: string; name: string; sort: number; n: number };
export interface PromotionApi {
  page(from: string | undefined): Promise<{ all: PromoteSection[]; year: { label: string } | null; from: PromoteSection | null; to: string | null;
    students: { id: string; name: string; admission_no: string; roll_no: string | null }[] }>;
  /** What happened, for the banner's query string. */
  promote(f: Form): Promise<{ done: number; stayed: number; src: string; dst: string }>;
}

export type IdCard = { name: string; line: string; number: string; extra: string; photo: string | null };
export interface IdCardsApi {
  sections(): Promise<Choice[]>;
  sheet(q: { staff?: string; section?: string }): Promise<{ title: string; cards: IdCard[]; year: { label: string } | null;
    school: { name: string; address: string | null; town: string | null; logo_key: string | null } | null }>;
}

// ---- Website ----------------------------------------------------------------------------

export interface WebsiteApi {
  content(): Promise<{ draft: SiteContent; facts: SiteFacts }>;
  gallery(): Promise<SitePhoto[]>;
  publishState(): Promise<{ live: string; published: string | null; publishedAt: string | null; draft: string | null }>;
  saveDraft(f: Form): Promise<void>;
  /** Nothing is added without a file; the checks still run. */
  addPhoto(file: Upload | null, caption: string): Promise<void>;
  removePhoto(id: string): Promise<void>;
  preview(): Promise<SiteSnapshot>;
  media(id: string): Promise<Response | null>;
  publish(): Promise<void>;
  unpublish(): Promise<void>;
}

// ---- Exam & Evals -------------------------------------------------------------------------

export type EvalStatus = "pending" | "evaluated" | "failed" | "confirmed";
/** One question as the evaluator marked it. */
export type EvalQuestion = { q: string; awarded: number; max: number; comment: string };
/** What the evaluator returns: the text it read off the sheet and the marks it suggests. */
export type EvalResult = { extracted_text: string; questions: EvalQuestion[]; total: number; max_marks: number; feedback: string; confidence: string };
export type EvalRow = {
  id: string; title: string; status: EvalStatus; section: string; subject: string; student: string; admission_no: string;
  max_marks: number; score: number | null; final_score: number | null; created_by: string; created_at: string;
};
export type Eval = EvalRow & {
  answer_key: string; mime: string; provider: string | null; result: EvalResult | null; error: string | null; evaluated_at: string | null;
  confirmed_by: string | null; confirmed_at: string | null; note: string | null;
};

export interface ExamsApi {
  /** Evals this person may see, newest first; `edit` when they may evaluate in some section. */
  list(q: { section?: string; subject?: string }): Promise<{ edit: boolean; evals: EvalRow[]; sections: Choice[]; subjects: Choice[] }>;
  /** The upload form's choices: sections this person may evaluate in, and the subjects and students of the one chosen. */
  form(section: string | undefined): Promise<{ sections: Choice[]; section: string | null; subjects: Choice[]; students: Choice[] }>;
  /** Stores the sheet and asks the evaluator; returns the eval's id whatever the evaluator answered. */
  evaluate(f: Form, file: Upload | null): Promise<{ id: string }>;
  get(id: string): Promise<{ edit: boolean; eval: Eval }>;
  retry(id: string): Promise<void>;
  confirm(id: string, f: Form): Promise<void>;
  image(id: string): Promise<Response>;
}

// ---- Exam & Evals: syllabus, exams, papers, answer keys -----------------------------------

export type SyllabusFile = { id: string; subject_id: string; subject: string; class_name: string; title: string; file_name: string; mime: string; uploaded_by: string; at: string };
export type ExamRow = { id: string; name: string; term: string | null; starts_on: string; ends_on: string; papers: number; locked: number };
export type PaperRow = { id: string; exam_id: string; subject_id: string; subject: string; class_name: string; exam_date: string | null; max_marks: number;
  has_paper: number; questions: number; total: number; key_locked_at: string | null };
export type KeyPoint = { id: string; text: string; marks: number; suggested: number };
export type Question = { id: string; seq: number; number: string; section: string | null; text: string; marks: number; choice_group: string | null;
  answer: string | null; suggested: number; points: KeyPoint[] };
/** Plain arithmetic over the paper, worked out in core: what still blocks locking the key. */
export type PaperCheck = { counted: number; max_marks: number; unkeyed: string[]; unreviewed: string[]; short: { number: string; points: number; marks: number }[] };
export type Paper = PaperRow & { exam: string; paper_name: string | null; read_error: string | null; suggest_error: string | null; key_locked_by: string | null;
  questions_list: Question[]; check: PaperCheck; syllabus: SyllabusFile[]; ai: boolean };

export interface PapersApi {
  syllabus(): Promise<{ edit: boolean; year: string | null; files: SyllabusFile[]; subjects: Choice[] }>;
  addSyllabus(subjectId: string, title: string, file: Upload | null): Promise<void>;
  removeSyllabus(id: string): Promise<void>;
  syllabusFile(id: string): Promise<Response>;

  exams(): Promise<{ create: boolean; exams: ExamRow[]; terms: Choice[] }>;
  createExam(f: Form): Promise<{ id: string }>;
  exam(id: string): Promise<{ create: boolean; exam: ExamRow; papers: (PaperRow & { mine: boolean })[]; subjects: Choice[] }>;
  addPaper(examId: string, f: Form): Promise<{ id: string }>;

  paper(id: string): Promise<{ edit: boolean; paper: Paper }>;
  uploadPaper(id: string, file: Upload | null): Promise<void>;
  paperFile(id: string): Promise<Response>;
  /** Optional AI step: reads questions off the uploaded paper as a draft. Refused when questions exist unless replace. */
  readQuestions(id: string, replace: boolean): Promise<{ added: number }>;
  saveQuestion(paperId: string, questionId: string | null, f: Form): Promise<void>;
  removeQuestion(paperId: string, questionId: string): Promise<void>;
  /** The expected answer and marking points (fields answer, p_text_N, p_marks_N). */
  saveKey(paperId: string, questionId: string, f: Form): Promise<void>;
  /** The only regular AI step: drafts keys for questions without points (or one question). Never touches a saved key. */
  suggestKey(paperId: string, questionId: string | null): Promise<{ suggested: number }>;
  lockKey(paperId: string): Promise<void>;
  unlockKey(paperId: string): Promise<void>;
}

/** Certificates (Standard): what the office issues from a student's own record. */
export type CertificateKind = "bonafide" | "conduct" | "transfer";
/** One line in the issued list. */
export type CertificateRow = { id: string; serial: string; kind: CertificateKind; student: string; admission_no: string; at: string; issued_by: string };
/** An issued certificate with everything its printed page shows, read from the record at print time. */
export type Certificate = {
  id: string; serial: string; kind: CertificateKind; at: string;
  student: { name: string; admission_no: string; dob: string | null; gender: string | null; admission_date: string | null; section: string | null; guardian: string | null };
  school: { name: string; address: string | null; town: string | null; logo_key: string | null };
  year: string | null;
  /** The school has uploaded its own letterhead for this kind, so the built-in header is left off. */
  template: boolean;
};

export interface CertificatesApi {
  /** Active students matching a name or admission number; empty under two characters. */
  search(q: string): Promise<{ id: string; name: string; admission_no: string; section: string | null }[]>;
  recent(): Promise<CertificateRow[]>;
  /** Issues one and returns its id. Throws AppError 403 without edit, 404 for a student out of scope. */
  issue(a: { student: string; kind: CertificateKind }): Promise<{ id: string }>;
  /** null when the id is not this school's. */
  one(id: string): Promise<Certificate | null>;
  /** Which kinds the school has uploaded a letterhead for. */
  templates(): Promise<Record<CertificateKind, boolean>>;
  /** A null file removes it. Throws AppError 403 without edit. */
  saveTemplate(kind: CertificateKind, file: Upload | null): Promise<void>;
  /** null when the school has none for that kind. */
  template(kind: CertificateKind): Promise<Response | null>;
}

/** Homework (Standard): what one section's subject teacher has set, due on a day. */
export type HomeworkRow = { id: string; due_on: string; body: string; set_by: string; at: string; section: string; subject: string; mine: number };

export interface HomeworkApi {
  /** `choices` are the section-and-subject pairs this person may set, as [value, label]. */
  list(): Promise<{ canSet: boolean; rows: HomeworkRow[]; choices: [string, string][] }>;
  /** Fields: pair ("sectionId:subjectId"), due_on, body. Throws AppError 403 for a subject this person does not teach. */
  post(f: Form): Promise<void>;
  remove(id: string): Promise<void>;
}

/** Leave (Standard): a staff member's own, or a student's, with where it stands. */
export type LeaveStatus = "pending" | "approved" | "declined" | "withdrawn";
export type LeaveRow = {
  id: string; kind: "staff" | "student"; who: string; detail: string | null;
  from_on: string; to_on: string; reason: string; status: LeaveStatus;
  asked_by: string; at: string; decided_by: string | null; decided_at: string | null;
  /** The signed-in person asked for this one, so they may withdraw it. */
  own: number;
  /** This person may approve or decline it now. */
  canDecide: boolean;
};

export interface LeaveApi {
  /** `children` are students this person may ask for, as [id, name]. */
  list(): Promise<{ rows: LeaveRow[]; canAskSelf: boolean; children: [string, string][] }>;
  /** Fields: for ("me" or a student id), from_on, to_on, reason. */
  ask(f: Form): Promise<void>;
  decide(id: string, approve: boolean): Promise<void>;
  withdraw(id: string): Promise<void>;
}

/** Admissions (Standard): one person asking about a seat, and where their enquiry stands. */
export type AdmissionStage = "enquiry" | "applied" | "admitted" | "declined" | "enrolled";
export type AdmissionRow = {
  id: string; name: string; guardian: string | null; mobile: string | null;
  status: AdmissionStage; note: string | null; at: string; moved_at: string | null;
  class_name: string | null;
};

export interface AdmissionsApi {
  list(): Promise<{ rows: AdmissionRow[]; classes: [string, string][]; canEdit: boolean }>;
  /** Fields: name, guardian, mobile, class_id, note. */
  add(f: Form): Promise<void>;
  /** Throws AppError 400 when the stage cannot follow the current one. */
  move(id: string, to: string): Promise<void>;
}

/** Compliance (Standard): one class's heads, as UDISE+ asks for them. */
export type ComplianceRow = { class_name: string; boys: number; girls: number; other: number; total: number; rte: number };
/** Where the school stands against the RTE share. */
export type RteStatus = { rte: number; total: number; share: number; meets: boolean; shortfall: number };

export interface ComplianceApi {
  /** Counted from the records on every call; nothing is stored or filed. */
  report(): Promise<{ year: string | null; rows: ComplianceRow[]; totals: ComplianceRow; staff: number; rte: RteStatus }>;
}

/** Library (Premium): a title on the shelf, with how many copies can be taken now. */
export type LibraryBook = { id: string; title: string; author: string | null; code: string | null; copies: number; out: number; available: number };
export type LoanState = "returned" | "overdue" | "due_today" | "out";
/** One copy in a child's hands, or the record of one that came back. */
export type LibraryLoan = {
  id: string; title: string; student: string; admission_no: string;
  taken_on: string; due_on: string; returned_on: string | null;
  state: LoanState;
  /** Days late; 0 when it is not, and 0 once returned. */
  late: number;
};

export interface LibraryApi {
  list(): Promise<{ canEdit: boolean; books: LibraryBook[]; loans: LibraryLoan[] }>;
  /** Students to issue to, by name or admission number. */
  search(q: string): Promise<{ id: string; name: string; admission_no: string; section: string | null }[]>;
  /** Fields: title, author, code, copies. */
  addBook(f: Form): Promise<void>;
  /** Fields: book, student. Throws AppError 400 when no copy is free or the child holds too many. */
  issue(f: Form): Promise<void>;
  giveBack(id: string): Promise<void>;
}

/** Inventory (Premium): a thing the store keeps, with the count its movements add up to. */
export type InventoryItem = { id: string; name: string; unit: string | null; code: string | null; stock: number };
/** One movement: positive came in, negative went out. */
export type InventoryMove = { id: string; item: string; delta: number; note: string | null; actor: string; at: string };

export interface InventoryApi {
  list(): Promise<{ canEdit: boolean; items: InventoryItem[]; moves: InventoryMove[] }>;
  /** Fields: name, unit, code. */
  addItem(f: Form): Promise<void>;
  /** Fields: item, qty, way ("in" or "out"), note. Throws AppError 400 when it would leave less than nothing. */
  move(f: Form): Promise<void>;
}

/** Transport (Premium): a route with its stops, and how full it is. */
export type TransportRoute = {
  id: string; name: string; vehicle_no: string | null; driver: string | null; driver_mobile: string | null;
  seats: number | null; taken: number;
  /** Seats left, or null when the route has no count set. */
  left: number | null;
  /** The stops in order, joined for reading. */
  stops: string;
};
/** One child's ride, with the driver a guardian would ring. */
export type TransportRide = {
  student_id: string; student: string; route: string; stop: string;
  vehicle_no: string | null; driver: string | null; driver_mobile: string | null;
};

export interface TransportApi {
  /** A guardian gets only their children's rides and an empty route list. */
  list(): Promise<{ canEdit: boolean; routes: TransportRoute[]; rides: TransportRide[] }>;
  search(q: string): Promise<{ id: string; name: string; admission_no: string; section: string | null }[]>;
  /** Stops to put a child on, as [id, "Route · Stop"]. */
  stops(): Promise<[string, string][]>;
  /** Fields: name, vehicle_no, driver, driver_mobile, seats. */
  addRoute(f: Form): Promise<void>;
  /** Fields: route, name, sort. */
  addStop(f: Form): Promise<void>;
  /** Fields: student, stop. Throws AppError 400 when the route is full. */
  assign(f: Form): Promise<void>;
  unassign(studentId: string): Promise<void>;
}

/** Income and expenses (Premium): one line of the cash book. */
export type CashEntry = {
  id: string; on_date: string; way: "in" | "out"; head: string;
  amount_paise: number; mode: string; note: string | null;
  /** "fees" rows are read from fee_payments and cannot be changed here. */
  source: "book" | "fees";
};

export interface CashbookApi {
  /** One month, "YYYY-MM"; the current month when not given. Fee collections are included, read-only. */
  list(month?: string): Promise<{ month: string; rows: CashEntry[]; totals: { in: number; out: number; net: number }; canEdit: boolean }>;
  /** Fields: way ("in"/"out"), on_date, head, amount (rupees), mode, note. The book is append-only. */
  add(f: Form): Promise<void>;
}

/** Payroll (Premium): a person's monthly pay as it stands now. */
export type StaffSalary = { staff_id: string; name: string; designation: string | null; monthly_paise: number | null };
export type RunStatus = "draft" | "approved" | "paid";
/** The month's run: prepared by the accountant, approved by the owner, then marked paid. */
export type PayrollRun = { id: string; month: string; status: RunStatus; approved_by: string | null; approved_at: string | null; paid_at: string | null };
/** One person's line in a run. The pay is as it stood when the run was opened. */
export type PayrollLine = {
  id: string; staff: string; designation: string | null;
  gross_paise: number; deduction_paise: number; net_paise: number;
  note: string | null; month: string; status: RunStatus;
};

export interface PayrollApi {
  /** A teacher gets only their own approved and paid payslips. */
  list(month?: string): Promise<{
    month: string; run: PayrollRun | null; lines: PayrollLine[]; salaries: StaffSalary[];
    canPrepare: boolean; canApprove: boolean;
  }>;
  /** Fields: staff, amount (rupees). */
  setSalary(f: Form): Promise<void>;
  /** Opens the month from the salaries as they stand. Throws AppError 400 if already open. */
  open(month: string): Promise<void>;
  /** Fields: amount (rupees, blank for none), note. Draft runs only. */
  setDeduction(lineId: string, f: Form): Promise<void>;
  /** Owner only; throws AppError 403 for anyone else. */
  approve(runId: string): Promise<void>;
  markPaid(runId: string): Promise<void>;
}

/** Exam marks (Standard): one student's line on a marks sheet. */
export type MarkRow = { student_id: string; name: string; admission_no: string; marks: number | null; absent: number };
/** What a report card adds up to. An absent paper is shown but not counted. */
export type ReportSummary = { sat: number; got: number; outOf: number; percent: number; passed: boolean; absent: number };
export type ReportCard = {
  exam: { name: string; starts_on: string; ends_on: string };
  student: { name: string; admission_no: string; section: string | null };
  school: { name: string; address: string | null; town: string | null; logo_key: string | null };
  lines: { subject: string; marks: number | null; absent: boolean; max: number }[];
  summary: ReportSummary;
};

export interface MarksApi {
  /** Staff only: the sheet for one paper and section. `canEnter` is false for a subject this person does not teach. */
  sheet(q: { exam?: string; paper?: string; section?: string }): Promise<{
    exams: Choice[]; exam: string | null; papers: Choice[]; paper: string | null;
    sections: Choice[]; section: string | null; max: number; canEnter: boolean; rows: MarkRow[];
  }>;
  /** Fields: paper, section, and m_<studentId> / a_<studentId> per student. Refuses the whole sheet if any mark is wrong. */
  save(f: Form): Promise<void>;
  /** Students whose card this person may open: a guardian's children, a teacher's sections, all for the office. */
  cards(examId?: string): Promise<{ exams: Choice[]; exam: string | null; students: { id: string; name: string; admission_no: string; section: string | null }[] }>;
  /** null when the student has no marks in that exam. */
  card(examId: string, studentId: string): Promise<ReportCard | null>;
}
