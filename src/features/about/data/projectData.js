/**
 * SALAM Project Documentation Data
 * Source of Truth: D:\LEVEL3\workbased projcet\AI317_SALAM_Team_Document_Arabic_Updated.docx
 * Strictly faithful to the documented hierarchy, roles, stack, phases, and safety policies.
 * Complete Bilingual Support (Arabic & English).
 */

export const academicMetadata = {
  university: 'جامعة الدلتا للعلوم والتكنولوجيا',
  universityEn: 'Delta University for Science and Technology',
  faculty: 'كلية الذكاء الاصطناعي',
  facultyEn: 'Faculty of Artificial Intelligence',
  department: 'Faculty of Artificial Intelligence',
  departmentEn: 'Faculty of Artificial Intelligence',
  courseCode: 'AI317',
  courseName: 'مشروع مهني قائم على بيئة العمل في الذكاء الاصطناعي (1)',
  courseNameEn: 'Work-based Professional Project in Artificial Intelligence (I)',
  projectTitle: 'سَـــلام — نظام التوعية بالصحة النفسية العربي المدعوم بالذكاء الاصطناعي',
  projectTitleEn: 'SALAM – AI-Powered Arabic Mental Health Awareness System',
  supervisor: 'د. أحمد زقزوق',
  supervisorTitle: 'Supervisor: Dr. Ahmed Zakzouk',
  teamRequirement: 'فريق عمل أكاديمي مكون من ستة أعضاء وفق متطلبات المقرر',
  teamRequirementEn: 'Academic project team consisting of 6 members per course requirements',
};

export const taskSpecification = {
  taskNumber: '1',
  title: 'اكتشاف مؤشرات الاكتئاب من وسائل التواصل الاجتماعي',
  titleEn: 'Social Media Depression Detection',
  concept: 'بناء نموذج NLP يحلل المنشورات النصية لاكتشاف مؤشرات لغوية مرتبطة بالاكتئاب.',
  conceptEn: 'Building an NLP model that analyzes textual posts to detect linguistic indicators associated with depression.',
  technologies: [
    'BERT / RoBERTa',
    'AraBERT',
    'NLP',
    'Sentiment Analysis',
    'Text Classification',
  ],
  outputs: 'درجة أو تصنيف لمؤشرات الحالة النفسية، وليس تشخيصاً طبياً.',
  outputsEn: 'A score or classification of psychological indicators, strictly not a medical diagnosis.',
  evaluation: 'Accuracy, Precision, Recall, F1-Score, ROC-AUC',
  difficulty: 'متوسطة',
  difficultyEn: 'Intermediate',
};

export const projectOverview = {
  problemStatement:
    'يواجه الأشخاص الذين يعبرون عن ضيقهم النفسي باللغة العربية، بما في ذلك العامية المصرية، محدودية في الوصول إلى موارد توعوية ميسرة وملائمة. وتجعل اللهجات العربية، وأساليب الإملاء غير الرسمية، والخصوصيات السياقية، تحليل النصوص مهمة بالغة التحدي أمام الأنظمة الآلية. يسعى مشروع «سَـــلام» إلى استكشاف إمكانية استخدام معالجة اللغة الطبيعية للتعرف على الأنماط اللغوية المرتبطة بالضيق النفسي وتقديم إرشادات توعوية حذرة وغير تشخيصية. ويلتزم النظام التزاماً قاطعاً بعدم ادعاء تشخيص أي حالة نفسية أو إخبار المستخدم بأنه آمن بشكل مؤكد.',
  problemStatementEn:
    'Individuals expressing psychological distress in Arabic, including colloquial Egyptian dialect, face limited access to accessible, culturally tailored awareness resources. Arabic dialects, informal spelling variations, and contextual nuances make automated text analysis extraordinarily challenging. SALAM explores utilizing Natural Language Processing to identify linguistic patterns associated with distress and provide cautious, non-diagnostic guidance. The system strictly commits to never claiming to diagnose any condition or declaring any user definitively "safe".',

  proposedSolution:
    'يقدم مشروع «سَـــلام» نموذجاً أولياً لمنظومة توعوية قائمة على الويب موجهة للغة العربية أولاً (Arabic-first). يُدخل المستخدم نصاً قصيراً، فيتحقق النظام من مطابقة المدخلات للحدود المسموح بها لغوياً وحجمياً. ثم يحلل النص عبر نموذج تعلم آلي ليُعيد مؤشراً توعوياً مصاغاً بحذر وحزام عدم يقين عند الحاجة، مع إسناد اختياري لمقاطع الكلمات المؤثرة، ومصادر دعم معتمدة ومراجعة. كما تضمن واجهة المستخدم بقاء إشعار الحدود وروابط الوصول للدعم ظاهرة دائماً حتى في حال تعطل الخادم أو النموذج.',
  proposedSolutionEn:
    'SALAM provides an Arabic-first web-based awareness prototype. The user enters a short text, which the system validates against language and length constraints. It then analyzes the text using machine learning to return a cautiously worded indicator with uncertainty bounds, optional word-span attribution, and accredited support resources. The UI guarantees that boundaries and support hotlines remain permanently visible, even during server or model downtime.',

  arabicConceptPoints: [
    {
      id: 'simple-concept',
      title: 'الفكرة ببساطة',
      titleEn: 'Concept in Brief',
      description:
        'موقع إلكتروني هدفه التوعية بالصحة النفسية باللغة العربية. المستخدم يكتب جملة أو نصاً قصيراً يعبر فيه عن شعوره، والنظام يستخدم تقنيات الذكاء الاصطناعي ومعالجة اللغة الطبيعية لتحليل النص وتقدير ما إذا كانت فيه مؤشرات لغوية مرتبطة بالضيق النفسي، ثم يعرض نتيجة توعوية بصياغة حذرة.',
      descriptionEn:
        'An Arabic-first mental health awareness web platform. The user inputs a brief text expressing feelings, and the system leverages NLP techniques to detect distress-related linguistic markers, rendering a cautiously framed educational outcome.',
    },
    {
      id: 'problem-solved',
      title: 'المشكلة التي يعالجها المشروع',
      titleEn: 'Problem Addressed',
      description:
        'صعوبة وصول بعض الأشخاص إلى معلومات توعوية مناسبة عن الصحة النفسية. كما أن اللغة العربية غنية باللهجات وطرق الكتابة المختلفة، ومنها العامية المصرية، مما يصعب على النماذج فهمها بدقة. يختبر المشروع قدرة نماذج معالجة اللغة الطبيعية على التعامل مع النصوص العربية مع بيان حدودها بدقة.',
      descriptionEn:
        'Barriers in accessing tailored Arabic mental health resources, exacerbated by informal dialects such as Egyptian Arabic. The project methodically tests NLP capabilities on Arabic text while defining precise scientific boundaries.',
    },
    {
      id: 'workflow-flow',
      title: 'كيف سيعمل النظام؟',
      titleEn: 'How the System Works',
      description:
        '1) يكتب المستخدم نصاً قصيراً في واجهة الموقع. 2) يتحقق النظام من مناسبة النص للتحليل وحدود الطول واللغة المدعومة. 3) يمرر النص إلى نموذج تعلم آلي لتحليله. 4) يعرض الموقع مؤشراً توعوياً غير تشخيصي مع توضيح عدم اليقين ومصادر دعم موثوقة ومراجعة مسبقاً، مع بقاء روابط الدعم ظاهرة دوماً.',
      descriptionEn:
        '1) User submits text. 2) System validates length, scope, and Arabic character set. 3) An ML model extracts linguistic features. 4) A non-diagnostic indicator with explicit uncertainty bounds is returned alongside accredited human support channels.',
    },
    {
      id: 'ai-role',
      title: 'أين يأتي دور الذكاء الاصطناعي؟',
      titleEn: 'Role of Artificial Intelligence',
      description:
        'سيبدأ الفريق بنموذج أساسي يستخدم TF-IDF مع Logistic Regression، ثم يقارن به نموذجاً لغوياً عربياً متقدماً مرشحاً هو MARBERTv2 إذا سمحت البيانات والموارد. ستتم مقارنة النماذج على بيانات اختبار ثابتة ومقفلة وبمقاييس دقيقة، مع تدقيق المصادر والتراخيص مسبقاً.',
      descriptionEn:
        'The pipeline develops an interpretable baseline using TF-IDF with Logistic Regression, subsequently benchmarked against MARBERTv2 on a strictly locked test set using comprehensive evaluation metrics.',
    },
    {
      id: 'red-lines',
      title: 'ما الذي لا يفعله المشروع؟ (خطوط حمراء)',
      titleEn: 'Ethical Red Lines (What SALAM Does NOT Do)',
      description:
        '«سَـــلام» ليس طبيباً ولا أداة لتشخيص أي اضطراب نفسي، ولا يقدم علاجاً، ولا يجوز أن يخبر المستخدم بأنه آمن بشكل مؤكد. قد يخطئ النموذج في فهم اللهجة أو السخرية أو النفي؛ لذلك يتم التعامل بحذر وإظهار عدم اليقين. كما يُمنع حفظ نصوص المستخدمين الخام في قواعد البيانات أو السجلات نهائياً.',
      descriptionEn:
        'SALAM is strictly not a diagnostic or clinical tool. It never offers treatment and never issues an absolute guarantee of safety. The system never persists raw user input to databases or server logs.',
    },
    {
      id: 'expected-outcome',
      title: 'النتيجة المتوقعة للمشروع',
      titleEn: 'Expected Deliverable',
      description:
        'الناتج المتوقع هو نموذج أولي تعليمي لموقع عربي يساعد على تقديم توعية أولية ومصادر دعم تمت مراجعتها، ويختبر بصورة منظمة نماذج الذكاء الاصطناعي في تحليل النصوص العربية. نجاح المشروع يتطلب مراجعة بشرية لسياسة السلامة ومحتوى الدعم قبل أي استخدام فعلي.',
      descriptionEn:
        'An educational web prototype offering initial awareness and curated support resources while rigorously investigating Arabic NLP models. Real-world readiness requires ongoing human review of safety guidelines.',
    },
  ],

  scopeItems: [
    'واجهة ويب باللغة العربية أولاً بتخطيط متكامل من اليمين لليسار (RTL) وصياغة توعوية معتمدة.',
    'التحقق الصارم من مدخلات النصوص ومعالجة الحالات الخارجة عن النطاق أو غير الكافية بوضوح.',
    'تدقيق مجموعات البيانات والتراخيص وإخفاء الهوية ومنع تسريب البيانات وقفل مجموعة الاختبار.',
    'بناء نموذج أساسي يعتمد على TF-IDF مع Logistic Regression متبوعاً بمقارنة مع MARBERTv2.',
    'معايرة مخرجات النموذج الإحصائية وإتاحة خيار الامتناع (Abstention) عند عدم كفاية الموثوقية.',
    'واجهة خلفية خفيفة مبنية بواسطة FastAPI متصلة بتطبيق واجهة React / Vite.',
    'إسناد دلالي غير سببي للنصوص (Explainability) لتوضيح مقاطع الكلمات المؤثرة على التقدير.',
    'حظر التشخيص وتخزين النصوص الخام أو كاشتها، وعدم تقديم أي ضمان للمستخدم بسلامته المطلقة.',
    'سياسة أزمات ودعم نفسي مراجعة، ومراجعة خارجية مستقلة لصياغة نصوص السلامة قبل أي إطلاق.',
  ],
  scopeItemsEn: [
    'Arabic-first web interface with comprehensive RTL/LTR layout and vetted awareness copy.',
    'Rigorous input validation handling out-of-scope or insufficient submissions transparently.',
    'Dataset auditing, licensing verification, privacy anonymization, and locked test set.',
    'Interpretable baseline model (TF-IDF + Logistic Regression) followed by MARBERTv2 comparison.',
    'Calibrated statistical confidence outputs with ethical abstention when reliability is low.',
    'Lightweight FastAPI backend integrated with a modern React / Vite frontend client.',
    'Non-causal semantic word attribution (XAI) highlighting influential text spans.',
    'Strict prohibition of clinical diagnosis, raw text persistence, or absolute safety guarantees.',
    'Expert-vetted crisis support resources and independent verification of safety copy.',
  ],

  datasetAndCompute: {
    datasetAudit:
      'تحديد مجموعة البيانات وتدقيقها إلزامياً قبل التدريب: فحص المصدر، الترخيص، تسلسل المنشأ، معاني التصنيفات، خطوات إخفاء الهوية والخصوصية، ومدى ملاءمتها للغة العربية والعامية المصرية. مع تضمين مجموعة اختبار منفصلة للهجة المصرية عند الإمكان.',
    datasetAuditEn:
      'Mandatory pre-training dataset audit: inspecting origins, licensing, provenance, label taxonomy, and anonymization protocols, with a dedicated Egyptian dialect test partition where feasible.',
    computeStrategy:
      'يمكن تدريب النموذج الأساسي بالكامل على وحدة المعالجة المركزية (CPU). بينما قد يتطلب ضبط MARBERTv2 الاستعانة ببيئات مثل Colab / Kaggle أو حواسيب الجامعة المزودة بمعالجات GPU. وسيتم قياس زمن الاستدلال على CPU بدقة قبل إقرار الحاجة الفعلية لمعالج رسومي.',
    computeStrategyEn:
      'The baseline model trains entirely on standard CPU. Fine-tuning MARBERTv2 utilizes university GPU environments or Colab/Kaggle. CPU inference latency is rigorously profiled before mandating dedicated GPU acceleration.',
  },
};

export const technicalStack = [
  {
    component: 'واجهة المستخدم (Frontend)',
    componentEn: 'User Interface (Frontend)',
    choice: 'React + Vite',
    details: 'Tailwind CSS v4؛ واجهة عربية أصيلة بتخطيط RTL كامل؛ استخدام خط Cairo المستضاف محلياً دون ارتباط بخدمات خارجية.',
    detailsEn: 'Tailwind CSS v4; native Arabic RTL/LTR layout; locally hosted Cairo typography independent of external CDN dependencies.',
    role: 'العرض والتفاعل',
    roleEn: 'Presentation & Interaction',
  },
  {
    component: 'الخادم وواجهة البرمجة (Backend / API)',
    componentEn: 'Server & API (Backend)',
    choice: 'Python + FastAPI + Uvicorn',
    details: 'مخططات Pydantic للتحقق الصارم من صحة البيانات؛ تسجيل خالٍ من النصوص الشخصية (content-free logging) واستجابات آمنة للأخطاء.',
    detailsEn: 'Pydantic schemas for strict validation; content-free logging ensuring zero raw text retention; secure error handling.',
    role: 'المعالجة والأمان',
    roleEn: 'Processing & Security',
  },
  {
    component: 'النموذج الأساسي (Baseline Model)',
    componentEn: 'Baseline Model',
    choice: 'scikit-learn: TF-IDF + Logistic Regression',
    details: 'استخراج السمات اللغوية بحساب n-grams للكلمات والمحارف؛ تدريب انحدار لوجستي سريع وقابل للتفسير المباشر كمعيار قياس أولي.',
    detailsEn: 'Feature extraction via word/char n-grams; fast, interpretable Logistic Regression serving as foundational benchmark.',
    role: 'النمذجة الأولية',
    roleEn: 'Baseline Modeling',
  },
  {
    component: 'النموذج المتقدم المرشح (Advanced Candidate)',
    componentEn: 'Advanced Candidate Model',
    choice: 'Hugging Face Transformers + PyTorch: MARBERTv2',
    details: 'نموذج محولات لغوي مدرب على نصوص اللهجات العربية؛ المرشح الرئيسي للمقارنة في حال توفر الموارد والبيانات المناسبة.',
    detailsEn: 'Pre-trained Arabic transformer model optimized for dialectal Arabic; benchmark candidate on locked test sets.',
    role: 'النمذجة المتقدمة',
    roleEn: 'Advanced Modeling',
  },
  {
    component: 'الذكاء الاصطناعي المفسَّر (Explainability - XAI)',
    componentEn: 'Explainable AI (XAI)',
    choice: 'Native Logistic Regression + Span Occlusion',
    details: 'مساهمات معاملات الانحدار اللوجستي للنموذج الأساسي؛ حجب المقاطع (Span Occlusion) للمحولات؛ واستخدام SHAP/LIME للمقارنة الأوفلاين.',
    detailsEn: 'Linear coefficients for baseline; span occlusion for transformers; offline SHAP/LIME validation.',
    role: 'الشفافية اللغوية',
    roleEn: 'Linguistic Transparency',
  },
  {
    component: 'الاختبار وإمكانية إعادة الإنتاج (Testing)',
    componentEn: 'Testing & Reproducibility',
    choice: 'pytest & Vitest + Locked Test Set',
    details: 'بذور عشوائية ثابتة (fixed seeds)؛ سجلات تفصيلية لبيانات النماذج (manifests)؛ ومجموعة اختبار ثابتة ومقفلة لتقييم عادل.',
    detailsEn: 'Fixed random seeds; immutable data manifests; locked test sets guaranteeing reproducible evaluation.',
    role: 'الموثوقية العلمية',
    roleEn: 'Scientific Rigor',
  },
  {
    component: 'النشر وبيئة التشغيل (Deployment)',
    componentEn: 'Deployment & Runtime',
    choice: 'Docker / Docker Compose',
    details: 'حاويات معزولة؛ الأولوية لتشغيل الاستدلال على وحدة المعالجة المركزية (CPU) أولاً وقياس استهلاك الموارد بدقة.',
    detailsEn: 'Isolated containerization; prioritized CPU-based inference profiling prior to GPU requirement sign-off.',
    role: 'البنية التحتية',
    roleEn: 'Infrastructure',
  },
];

export const teamMembers = [
  {
    id: '42141812',
    name: 'لينه مجدي عوض',
    nameEn: 'Lina Magdy Awad',
    role: 'قائدة الفريق ومسؤولة مجموعات البيانات',
    roleEn: 'Team Leader; Data / Dataset Owner',
    skills: 'Python, Data Processing, Dataset Auditing (مهارات مقترحة)',
    skillsEn: 'Python, Data Processing, Dataset Auditing (Target Competencies)',
    ownership: 'قيادة الفريق، تنسيق المواعيد، حوكمة البيانات وتدقيق الجودة والمصادر والتراخيص.',
    ownershipEn: 'Team leadership, scheduling, dataset governance, quality auditing, licensing, and compliance.',
    responsibilities: [
      'تنسيق جهود الفريق وتوزيع المهام وضبط الجداول الزمنية ومواعيد التسليم.',
      'تحديد مجموعات البيانات المرشحة وفحص مصدرها وترخيصها القانوني ومعاني التصنيفات.',
      'تنظيف البيانات وإجراء عمليات إخفاء الهوية والخصوصية (Anonymization).',
      'فحص البيانات لمنع التكرار ومنع تسريب بيانات الاختبار (Leakage Prevention).',
      'إنشاء تقسيمات التدريب والتحقق والاختبار القابلة لإعادة الإنتاج وتأمين مجموعة الاختبار المقفلة.',
      'توثيق بيانات المشروع وحفظ بصمات التحقق الرقمية (Hashes) وسجلات الإصدارات.',
    ],
    responsibilitiesEn: [
      'Coordinate team sprints, track project milestones, and maintain submission deadlines.',
      'Identify candidate datasets, verify origin, intellectual property, and category semantics.',
      'Perform rigorous data cleaning, token sanitization, and privacy anonymization.',
      'Audit datasets to prevent overlap and cross-partition test data leakage.',
      'Establish reproducible train/dev/test splits and seal the locked evaluation set.',
      'Maintain dataset manifests, cryptographic hashes, and versioned audit logs.',
    ],
    status: 'مكتمل ومعتمد',
    statusEn: 'Completed & Approved',
    isLeader: true,
  },
  {
    id: '4241379',
    name: 'محمد أحمد عبد الواحد',
    nameEn: 'Mohamed Ahmed Abdelwahed',
    role: 'مطور واجهات المستخدم',
    roleEn: 'Frontend Developer',
    skills: 'HTML, CSS, JavaScript, React (مهارات مقترحة)',
    skillsEn: 'HTML, CSS, JavaScript, React (Target Competencies)',
    ownership: 'بناء الواجهة الأساسية، تدفق الإدخال العربي، ربط عقد الـ API، وضمان ظهور إشعارات الأمان.',
    ownershipEn: 'Frontend foundation, Arabic text input flow, API contract integration, and safety notice persistence.',
    responsibilities: [
      'بناء وتطوير واجهة الويب التفاعلية باستخدام React و Vite وتنسيقات Tailwind CSS.',
      'تطبيق نظام التخطيط العربي من اليمين لليسار (RTL) وتدفق إدخال النصوص للمستخدم.',
      'ربط واجهة المستخدم بعقد واجهة البرمجة (API contract) المعتمد بين الفريقين.',
      'عرض مخرجات التقييم التوعوي ومحتوى الدعم النفسي المتخصص المراجع بعناية.',
      'ضمان بقاء رسالة التحذير التوعوية ورابط الدعم ظاهرين للمستخدم حتى عند تعطل الـ API.',
    ],
    responsibilitiesEn: [
      'Build interactive web interface using React, Vite, and modern Tailwind CSS.',
      'Implement native Arabic RTL/LTR layout systems and responsive text entry flows.',
      'Integrate frontend state with the agreed Pydantic-backed API contract.',
      'Render non-diagnostic indicator views and curated human support hotline components.',
      'Ensure safety disclaimers and crisis hotlines remain visible even during API downtime.',
    ],
    status: 'مكتمل ومعتمد',
    statusEn: 'Completed & Approved',
    isLeader: false,
  },
  {
    id: '4241598',
    name: 'إيمان المتولي إبراهيم',
    nameEn: 'Eman Elmetwaly Ibrahim',
    role: 'مطورة واجهات المستخدم واختبار الواجهات',
    roleEn: 'Frontend Developer & UI Testing',
    skills: 'React Components, CSS/Tailwind, UI Testing (مهارات مقترحة)',
    skillsEn: 'React Components, CSS/Tailwind, UI Testing (Target Competencies)',
    ownership: 'تطوير مكونات الواجهة المتاحة، حالات النتائج والتحميل والخطأ، ودمج شاشات التفسير (XAI).',
    ownershipEn: 'Accessible UI component system, loading/error states, and XAI explainability visualization.',
    responsibilities: [
      'تطوير مكتبة مكونات الواجهة المعيارية القابلة لإعادة الاستخدام.',
      'تطبيق حالات النتائج المتوافقة مع معايير الوصول (Accessibility)، وحالات التحميل ومعالجة الأخطاء.',
      'دمج شاشات عرض التفسير اللغوي (XAI) ومفاتيح المحتوى التوضيحية.',
      'اختبار الواجهة عملياً ضد استجابات API وهمية (Mock Responses) والتأكد من تجربة الاستخدام.',
      'تنسيق التكامل السلس بين مكونات الواجهة والتصاميم المعتمدة في النظام.',
    ],
    responsibilitiesEn: [
      'Develop modular, reusable design system components compliant with WCAG AA.',
      'Implement loading skeletons, resilient error boundaries, and empty states.',
      'Integrate linguistic explainability (XAI) token-attribution highlight views.',
      'Perform comprehensive integration tests against mock API payloads.',
      'Ensure visual harmony across responsive breakpoints and dark/light palettes.',
    ],
    status: 'مكتمل ومعتمد',
    statusEn: 'Completed & Approved',
    isLeader: false,
  },
  {
    id: '4241404',
    name: 'منة عبد العزيز مصطفى',
    nameEn: 'Menna Abdelaziz Mostafa',
    role: 'مطورة الخدمات الخلفية وواجهات البرمجة',
    roleEn: 'Backend Developer',
    skills: 'Python, FastAPI, Pydantic, API Testing (مهارات مقترحة)',
    skillsEn: 'Python, FastAPI, Pydantic, API Testing (Target Competencies)',
    ownership: 'بناء واجهة FastAPI، التحقق من المدخلات، سياسة التوجيه الحتمية، وحماية خصوصية النصوص.',
    ownershipEn: 'FastAPI service architecture, input validation, deterministic routing, and zero-storage privacy.',
    responsibilities: [
      'بناء نقاط النهاية للواجهة البرمجية (FastAPI endpoints) ومخططات الطلب والاستجابة عبر Pydantic.',
      'تطبيق التحقق الصارم من المدخلات، وتنسيق تدفق المعالجة وسياسة التوجيه التوعوي الحتمية.',
      'ضمان عدم قيام رسائل الأخطاء بإعادة طباعة نصوص المستخدم، وتفعيل التسجيل الخالي من النصوص.',
      'منع تخزين أو تسجيل نصوص المستخدمين الخام في قواعد البيانات أو السجلات نهائياً.',
      'دمج نماذج الذكاء الاصطناعي عبر واجهة برمجية مستقرة وصيانة اختبارات الـ API الشاملة.',
    ],
    responsibilitiesEn: [
      'Architect robust FastAPI endpoints with strict Pydantic request/response schemas.',
      'Implement defensive validation boundaries, text bounds, and deterministic guidance routing.',
      'Enforce content-free logging to ensure zero raw user input leaks into server logs.',
      'Strictly prohibit persisting raw texts or personal identifiers to persistent storage.',
      'Maintain automated integration test suites for all API contracts and health probes.',
    ],
    status: 'مكتمل ومعتمد',
    statusEn: 'Completed & Approved',
    isLeader: false,
  },
  {
    id: '4241286',
    name: 'عبد الرحمن عمرو بهي الدين',
    nameEn: 'Abdelrahman Amr Bahy Eldin',
    role: 'مطور نماذج الذكاء الاصطناعي والتقييم',
    roleEn: 'AI / Model Developer',
    skills: 'Python, scikit-learn, PyTorch, NLP Model Evaluation (مهارات مقترحة)',
    skillsEn: 'Python, scikit-learn, PyTorch, NLP Model Evaluation (Target Competencies)',
    ownership: 'تطوير النموذج الأساسي، ضبط نموذج MARBERTv2، تقييم النماذج والمعايرة، واستخلاص التفسيرات.',
    ownershipEn: 'Baseline model implementation, MARBERTv2 fine-tuning, statistical calibration, and XAI spans.',
    responsibilities: [
      'تطوير وبرمجة النموذج الأساسي (TF-IDF مع Logistic Regression) كمعيار قياس أولي.',
      'استكشاف وضبط النموذج المتقدم MARBERTv2 بالاعتماد على PyTorch ومكتبة Transformers.',
      'تقييم أداء النماذج باستخدام المقاييس المعتمدة (F1-score, Precision, Recall) وإجراء المعايرة الإحصائية.',
      'تطبيق خطوات المعالجة المسبقة للنصوص العربية الخاصة بكل نموذج وتجهيز خوارزميات التفسير.',
      'تغليف ملفات النماذج مع البيانات الوصفية الخاصة بالإصدارات وتوثيق نتائج التقييم بدقة.',
    ],
    responsibilitiesEn: [
      'Develop baseline pipeline (TF-IDF + Logistic Regression) as empirical benchmark.',
      'Fine-tune candidate Arabic transformer (MARBERTv2) using PyTorch and Hugging Face.',
      'Evaluate model performance using F1-score, Precision, Recall, and Platt calibration.',
      'Implement Arabic text preprocessing, Egyptian dialect handling, and word-span attribution.',
      'Package versioned model weights with cryptographic verification manifests and test metrics.',
    ],
    status: 'مكتمل ومعتمد',
    statusEn: 'Completed & Approved',
    isLeader: false,
  },
  {
    id: 'قيد التحديد والتأكيد',
    idEn: 'Pending Allocation',
    name: 'العضو السادس — قيد التحديد',
    nameEn: 'Sixth Team Member – Role To Be Assigned',
    role: 'مسؤول ضمان الجودة واختبار التكامل والتحقق من السلامة',
    roleEn: 'Evaluation / QA, Integration Testing & Safety Verification',
    skills: 'تُستكمل من قبل الفريق بالاتفاق مع المشرف الأكاديمي',
    skillsEn: 'To be completed by team in consultation with academic supervisor',
    ownership: 'تقييم الجودة الشامل، اختبارات التكامل، توثيق متطلبات السلامة، ومراجعة سياسات المحتوى.',
    ownershipEn: 'End-to-end quality assurance, integration testing, safety protocol audits, and content review.',
    responsibilities: [
      'استكمال الاسم الكامل باللغة الإنجليزية والرقم الجامعي وفق المتطلبات الأكاديمية للمقرر.',
      'التركيز على تقييم جودة النظام (QA) وإجراء اختبارات التكامل الشاملة بين الواجهة والخدمات الخلفية.',
      'التوثيق الأكاديمي والتحقق من استيفاء متطلبات السلامة والسياسات الأخلاقية للنظام.',
      'مراجعة صياغة المحتوى التوعوي والتأكد من مطابقتها لتوجيهات المشرف الأكاديمي.',
    ],
    responsibilitiesEn: [
      'Finalize academic registration details in accordance with course directives.',
      'Lead end-to-end system quality assurance (QA) and frontend/backend integration testing.',
      'Conduct rigorous academic audits of ethical safeguards, uncertainty handling, and disclaimers.',
      'Review awareness copy accuracy alongside faculty supervisor guidance.',
    ],
    status: 'قيد التعيين والاستكمال الأكاديمي',
    statusEn: 'Pending Assignment',
    isLeader: false,
    isPlaceholder: true,
  },
];

export const developmentPhases = [
  {
    phase: '01',
    phaseEn: 'Phase 1',
    title: 'تحديد المهمة وأطر العمل',
    titleEn: 'Define the Task & Governance',
    description:
      'الاتفاق على المعنى الدقيق للتصنيفات، تحديد نطاق اللغة المدعومة وحدودها، صياغة سياسة الأمان والسلامة، وتحديد عقد واجهة البرمجة (API Contract) الموحد بين الواجهة والخدمات الخلفية.',
    descriptionEn:
      'Agree on unambiguous label semantics, establish supported language boundaries, formulate safety policies, and define the unified Pydantic API contract.',
    tasks: ['عقد الـ API الموثق', 'تعريف التصنيفات اللغوية', 'سياسة الأمان الصارمة'],
    tasksEn: ['Documented API Contract', 'Taxonomy & Label Definitions', 'Strict Safety Charter'],
    deliverable: 'عقد الـ API الموثق وميثاق السلامة المعتمد',
    deliverableEn: 'Documented API Contract & Approved Safety Charter',
  },
  {
    phase: '02',
    phaseEn: 'Phase 2',
    title: 'تدقيق وتجهيز البيانات',
    titleEn: 'Audit & Prepare Datasets',
    description:
      'التحقق من التراخيص القانونية وجودة التصنيفات، إخفاء هوية النصوص لحماية الخصوصية، إزالة التكرارات، إنشاء تقسيمات آمنة تمنع تسرب البيانات (Data Leakage)، وقفل مجموعة الاختبار الثابتة.',
    descriptionEn:
      'Verify legal licenses, sanitize personal identifiers, eliminate duplicates, build leak-free partitions, and securely lock the benchmark test set.',
    tasks: ['بيانات مدققة ومجهولة المصدر', 'مجموعة اختبار مقفلة', 'سجل توثيق البيانات وتراخيصها'],
    tasksEn: ['Anonymized & Audited Corpus', 'Locked Test Partition', 'Data License Audit Log'],
    deliverable: 'مجموعة بيانات مدققة ومجموعة اختبار مقفلة',
    deliverableEn: 'Audited Dataset & Locked Evaluation Set',
  },
  {
    phase: '03',
    phaseEn: 'Phase 3',
    title: 'التطوير المتوازي',
    titleEn: 'Parallel Implementation',
    description:
      'بناء الواجهة ضد عقد واجهة برمجة وهمي (Mock API)، إنشاء هيكل الخدمات الخلفية في FastAPI، بناء خط معالجة النصوص وتطبيع العامية المصرية، وتدريب النموذج الأساسي.',
    descriptionEn:
      'Build React UI against mock API contracts, construct FastAPI backend skeletons, implement Arabic text normalizers, and train baseline TF-IDF model.',
    tasks: ['واجهة تفاعلية بـ React/Vite', 'هيكل FastAPI مع Pydantic', 'النموذج الأساسي TF-IDF + Logistic Regression'],
    tasksEn: ['Interactive React/Vite UI', 'FastAPI Service Architecture', 'Baseline TF-IDF + Logistic Regression Model'],
    deliverable: 'واجهة متكاملة ونموذج أساسي قيد التشغيل',
    deliverableEn: 'Interactive UI Prototype & Working Baseline Model',
  },
  {
    phase: '04',
    phaseEn: 'Phase 4',
    title: 'التكامل الشامل للنموذج الأساسي',
    titleEn: 'End-to-End Baseline Integration',
    description:
      'ربط منظومة التحقق من المدخلات بالتنبؤ وسياسة التوجيه الحتمية وعرض المحتوى المراجع في واجهة المستخدم، وإجراء الاختبارات التلقائية الشاملة للتأكد من تدفق البيانات السليم.',
    descriptionEn:
      'Connect frontend text submission with backend inference, deterministic guidance routing, and automated test suites to ensure reliable data flow.',
    tasks: ['تدفق عمل كامل ومترابط', 'ربط الواجهة بالنموذج الأساسي', 'حزمة اختبارات آلية'],
    tasksEn: ['End-to-End Pipeline', 'Live Model Integration', 'Automated Test Suite'],
    deliverable: 'منظومة تفاعلية متصلة تعمل بنجاح',
    deliverableEn: 'Connected & Verified End-to-End System',
  },
  {
    phase: '05',
    phaseEn: 'Phase 5',
    title: 'مقارنة وتقييم النموذج المتقدم',
    titleEn: 'Advanced Candidate Evaluation',
    description:
      'تدريب وتقييم نموذج MARBERTv2 ومقارنته بالنموذج الأساسي على نفس مجموعة الاختبار المقفلة بدقة، مع تقرير المعايرة الإحصائية والنتائج عبر الفئات اللغوية الفرعية.',
    descriptionEn:
      'Fine-tune MARBERTv2 and rigorously compare metrics against baseline on the identical locked test partition, compiling calibration reports.',
    tasks: ['تقييم مقارن على نفس الاختبار', 'تقارير المعايرة الإحصائية', 'تحليل فئات اللهجة المصرية'],
    tasksEn: ['Comparative Evaluation on Locked Set', 'Probability Calibration Reports', 'Dialectal Breakdown Analysis'],
    deliverable: 'تقرير تقييمي مقارن وموثق علمياً',
    deliverableEn: 'Rigorous Model Comparison & Calibration Report',
  },
  {
    phase: '06',
    phaseEn: 'Phase 6',
    title: 'المراجعة والعرض النهائي',
    titleEn: 'Review, Hardening & Academic Showcase',
    description:
      'اختبار حالات الفشل اللغوية، التحقق من سلوك الخصوصية وعدم تسجيل البيانات، تدقيق صياغة الردود ودقة التوجيه، وقياس سرعة الأداء مع ضمان استمرار ظهور موارد الدعم في كل الحالات.',
    descriptionEn:
      'Perform adversarial stress testing, verify zero-storage privacy guarantees, audit wording clarity, and profile latency for academic showcase.',
    tasks: ['تقرير اختبار حالات الفشل', 'التحقق الصارم من الخصوصية', 'نموذج أولي جاهز للعرض الأكاديمي'],
    tasksEn: ['Failure Mode Analysis Report', 'Zero-Storage Privacy Audit', 'Showcase-Ready Academic Prototype'],
    deliverable: 'نموذج أولي متكامل جاهز للمناقشة الأكاديمية',
    deliverableEn: 'Polished Prototype Ready for Academic Evaluation',
  },
];

export const safetyPrinciples = [
  {
    id: 'non-diagnostic',
    title: 'نظام توعوي تعليمي وليس جهازاً طبياً',
    titleEn: 'Educational Awareness System, Not a Medical Diagnostic Tool',
    description:
      'مشروع «سَـــلام» نموذج أولي استرشادي للتوعية النفسية. ليس مصنفاً كأداة طبية ولا يقدم تشخيصاً لأي اضطراب نفسي، ولا يحل بأي حال من الأحوال محل الاستشارة السريرية المعتمدة.',
    descriptionEn:
      'SALAM is an educational and academic awareness prototype. It is not a certified medical device, does not diagnose any disorder, and never replaces accredited clinical consultation.',
    rule:
      'مشروع «سَـــلام» نموذج أولي استرشادي للتوعية النفسية. ليس مصنفاً كأداة طبية ولا يقدم تشخيصاً لأي اضطراب نفسي، ولا يحل بأي حال من الأحوال محل الاستشارة السريرية المعتمدة.',
    ruleEn:
      'SALAM is an educational and academic awareness prototype. It is not a certified medical device, does not diagnose any disorder, and never replaces accredited clinical consultation.',
    badge: 'توعوي غير طبي',
    badgeEn: 'Educational Non-Clinical',
  },
  {
    id: 'uncertainty-handling',
    title: 'التعامل الصريح مع عدم اليقين وحدود اللغة',
    titleEn: 'Explicit Handling of Uncertainty & Linguistic Limitations',
    description:
      'قد يخطئ النموذج في تفسير اللهجات غير القياسية، أو السخرية، أو النفي المركب، أو النصوص المقتضبة؛ لذلك يجب تمثيل عدم اليقين بوضوح عبر حزام ثقة مدروس وعدم إطلاق أحكام جازمة.',
    descriptionEn:
      'Models may misinterpret non-standard dialects, irony, complex negation, or brief fragments. Uncertainty must be communicated transparently through calibrated confidence bands without definitive assertions.',
    rule:
      'قد يخطئ النموذج في تفسير اللهجات غير القياسية، أو السخرية، أو النفي المركب، أو النصوص المقتضبة؛ لذلك يجب تمثيل عدم اليقين بوضوح عبر حزام ثقة مدروس وعدم إطلاق أحكام جازمة.',
    ruleEn:
      'Models may misinterpret non-standard dialects, irony, complex negation, or brief fragments. Uncertainty must be communicated transparently through calibrated confidence bands without definitive assertions.',
    badge: 'حزام عدم اليقين',
    badgeEn: 'Calibrated Uncertainty',
  },
  {
    id: 'no-safe-guarantee',
    title: 'منع الجزم بالأمان المطلق',
    titleEn: 'Prohibition of Absolute Safety Guarantees',
    description:
      'يُمنع صراحة وسم أي مخرج للمستخدم بأنه "آمن تماماً" أو تقديم احتمالات غير معايرة كدرجة ثقة قطعية، لأن ذلك قد يخلق شعوراً زائفاً بالطمأنينة قد يعيق طلب المساعدة عند الحاجة.',
    descriptionEn:
      'It is strictly prohibited to declare any user output as definitively "safe" or present uncalibrated probabilities as certainty, avoiding false reassurance that could deter seeking help.',
    rule:
      'يُمنع صراحة وسم أي مخرج للمستخدم بأنه "آمن تماماً" أو تقديم احتمالات غير معايرة كدرجة ثقة قطعية، لأن ذلك قد يخلق شعوراً زائفاً بالطمأنينة قد يعيق طلب المساعدة عند الحاجة.',
    ruleEn:
      'It is strictly prohibited to declare any user output as definitively "safe" or present uncalibrated probabilities as certainty, avoiding false reassurance that could deter seeking help.',
    badge: 'حظر الجزم بالسلامة',
    badgeEn: 'No False Reassurance',
  },
  {
    id: 'zero-storage',
    title: 'حظر تخزين النصوص الخام في الذاكرة الدائمة',
    titleEn: 'Zero-Storage Policy for Raw User Text',
    description:
      'تتم معالجة نصوص المستخدم حصرياً في الذاكرة المؤقتة للطلب (In-Memory Request). لا يتم حفظ النصوص في قواعد بيانات، ولا في ملفات السجلات، ولا في التخزين المؤقت، ولا أنظمة التحليل.',
    descriptionEn:
      'User texts are processed exclusively in volatile request memory. No raw user text is saved in databases, server logs, browser caches, or third-party analytics services.',
    rule:
      'تتم معالجة نصوص المستخدم حصرياً في الذاكرة المؤقتة للطلب (In-Memory Request). لا يتم حفظ النصوص في قواعد بيانات، ولا في ملفات السجلات، ولا في التخزين المؤقت، ولا أنظمة التحليل.',
    ruleEn:
      'User texts are processed exclusively in volatile request memory. No raw user text is saved in databases, server logs, browser caches, or third-party analytics services.',
    badge: 'خصوصية مطلقة',
    badgeEn: 'Zero-Retention Privacy',
  },
  {
    id: 'always-visible-support',
    title: 'ظهور دائم لروابط ومصادر الدعم المتخصص',
    titleEn: 'Permanently Visible Accredited Support Hotlines',
    description:
      'يجب أن تظل معلومات الوصول للدعم الإنساني وسياسة الأزمات ظاهرة دائماً في الواجهة، ولا يُترك التعامل مع حالات الأزمات للنموذج الآلي بمفرده في أي سيناريو.',
    descriptionEn:
      'Human support contact information and crisis resources must remain permanently accessible across the interface, ensuring crisis situations are never delegated to automated models.',
    rule:
      'يجب أن تظل معلومات الوصول للدعم الإنساني وسياسة الأزمات ظاهرة دائماً في الواجهة، ولا يُترك التعامل مع حالات الأزمات للنموذج الآلي بمفرده في أي سيناريو.',
    ruleEn:
      'Human support contact information and crisis resources must remain permanently accessible across the interface, ensuring crisis situations are never delegated to automated models.',
    badge: 'دعم دائم ومستمر',
    badgeEn: 'Evergreen Support Access',
  },
  {
    id: 'academic-governance',
    title: 'الحوكمة الأكاديمية والتدقيق الأخلاقي المستمر',
    titleEn: 'Academic Governance & Continuous Ethical Auditing',
    description:
      'التحقق المسبق من تراخيص مجموعات البيانات والنماذج وسياسات الاستضافة، مع خضوع صياغات السلامة ومحتوى الدعم للمراجعة والاعتماد من قبل المشرف الأكاديمي.',
    descriptionEn:
      'Prior verification of dataset and model licensing, hosting policies, and mandatory supervision by the academic faculty advisor before any experimental deployment.',
    rule:
      'التحقق المسبق من تراخيص مجموعات البيانات والنماذج وسياسات الاستضافة، مع خضوع صياغات السلامة ومحتوى الدعم للمراجعة والاعتماد من قبل المشرف الأكاديمي.',
    ruleEn:
      'Prior verification of dataset and model licensing, hosting policies, and mandatory supervision by the academic faculty advisor before any experimental deployment.',
    badge: 'مراجعة أكاديمية معتمدة',
    badgeEn: 'Faculty Supervised',
  },
];

export const academicReferences = [
  {
    title: 'SALAM Architecture Review',
    titleEn: 'SALAM Architecture Review',
    description: 'مراجعة نقدية معمارية مستقلة لتقرير البنية البرمجية لنظام «سَـــلام» — مقرر AI317.',
    descriptionEn: 'Independent architectural peer review of the SALAM software engineering report — Course AI317.',
    category: 'وثائق المشروع المعتمدة',
    categoryEn: 'Approved Project Documents',
    type: 'Internal Document',
  },
  {
    title: 'SALAM Technology Stack',
    titleEn: 'SALAM Technology Stack',
    description: 'تحليل مكونات الإصدار الثاني ومطابقتها مع التقنيات والمفاضلات وأولويات الإصدار الأول — مقرر AI317.',
    descriptionEn: 'Analysis of v2 technical components, architectural trade-offs, and v1 delivery priorities — Course AI317.',
    category: 'وثائق المشروع المعتمدة',
    categoryEn: 'Approved Project Documents',
    type: 'Internal Document',
  },
  {
    title: 'scikit-learn Documentation',
    titleEn: 'scikit-learn Documentation',
    description: 'التوثيق الرسمي لتقنيات استخراج السمات اللغوية (TF-IDF)، نماذج الانحدار اللوجستي، وتقنيات المعايرة الإحصائية.',
    descriptionEn: 'Official documentation for TF-IDF feature extraction, Logistic Regression classifiers, and probability calibration.',
    url: 'https://scikit-learn.org/',
    category: 'أدوات التعلم الآلي والنمذجة',
    categoryEn: 'ML & Modeling Frameworks',
    type: 'Documentation',
  },
  {
    title: 'Hugging Face Transformers Documentation',
    titleEn: 'Hugging Face Transformers Documentation',
    description: 'التوثيق الرسمي لنماذج المحولات اللغوية العربية ونموذج MARBERTv2 واستدلال النماذج العميقة.',
    descriptionEn: 'Official documentation for Arabic transformer pipelines, MARBERTv2 fine-tuning, and model inference.',
    url: 'https://huggingface.co/docs/transformers/',
    category: 'أدوات التعلم الآلي والنمذجة',
    categoryEn: 'ML & Modeling Frameworks',
    type: 'Documentation',
  },
  {
    title: 'PyTorch Documentation',
    titleEn: 'PyTorch Documentation',
    description: 'التوثيق الرسمي لإطار التعلم العميق وتدريب النماذج.',
    descriptionEn: 'Official documentation for deep learning tensors, training loops, and gradient optimization.',
    url: 'https://pytorch.org/docs/',
    category: 'أطر الحوسبة والتعلم العميق',
    categoryEn: 'Deep Learning Runtimes',
    type: 'Documentation',
  },
  {
    title: 'FastAPI & Pydantic Documentation',
    titleEn: 'FastAPI & Pydantic Documentation',
    description: 'التوثيق الرسمي لبناء خدمات الويب السريعة والتحقق الصارم من مخططات البيانات.',
    descriptionEn: 'Official documentation for modern asynchronous Python web APIs and strict schema data validation.',
    url: 'https://fastapi.tiangolo.com/',
    category: 'الخدمات الخلفية والواجهات البرمجية',
    categoryEn: 'Backend Services & APIs',
    type: 'Documentation',
  },
  {
    title: 'React & Vite Documentation',
    titleEn: 'React & Vite Documentation',
    description: 'التوثيق الرسمي لبناء واجهات الويب الحديثة وحزم التطوير السريعة.',
    descriptionEn: 'Official documentation for modern frontend UI architecture and optimized production bundling.',
    url: 'https://react.dev/',
    category: 'واجهات المستخدم والويب',
    categoryEn: 'Frontend & UI Frameworks',
    type: 'Documentation',
  },
  {
    title: 'Kaggle Datasets & Papers with Code',
    titleEn: 'Kaggle Datasets & Papers with Code',
    description: 'منصات استكشاف مجموعات البيانات والأوراق البحثية المرجعية المعتمدة للأبحاث اللغوية ونماذج المعالجة.',
    descriptionEn: 'Platforms for identifying benchmark corpora and state-of-the-art Arabic NLP literature.',
    url: 'https://paperswithcode.com/',
    category: 'مصادر البيانات والأبحاث',
    categoryEn: 'Datasets & Research Repositories',
    type: 'Research Catalog',
  },
];
