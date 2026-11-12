//
//  portal.ts
//  ascend-kit
//
//  Created by Prakash on 17/10/26.
//

import type { SchoolRole } from "../types.ts";
import type { Lang } from "../i18n.ts";
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
/** `language`: the portal's language until a person chooses their own on their phone (F-03). */
export type PortalSchool = { name: string; slug: string; town: string | null; clearCookie: string; language: Lang };

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
  /** `language`: what this person chose while signed in (F-04), to bring back on a new phone; null if never. */
  signIn(a: { host: string; email: string; password: string; ip?: string }): Promise<{ setCookie: string; language: Lang | null }>;
  /** Mobile and the PIN from the school office's slip (F-01). Throws AppError 401 or 429. */
  pinSignIn(a: { host: string; mobile: string; pin: string; ip?: string }): Promise<{ setCookie: string; language: Lang | null }>;
  requestReset(a: { host: string; email: string; ip?: string }): Promise<void>;
  signOut(a: { host: string; cookie: string }): Promise<{ setCookie: string }>;
  logo(host: string): Promise<Response | null>;
  /** null when there is no valid session at this school. */
  open(a: { host: string; cookie: string }): Promise<PortalSession | null>;
}

export interface PortalSession {
  info(): Promise<PortalInfo>;
  /** The language this person chose on the switch, kept on their sign-in (F-04: WhatsApp messages to them follow it). */
  setLanguage(lang: Lang): Promise<void>;
  readonly whatsapp: WhatsAppApi;
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
  readonly scripts: ScriptsApi;
  readonly pins: PinsApi;
  readonly people: PeopleApi;
  readonly promotion: PromotionApi;
  readonly idcards: IdCardsApi;
  readonly certificates: CertificatesApi;
  readonly homework: HomeworkApi;
  readonly leave: LeaveApi;
  readonly admissions: AdmissionsApi;
  readonly compliance: ComplianceApi;
  readonly library: LibraryApi;
  readonly hostel: HostelApi;
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
  /** `today`: today's receipts by mode, as the day book counts them (F-06). */
  dues?: { sum: { owed: number | null; students: number; month: number | null } | null; rows: ({ student_id: string; name: string; admission_no: string; cls: string | null; due_on: string | null } & Money)[]; today: ModeTotals;
    /** F-09: UPI payments waiting for the accountant. */
    toConfirm: number };
  myClasses?: { mine: { id: string; cls: string; sec: string; n: number }[]; subjects: { section_id: string; cls: string; sec: string; subject: string }[] };
  /**
   * F-08: one card per child. `month`: this month's marked days and those attended (present or late);
   * `receipt`: the newest paid receipt; `card`: the newest exam the child has marks in, with its percentage.
   */
  children?: ({ id: string; name: string; cls: string | null; section_id: string | null; due_on: string | null; today: string | null;
    month: { days: number; attended: number }; receipt: { id: string; amount: number; paid_on: string } | null;
    card: { exam_id: string; exam: string; percent: number } | null } & Money)[];
  notices?: Notice[];
  /** Signed in with the PIN from the office's slip and not yet chosen their own. */
  pinFromOffice?: boolean;
  people?: { role: SchoolRole; n: number }[];
};
export interface HomeApi { data(): Promise<HomeData> }

// ---- Setup: profile, calendar, holidays, classes, sections ----------------------------

/** What printed receipts and certificates are in (F-03, the school's choice). */
export type PrintLanguage = "en" | "te" | "both";
export type Profile = { name: string; board: string | null; affiliation_no: string | null; address: string | null; town: string | null; logo_key: string | null; working_days: string; day_starts: string | null; day_ends: string | null;
  print_language: PrintLanguage; language: Lang; upi_id: string | null };
export type Year = { id: string; label: string; starts_on: string; ends_on: string; is_current: number };
export type SectionRow = { id: string; name: string; class_id: string; class_name: string; class_teacher_id: string | null };
export type Choice = [string, string];

export interface SetupApi {
  profile(): Promise<{ edit: boolean; profile: Profile | null }>;
  /** `in_use`: why a year or term can't be deleted (null: it can). */
  calendar(): Promise<{ edit: boolean; years: (Year & { in_use: string | null })[]; terms: { id: string; year_id: string; name: string; starts_on: string; ends_on: string; in_use: string | null }[] }>;
  holidays(): Promise<{ edit: boolean; holidays: { id: string; name: string; starts_on: string; ends_on: string }[] }>;
  saveProfile(f: Form, logo: Upload | null): Promise<void>;
  addYear(f: Form): Promise<void>;
  makeCurrent(id: string): Promise<void>;
  updateYear(id: string, f: Form): Promise<void>;
  removeYear(id: string): Promise<void>;
  addTerm(f: Form): Promise<void>;
  updateTerm(id: string, f: Form): Promise<void>;
  removeTerm(id: string): Promise<void>;
  addHoliday(f: Form): Promise<void>;
  updateHoliday(id: string, f: Form): Promise<void>;
  removeHoliday(id: string): Promise<void>;
  /** `in_use`: why a class, section or subject can't be deleted (null: it can). Renaming is always allowed. */
  classes(): Promise<{ edit: boolean; classes: { id: string; name: string; wing: string | null; in_use: string | null }[];
    sections: { id: string; class_id: string; name: string; teacher: string | null; students: number; in_use: string | null }[];
    subjects: { id: string; class_id: string; name: string; periods_per_week: number; in_use: string | null }[];
    /** Working days and periods a day, so a page can weigh the quotas against the week. */
    week: { days: number; periods: number } }>;
  addClass(f: Form): Promise<void>;
  updateClass(id: string, f: Form): Promise<void>;
  removeClass(id: string): Promise<void>;
  addToClass(classId: string, what: "sections" | "subjects", f: Form): Promise<void>;
  removeSection(id: string): Promise<void>;
  updateSubject(id: string, f: Form): Promise<void>;
  removeSubject(id: string): Promise<void>;
  /** Fields p_<subjectId>, periods a week; blank or 0 means the subject is not scheduled. */
  setSubjectPeriods(classId: string, f: Form): Promise<void>;
  section(id: string): Promise<{ edit: boolean; section: SectionRow; subjects: { id: string; name: string }[]; mapped: { subject_id: string; staff_id: string }[]; staff: Choice[] }>;
  /** Fields: name (optional: renames), class_teacher_id, subject_<id>. */
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
  /** `batch`: slips to print for those given a mobile-only sign-in (F-02); null when everyone got an email. */
  giveSignins(f: Form): Promise<{ batch: string | null }>;
  newForm(): Promise<void>;
  add(f: Form): Promise<string>;
  overview(id: string): Promise<{ st: StaffRow; edit: boolean }>;
  editForm(id: string): Promise<{ st: StaffRow }>;
  access(id: string): Promise<{ st: StaffRow; edit: boolean; showBank: boolean; roles: string[]; pin: PinState | null }>;
  documents(id: string): Promise<{ st: StaffRow; edit: boolean } & Docs>;
  update(id: string, f: Form): Promise<void>;
  /** false: nothing to do (they already sign in, or were relieved). */
  /** `given` false when they already sign in or have left; `batch`: their slip, when the sign-in is by mobile. */
  giveLogin(id: string, f: Form): Promise<{ given: boolean; batch: string | null }>;
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
/** F-09: a UPI payment a parent sent. `payment_id`: the receipt its confirmation made. */
export type UpiClaim = { id: string; amount_paise: number; reference: string; paid_on: string; status: "pending" | "confirmed" | "rejected"; reason: string | null; payment_id: string | null; at: string };
export type Payment = { id: string; student_id: string; fy: string; seq: number; amount_paise: number; mode: PayMode; reference: string | null; paid_on: string; note: string | null; status: "paid" | "cancelled"; cancel_reason: string | null; at: string };

/** A row of the dues list (F-06): the first parent linked and the office's note. */
export type DuesRow = { id: string; name: string; admission_no: string; roll_no: string | null; cls: string | null; due_on: string | null;
  parent: string | null; mobile: string | null; note: string | null; promised_on: string | null } & Money;
/** A day's receipts that count, by mode (F-06). */
export type ModeTotals = { cash: number; upi: number; bank: number; cheque: number; total: number; count: number };

export interface FeesApi {
  /** null: a narrowed grant (a parent), whose fees are on each child. */
  /** `filter` (F-06): a section, and sort (oldest, owed, overdue). With a section every owing student; else the first 200. */
  overview(filter?: { section?: string; sort?: string }): Promise<{ dues: DuesRow[];
    recent: (Payment & { name: string })[]; totals: { month: number | null; today: number } | null;
    sections: Choice[]; section: string | null; sort: "oldest" | "owed" | "overdue"; today: string; write: boolean;
    /** F-09: UPI payments parents sent, waiting for confirmation (0 for those who can't confirm). */
    toConfirm: number } | null>;
  /** The same list as a CSV file for Excel (F-06). */
  duesCsv(filter?: { section?: string; sort?: string }): Promise<Response>;
  /** The office's note on a student's dues (F-06). Fields: note (empty removes it), promised_on. */
  note(studentId: string, f: Form): Promise<void>;
  /** A day's receipts by mode and collector, and that day's cancellations (F-06). Today unless a past date is asked. */
  daybook(date?: string): Promise<{ date: string; today: string; totals: ModeTotals;
    receipts: { id: string; fy: string; seq: number; at: string; student: string; amount_paise: number; mode: PayMode; collector: string | null }[];
    byCollector: { collector: string | null; count: number; total: number }[];
    cancelled: { id: string; fy: string; seq: number; paid_on: string; student: string; amount_paise: number; mode: PayMode; reason: string | null; by: string | null; cancelled_at: string | null }[] }>;
  structure(year: string | undefined): Promise<{ owner: boolean; all: Year[]; year: Year | null; classes: { id: string; name: string; n: number }[];
    heads: { id: string; class_id: string; head: string; amount_paise: number; due_on: string | null; at_admission: number; raised: number; collected: number }[]; counts: { year_id: string; n: number }[] } | null>;
  /** The year it went into. */
  addHead(f: Form): Promise<string>;
  copy(f: Form): Promise<string>;
  /** Name and due date always; the amount only until money is collected against the head. The year it is in. */
  updateHead(id: string, f: Form): Promise<string>;
  removeHead(id: string): Promise<string>;
  student(id: string): Promise<{ s: StudentRow; edit: boolean; concession: Grant | null; nonce: string; money: Money | null;
    /** `id`: a due's id (null for a carried-in balance); `removable`: a fee for this student with nothing paid against it (F-05). */
    lines: { id: string | null; description: string; amount_paise: number; concession_paise: number; due_on: string | null; kind: string; removable: boolean }[]; payments: Payment[];
    current: { percent: number; reason: string } | null;
    /** An open request: a percentage, or an agreed amount when `agreed_paise` is set (F-05). */
    asked: { id: string; percent: number; agreed_paise: number | null; reason: string; requester: string | null } | null;
    /** The current year, the amount agreed with the family for its class fees, and those class fees before any discount (F-05). */
    year: Year | null; agreement: { amount_paise: number; reason: string; at: string } | null; classTotal: number;
    /** The office's note (F-06); null for a parent. */
    note: { note: string; promised_on: string | null; at: string } | null;
    /** F-09: the school's UPI ID (null: UPI payments are off), whether this person may send a claim, and this child's claims. */
    upi: { id: string | null; payee: string; canClaim: boolean; claims: UpiClaim[] } }>;
  /** F-09: a parent's UPI payment, waiting for the accountant. Fields: amount (rupees), reference (12-digit UTR), paid_on. */
  claimUpi(studentId: string, f: Form): Promise<void>;
  /** F-09: every claim waiting, oldest first; fee editors only. */
  upiClaims(): Promise<{ rows: { id: string; student_id: string; student: string; admission_no: string; cls: string | null; amount_paise: number; reference: string; paid_on: string; at: string; sender: string | null }[] }>;
  /** F-09: makes the numbered receipt, once. Returns its id. */
  confirmUpi(claimId: string): Promise<string>;
  rejectUpi(claimId: string, reason: string): Promise<void>;
  concession(studentId: string, f: Form): Promise<void>;
  /** Fields: amount (rupees; empty removes it, the owner only), reason. The owner sets it; the accountant's is a request. */
  agree(studentId: string, f: Form): Promise<void>;
  /** A fee for this student only, this year. Fields: head, amount (rupees), due_on. */
  addStudentFee(studentId: string, f: Form): Promise<void>;
  removeStudentFee(studentId: string, dueId: string): Promise<void>;
  decide(studentId: string, requestId: string, decision: "approve" | "reject"): Promise<void>;
  /** The receipt's id. */
  collect(studentId: string, f: Form): Promise<string>;
  receipt(id: string): Promise<{ p: Payment; s: StudentRow; edit: boolean; money: Money | null;
    school: { name: string; address: string | null; town: string | null; affiliation_no: string | null; logo_key: string | null; print_language: PrintLanguage } | null }>;
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
    students: { id: string; name: string; roll_no: string | null; status: Mark | null }[];
    /** F-10: may tell absent children's parents on WhatsApp (whoever may mark, and the office). */
    canTell: boolean }>;
  /** F-10: every child absent that day in the sections this person may tell parents about; `marked`: marks saved that day. */
  absent(date: string | undefined): Promise<{ date: string; marked: number; rows: { id: string; name: string; roll_no: string | null; section_id: string; cls: string }[] }>;
  mark(id: string, f: Form): Promise<{ sectionId: string; date: string }>;
  student(id: string, month: string | undefined): Promise<{ s: StudentRow; year: { label: string } | null; days: { on_date: string; status: Mark }[];
    sum: Record<Mark, number> & { days: number; percent: number | null }; month: string; weeks: (CalendarDay | null)[][] }>;
}

// ---- Timetable --------------------------------------------------------------------------

export type TimetableStatus = { status: "draft" | "submitted" | "approved"; note: string | null; by_name: string; at: string };
export type Slot = { day: number; period: number; subject_id: string; subject: string; teacher: string | null };
export type Shape = { days: number[]; periods: number };

/** One teacher in two sections at the same period. `sections` are labels, already sorted. */
export type TimetableClash = { day: number; period: number; staff: string; sections: string[] };

/** What generating a draft did: how many periods went in, and what would not fit. */
export type Generated = { placed: number; unplaced: { subject: string; wanted: number; placed: number }[] };

export interface TimetableApi {
  /** Empty when the plan has no clash checks. School-wide, whichever version is asked for. */
  clashes(version: "draft" | "live"): Promise<TimetableClash[]>;
  /** Fills the section's draft from the subjects' weekly periods. Throws AppError 403 without the plan feature. */
  generate(id: string): Promise<Generated>;
  overview(): Promise<{ grant: Grant; shape: Shape; sections: { id: string; cls: string; sec: string; status: TimetableStatus["status"] | null; note: string | null }[];
    mine: { day: number; period: number; cls: string; subject: string }[] }>;
  section(id: string): Promise<{ grant: Grant; shape: Shape; s: { id: string; name: string; class_id: string; class_name: string }; live: Slot[]; draft: Slot[]; st: TimetableStatus | null }>;
  editPage(id: string): Promise<{ grant: Grant; shape: Shape; s: { id: string; name: string; class_id: string; class_name: string }; draft: Slot[]; live: Slot[];
    subjects: { id: string; name: string; periods_per_week: number }[];
    /** The plan includes auto-generation; the page still needs a quota set before it offers it. */
    canGenerate: boolean }>;
  setPeriods(periods: string): Promise<void>;
  save(id: string, f: Form): Promise<void>;
  decide(id: string, action: "approve" | "return", note: string | undefined): Promise<void>;
}

// ---- Notices, people, promotion, ID cards ----------------------------------------------

export type Audience = "all" | "staff" | "parents" | "class";
export type Notice = { id: string; title: string; body: string; audience: Audience; class_name: string | null; author: string; at: string; withdrawn: number; edited_at: string | null;
  /** How many students a notice names. Zero means its whole audience; more means only their guardians. */
  picked: number };

/** A section in the picker, and how many active students it holds. */
export type PickSection = { id: string; label: string; n: number };
export type PickStudent = { id: string; name: string; admission_no: string; roll_no: string | null };

/** How a notice went out on one channel. `reason` is the first failure, for the office to read. */
export type NoticeDelivery = { channel: "sms" | "whatsapp"; summary: string; reason: string | null };

export interface NoticesApi {
  list(): Promise<{ edit: boolean; notices: Notice[]; classes: { id: string; name: string }[] }>;
  /** The students of one section, to tick for a notice meant only for them. */
  pickPage(sectionId: string | undefined): Promise<{ sections: PickSection[]; section: PickSection | null; students: PickStudent[] }>;
  post(f: Form): Promise<void>;
  /** Title and text of a notice still up; it then shows as edited. */
  edit(id: string, f: Form): Promise<void>;
  withdraw(id: string): Promise<void>;
  /** Queues a notice to a channel and tries each send now. Sending twice adds nobody twice. */
  send(noticeId: string, channel: string): Promise<void>;
  /** Empty until a notice has been sent on some channel. */
  delivery(noticeId: string): Promise<NoticeDelivery[]>;
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
  /** Deletes an eval that isn't confirmed, with its photo. */
  remove(id: string): Promise<void>;
  image(id: string): Promise<Response>;
}

// ---- Exam & Evals: syllabus, exams, papers, answer keys -----------------------------------

export type SyllabusFile = { id: string; subject_id: string; subject: string; class_name: string; title: string; file_name: string; mime: string; uploaded_by: string; at: string };
export type ExamRow = { id: string; name: string; term: string | null; starts_on: string; ends_on: string; papers: number; locked: number };
export type PaperRow = { id: string; exam_id: string; subject_id: string; subject: string; class_name: string; exam_date: string | null; max_marks: number;
  has_paper: number; questions: number; total: number; key_locked_at: string | null;
  /** Why the paper can't be edited or deleted now (null: it can). */
  in_use: string | null };
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
  renameSyllabus(id: string, title: string): Promise<void>;
  removeSyllabus(id: string): Promise<void>;
  syllabusFile(id: string): Promise<Response>;

  exams(): Promise<{ create: boolean; exams: ExamRow[]; terms: Choice[] }>;
  createExam(f: Form): Promise<{ id: string }>;
  /** `in_use`: why the exam can't be deleted (null: it can, with its papers' drafts). */
  exam(id: string): Promise<{ create: boolean; exam: ExamRow & { term_id: string | null; in_use: string | null }; papers: (PaperRow & { mine: boolean })[]; subjects: Choice[]; terms: Choice[] }>;
  updateExam(id: string, f: Form): Promise<void>;
  removeExam(id: string): Promise<void>;
  addPaper(examId: string, f: Form): Promise<{ id: string }>;
  /** Maximum marks and date, while the key is unlocked. */
  updatePaper(id: string, f: Form): Promise<void>;
  /** The exam it was in. */
  removePaper(id: string): Promise<{ examId: string }>;

  /** `edit`: sets questions and the key; `manage`: changes or deletes the paper itself (the principal and owner). */
  paper(id: string): Promise<{ edit: boolean; manage: boolean; paper: Paper }>;
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
  /** Refused while the paper has answer scripts: their marks were given against this key. */
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

// ---- Exam & Evals: answer scripts and marks ------------------------------------------------

/** A student of the class on a paper's register, with their script if one was uploaded. */
export type ScriptRow = { id: string | null; student_id: string; student: string; admission_no: string; section: string;
  status: EvalStatus | null; score: number | null; final_score: number | null;
  /** F-12: the phone's id for a queued script, and whether it is being marked now (pending and claimed recently). */
  ref?: string | null; marking?: boolean };
/** One question of a script: its marks, what the evaluator suggested, and the mark the teacher gave (null until confirmed). */
export type ScriptMark = { question_id: string; number: string; section: string | null; choice_group: string | null; marks: number;
  suggested: number | null; mark: number | null; comment: string };
export type Script = {
  id: string; paper_id: string; exam: string; subject: string; class_name: string; student: string; admission_no: string; section: string;
  status: EvalStatus; max_marks: number; pages: { n: number; mime: string }[]; provider: string | null; error: string | null; evaluated_at: string | null;
  feedback: string; confidence: string; extracted_text: string; marks: ScriptMark[]; score: number | null; final_score: number | null;
  note: string | null; confirmed_by: string | null; confirmed_at: string | null; created_by: string; created_at: string;
};

export interface ScriptsApi {
  /** The class's students on a locked paper, in the sections this person may see; `edit` when they may mark one of them. */
  register(paperId: string, section?: string): Promise<{ edit: boolean; paper: PaperRow & { exam: string }; sections: Choice[]; section: string | null;
    rows: (ScriptRow & { mine: boolean })[] }>;
  /** Stores the pages in order and asks the evaluator; returns the script's id whatever the evaluator answered. Replaces an unconfirmed script. */
  upload(paperId: string, studentId: string, files: Upload[], o?: { mark?: boolean; ref?: string }): Promise<{ id: string }>;
  /** F-12: marks a queued (pending) script once, whoever asks first; reports its state either way. */
  mark(id: string): Promise<{ id: string; status: EvalStatus; score: number | null }>;
  get(id: string): Promise<{ edit: boolean; script: Script }>;
  retry(id: string): Promise<void>;
  /** Fields m_<question id> (one per question, halves allowed) and note. The total is worked out in core. */
  confirm(id: string, f: Form): Promise<void>;
  reopen(id: string): Promise<void>;
  /** Deletes an unconfirmed script and its pages. */
  remove(id: string): Promise<{ paperId: string }>;
  page(id: string, n: number): Promise<Response>;
}

// ---- Sign-in with mobile and PIN (F-01) ----------------------------------------------------

/** A parent on the office's sign-in slips page. `issued_at`: when a slip was last printed; `chosen_at`: when they chose their own PIN. */
export type SlipParent = { guardian_id: string; name: string; mobile: string; children: string; email: string | null; issued_at: string | null; chosen_at: string | null };
/** A staff member on the office's PIN slips list (F-02): only staff who already sign in and have a mobile. */
export type SlipStaff = { staff_id: string; name: string; designation: string | null; mobile: string; email: string | null; issued_at: string | null; chosen_at: string | null };
/** Whether someone signs in with a PIN: when their slip was printed, and when they chose their own. */
export type PinState = { mobile: string; issued_at: string; chosen_at: string | null };
/** One printed slip. The PIN exists only here, for the few minutes the print page is open. `staff`: the designation on a staff slip. */
export type Slip = { name: string; mobile: string; pin: string; children: string[]; staff?: string };

/** A parent a WhatsApp button goes to (F-04): first linked first. */
/** `sent` (F-10, when asked for): this parent's latest message of that kind for that day, and who opened it; null: not yet. */
export type ParentContact = { id: string; name: string; mobile: string; relation: string; sent?: { at: string; by: string | null } | null };
export interface WhatsAppApi {
  /** Each student's parents, for the buttons on receipts, the dues list and the register. Staff only. */
  parents(studentIds: string[], sent?: { kind: "absence"; date: string }): Promise<Record<string, ParentContact[]>>;
  /**
   * Checks the sender may send it, writes the message from the records in the parent's language, audits it, and
   * returns the wa.me address. Fields: kind (receipt, reminder, absence, notice), id (payment, student or notice),
   * to (the guardian, all but notice), date (absence).
   */
  send(f: Form): Promise<{ url: string }>;
}

export interface PinsApi {
  /** Parents of a section, for the office (student records, edit and above). */
  parents(section?: string): Promise<{ sections: Choice[]; section: string | null; parents: SlipParent[] }>;
  /**
   * A new PIN for each guardian; one without a sign-in gets one, from their mobile. Earlier PINs stop working and
   * their sessions end. The slips are kept sealed for 15 minutes under the returned batch, to print.
   */
  print(guardianIds: string[]): Promise<{ batch: string }>;
  /** Staff who sign in and have a mobile, for the office (staff records, edit and above). */
  staff(): Promise<SlipStaff[]>;
  /** A new PIN for each staff member, as `print`; only for staff who already sign in, on their own mobile. */
  printStaff(staffIds: string[]): Promise<{ batch: string }>;
  /** null once the batch has expired, or for another school's batch. */
  slips(batch: string): Promise<{ school: string; portal: string; logo: boolean; printedBy: string; slips: Slip[] } | null>;
  /** The signed-in person chooses their own PIN. Fields: current, pin, pin2. */
  change(f: Form): Promise<void>;
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
  student: { name: string; admission_no: string; section: string | null; roll_no?: string | null };
  school: { name: string; address: string | null; town: string | null; logo_key: string | null };
  lines: { subject: string; marks: number | null; absent: boolean; max: number }[];
  summary: ReportSummary;
  /** F-07: marked days and days present (or late) over the exam's year up to its last day; the class teacher's remark; the print language. */
  attendance?: { days: number; present: number } | null; remark?: string | null; print_language?: PrintLanguage;
};
/** One cell of the marks grid (F-07): `ai` when it came from a confirmed answer script. */
export type GridCell = { marks: number | null; absent: boolean; ai: boolean };
export type MarksGrid = { exams: Choice[]; exam: string | null; sections: Choice[]; section: string | null;
  /** `edit`: this person may mark that subject in this section. */
  papers: { id: string; subject: string; max: number; edit: boolean }[];
  rows: { id: string; name: string; roll_no: string | null; admission_no: string; cells: GridCell[] }[];
  remarks: Record<string, string>; canRemark: boolean };

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
  /** F-07: one section's students down, the exam's subjects across. */
  grid(q: { exam?: string; section?: string }): Promise<MarksGrid>;
  /** Fields: exam, section, m_<paper>_<student>, a_<paper>_<student>, r_<student>. A blank cell is not entered; a bad one refuses all. */
  saveGrid(f: Form): Promise<void>;
  /** Every card of a section, for printing the class in one go. */
  classCards(examId: string, sectionId: string): Promise<ReportCard[]>;
}

/** Hostel (add-on): a room, with how many places are free. */
export type HostelRoom = { id: string; name: string; capacity: number; note: string | null; taken: number; left: number };
/** One boarder and the room they are in. */
export type HostelBoarder = { student_id: string; student: string; admission_no: string; room: string; from_on: string };

export interface HostelApi {
  /** A guardian gets their own children's rooms and an empty room list. */
  list(): Promise<{ canEdit: boolean; rooms: HostelRoom[]; boarders: HostelBoarder[] }>;
  search(q: string): Promise<{ id: string; name: string; admission_no: string; section: string | null }[]>;
  /** Fields: name, capacity, note. */
  addRoom(f: Form): Promise<void>;
  /** Fields: student, room. Throws AppError 400 when the room is full. */
  allocate(f: Form): Promise<void>;
  release(studentId: string): Promise<void>;
}
