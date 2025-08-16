export interface LanguageStrings {
  appTitle: string;

  // goal context
  goalSectionTitle: string;
  wishLabel: string;
  wishPlaceholder: string;

  goalTypeLabel: string;
  goalTypeOtherLabel: string;
  goalTypeOptions: {
    emergency: string;
    debt: string;
    device: string;
    travel: string;
    tuition: string;
    move: string;
    build: string;
    other: string;
  };

  targetAmountLabel: string;
  targetAmountPlaceholder: string;
  targetAmountUnknown: string;

  startDateLabel: string;
  targetDateLabel: string;
  targetDateHint?: string;

  flexibilityLabel: string;
  flexibilityHard: string;
  flexibilitySoft: string;

  currentSavingsLabel: string;
  priorityLabel: string;
  priorityOptions: { high: string; medium: string; low: string; };
  riskLabel: string;
  riskOptions: { conservative: string; balanced: string; aggressive: string; };
  nonNegotiablesLabel: string;
  nonNegotiablesPlaceholder: string;
  add: string;
  motivationLabel: string;
  motivationPlaceholder: string;

  monthlyBudgetSetup: string;
  totalMonthlyBudget: string;
  addBudgetCategory: string;
  categoryName: string;
  categoryNamePlaceholder: string;
  budgetAmount: string;
  budgetAmountPlaceholder: string;
  addCategory: string;
  budgetCategories: string;
  saveBudget: string;
  budgetSaved: string;

  addExpense: string;
  expenseAmount: string;
  expenseAmountPlaceholder: string;
  selectCategory: string;
  expenseDescription: string;
  expenseDescriptionPlaceholder: string;
  addExpenseButton: string;
  saveExpensesButton: string;
  expenseAdded: string;

  budgetDashboard: string;
  budget: string; spent: string; remaining: string; percentage: string;
  recentExpenses: string;

  date: string;
  description: string;

  extraNotesTitle: string;
  extraNotesPlaceholder: string;

  generatePlan: string;
  needMoreExpenses: string;

  loading: string; save: string; cancel: string; delete: string;

  dupCategoryWarning: string;
  requiredField: string;

  // <-- ADD THIS
  planOutputPlaceholder: string;
}

export const englishStrings: LanguageStrings = {
  appTitle: "Finwise - Budget Tracker",

  goalSectionTitle: "Goals",
  wishLabel: "What do you wish for?",
  wishPlaceholder: "e.g., Buy a laptop for school, build 3-month emergency fund, pay off paylater",

  goalTypeLabel: "Goal type",
  goalTypeOtherLabel: "Specify type",
  goalTypeOptions: {
    emergency: "Emergency fund",
    debt: "Pay off debt",
    device: "Buy a laptop/phone",
    travel: "Trip/holiday",
    tuition: "Tuition",
    move: "Move/relocation",
    build: "Build savings",
    other: "Other",
  },

  targetAmountLabel: "Target amount (IDR)",
  targetAmountPlaceholder: "Enter amount",
  targetAmountUnknown: "Not sure",

  startDateLabel: "Start date",
  targetDateLabel: "When do you want to achieve this?",
  targetDateHint: "",

  flexibilityLabel: "Flexibility",
  flexibilityHard: "Must be by this date",
  flexibilitySoft: "Okay if it slips a bit",

  currentSavingsLabel: "Current savings for this goal (IDR)",
  priorityLabel: "Priority",
  priorityOptions: { high: "High", medium: "Medium", low: "Low" },
  riskLabel: "Risk profile",
  riskOptions: { conservative: "Conservative", balanced: "Balanced", aggressive: "Aggressive" },
  nonNegotiablesLabel: "Non-negotiables",
  nonNegotiablesPlaceholder: "Add an item (press Enter)…",
  add: "Add",
  motivationLabel: "Motivation (1 sentence)",
  motivationPlaceholder: "Why is this goal important to you?",

  monthlyBudgetSetup: "Monthly Budget Setup",
  totalMonthlyBudget: "Total Monthly Budget:",
  addBudgetCategory: "Add Budget Category",
  categoryName: "Category Name",
  categoryNamePlaceholder: "e.g., Food, Transport, Entertainment",
  budgetAmount: "Budget Amount",
  budgetAmountPlaceholder: "Enter amount",
  addCategory: "Add Category",
  budgetCategories: "Budget Categories:",
  saveBudget: "Save Budget",
  budgetSaved: "Saved successfully!",

  addExpense: "Add Expense",
  expenseAmount: "Expense Amount",
  expenseAmountPlaceholder: "Enter expense amount",
  selectCategory: "Select category",
  expenseDescription: "Expense Description",
  expenseDescriptionPlaceholder: "What did you spend on?",
  addExpenseButton: "Add Expense",
  saveExpensesButton: "Save Expenses",
  expenseAdded: "Expense added successfully!",

  budgetDashboard: "Budget Dashboard",
  budget: "Budget", spent: "Spent", remaining: "Remaining", percentage: "Percentage",
  recentExpenses: "Recent Expenses",

  date: "Date",
  description: "Description",

  extraNotesTitle: "Is there anything else you want to let us know?",
  extraNotesPlaceholder: "Add any extra context (optional)…",

  generatePlan: "Generate Plan",
  needMoreExpenses: "Add at least 5 expenses to enable.",

  loading: "Loading...", save: "Save", cancel: "Cancel", delete: "Delete",

  dupCategoryWarning: "Category already exists (case-insensitive).",
  requiredField: "This field is required.",

  planOutputPlaceholder: "Your generated plan will appear here."
};

export const indonesianStrings: LanguageStrings = {
  appTitle: "Finwise - Budget Tracker",

  goalSectionTitle: "Tujuan Anda",
  wishLabel: "Apa yang Anda inginkan?",
  wishPlaceholder: "contoh: Beli laptop untuk kuliah, dana darurat 3 bulan, lunasi paylater",

  goalTypeLabel: "Jenis tujuan",
  goalTypeOtherLabel: "Sebutkan jenis",
  goalTypeOptions: {
    emergency: "Dana darurat",
    debt: "Lunasi utang",
    device: "Beli laptop/HP",
    travel: "Liburan/perjalanan",
    tuition: "Biaya kuliah",
    move: "Pindah tempat tinggal",
    build: "Bangun tabungan",
    other: "Lainnya",
  },

  targetAmountLabel: "Nominal target (Rp)",
  targetAmountPlaceholder: "Masukkan jumlah",
  targetAmountUnknown: "Belum tahu",

  startDateLabel: "Tanggal mulai",
  targetDateLabel: "Kapan target tercapai?",
  targetDateHint: "",

  flexibilityLabel: "Fleksibilitas",
  flexibilityHard: "Harus tercapai di tanggal ini",
  flexibilitySoft: "Boleh mundur sedikit",

  currentSavingsLabel: "Tabungan saat ini untuk tujuan ini (Rp)",
  priorityLabel: "Prioritas",
  priorityOptions: { high: "Tinggi", medium: "Sedang", low: "Rendah" },
  riskLabel: "Profil risiko",
  riskOptions: { conservative: "Konservatif", balanced: "Seimbang", aggressive: "Agresif" },
  nonNegotiablesLabel: "Yang tidak bisa dikurangi",
  nonNegotiablesPlaceholder: "Tambah item (tekan Enter)…",
  add: "Tambah",
  motivationLabel: "Motivasi (1 kalimat)",
  motivationPlaceholder: "Kenapa tujuan ini penting?",

  monthlyBudgetSetup: "Setup Budget Bulanan",
  totalMonthlyBudget: "Total Budget Bulanan:",
  addBudgetCategory: "Tambah Kategori Budget",
  categoryName: "Nama Kategori",
  categoryNamePlaceholder: "contoh: Makanan, Transportasi, Hiburan",
  budgetAmount: "Jumlah Budget",
  budgetAmountPlaceholder: "Masukkan jumlah",
  addCategory: "Tambah Kategori",
  budgetCategories: "Kategori Budget:",
  saveBudget: "Simpan Budget",
  budgetSaved: "Berhasil disimpan!",

  addExpense: "Tambah Pengeluaran",
  expenseAmount: "Jumlah Pengeluaran",
  expenseAmountPlaceholder: "Masukkan jumlah pengeluaran",
  selectCategory: "Pilih kategori",
  expenseDescription: "Deskripsi Pengeluaran",
  expenseDescriptionPlaceholder: "Untuk apa pengeluaran ini?",
  addExpenseButton: "Tambah Pengeluaran",
  saveExpensesButton: "Simpan Pengeluaran",
  expenseAdded: "Pengeluaran berhasil ditambahkan!",

  budgetDashboard: "Dashboard Budget",
  budget: "Budget", spent: "Terpakai", remaining: "Sisa", percentage: "Persentase",
  recentExpenses: "Pengeluaran Terbaru",

  date: "Tanggal",
  description: "Deskripsi",

  extraNotesTitle: "Ada hal lain yang ingin Anda sampaikan?",
  extraNotesPlaceholder: "Tambahkan konteks tambahan (opsional)…",

  generatePlan: "Buat Rencana",
  needMoreExpenses: "Tambahkan minimal 5 pengeluaran untuk mengaktifkan.",

  loading: "Memuat...", save: "Simpan", cancel: "Batal", delete: "Hapus",

  dupCategoryWarning: "Kategori sudah ada (abaikan besar/kecil huruf).",
  requiredField: "Wajib diisi.",

  planOutputPlaceholder: "Rencana yang dihasilkan akan muncul di sini."
};
