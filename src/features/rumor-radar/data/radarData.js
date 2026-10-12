/**
 * SALAM — Rumor & Misinformation Radar Data Model
 * Pure structured data for monitoring circulating claims, indicators, and evidence.
 * Follows neutral, evidence-based verification standards.
 * Bilingual: Arabic (ar) & English (en).
 */

export const VERIFICATION_STATUSES = {
  circulating: {
    id: 'circulating',
    label: 'متداول',
    labelEn: 'Circulating',
    badgeVariant: 'info',
    description: 'محتوى متداول بشكل واسع قيد التتبع والرصد الأولي.',
    descriptionEn: 'Widely circulating content undergoing initial monitoring and tracking.',
  },
  needs_verification: {
    id: 'needs_verification',
    label: 'يحتاج إلى تحقق',
    labelEn: 'Needs Verification',
    badgeVariant: 'attention',
    description: 'ادعاء يحتوي على نقاط غير محسومة وبحاجة لمصادر مستقلة.',
    descriptionEn: 'Claim contains unconfirmed details and requires independent sources.',
  },
  unverified: {
    id: 'unverified',
    label: 'غير موثّق',
    labelEn: 'Unverified',
    badgeVariant: 'default',
    description: 'ادعاء يفتقر إلى مصادر أولية أو أدلة قابلة للتحقق.',
    descriptionEn: 'Claim lacks primary sources or verifiable empirical evidence.',
  },
  potentially_misleading: {
    id: 'potentially_misleading',
    label: 'مضلل محتمل',
    labelEn: 'Potentially Misleading',
    badgeVariant: 'elevated',
    description: 'يتضمن تأطيراً مقتطعاً من السياق أو صياغة تثير استنتاجات خاطئة.',
    descriptionEn: 'Contains decontextualized framing or phrasing that induces erroneous conclusions.',
  },
  partially_inaccurate: {
    id: 'partially_inaccurate',
    label: 'يحتوي على معلومات غير دقيقة',
    labelEn: 'Partially Inaccurate',
    badgeVariant: 'elevated',
    description: 'يجمع بين وقائع صحيحة وبيانات أو أرقام غير دقيقة.',
    descriptionEn: 'Combines factual elements with imprecise data or unverified claims.',
  },
  verified: {
    id: 'verified',
    label: 'تم التحقق منه',
    labelEn: 'Verified',
    badgeVariant: 'safe',
    description: 'تم توثيق الوقائع بمصادر رسمية وموثوقة متعددة.',
    descriptionEn: 'Facts documented through multiple official and accredited sources.',
  },
};

export const COMMON_DETECTION_INDICATORS = [
  {
    id: 'lack_of_sources',
    label: 'نقص المصادر المعتمدة',
    labelEn: 'Lack of verified sources',
  },
  {
    id: 'conflicting_sources',
    label: 'تضارب بين المصادر المتداولة',
    labelEn: 'Conflicting accounts across circulating reports',
  },
  {
    id: 'sensational_wording',
    label: 'صياغة مثيرة أو مبالغ فيها',
    labelEn: 'Sensational or exaggerated phrasing',
  },
  {
    id: 'hard_to_verify',
    label: 'معلومات يصعب التحقق منها ميدانياً',
    labelEn: 'Difficult to verify empirically',
  },
  {
    id: 'unclear_origin',
    label: 'مصدر النشر الأساسي غير واضح',
    labelEn: 'Primary publishing origin unclear',
  },
  {
    id: 'recycled_claim',
    label: 'ادعاء قديم يُعاد تداوله في سياق حديث',
    labelEn: 'Recycled historical claim surfaced in modern context',
  },
  {
    id: 'out_of_context',
    label: 'محتوى حقيقي لكنه مقتطع من سياقه الأصلي',
    labelEn: 'Factual content removed from its original context',
  },
];

/**
 * Baseline Monitored Claims Dataset
 * Representing circulating topics under continuous tracking.
 * Neutral, transparent, and non-sensational.
 */
export const initialMonitoredClaims = [
  {
    id: 'claim-101',
    title: 'تداول منشورات تزعم اكتشاف أدوية عشبية جديدة تعالج الاكتئاب نهائياً خلال 3 أيام',
    titleEn: 'Circulating posts claim a new herbal formulation permanently cures depression in 3 days',
    claimText: 'منشورات عبر منصات التواصل تزعم توفر مستحضر عشبي محلي الصنع يشفي الاكتئاب السريري تماماً خلال ثلاثة أيام دون الحاجة لأي متابعة طبية.',
    claimTextEn: 'Social media posts claim an artisanal herbal remedy permanently cures clinical depression in 3 days without medical follow-up.',
    status: 'potentially_misleading',
    confidenceScore: 'متوسط (مرتبط بنمط الصياغة ومحتوى المصادر)',
    confidenceScoreEn: 'Moderate (derived from promotional wording & source evaluation)',
    sourceOrigin: 'منصات التواصل الاجتماعي (حسابات غير طبية)',
    sourceOriginEn: 'Social Media Platforms (Non-clinical accounts)',
    publishedAt: 'منذ ساعتين',
    publishedAtEn: '2 hours ago',
    updatedAt: 'اليوم، 04:30 م',
    updatedAtEn: 'Today, 04:30 PM',
    summary: 'الادعاء يروج لعلاج نهائي لمرض نفسي معقد دون أي دراسات سريرية معتمدة، ويستخدم صياغات إعلانية مضللة قد تضر بسلامة المرضى.',
    summaryEn: 'The claim promotes a permanent cure for a multifaceted condition without certified clinical trials, using misleading marketing language that may jeopardize patient safety.',
    indicators: [
      'صياغة مثيرة أو مبالغ فيها',
      'نقص المصادر المعتمدة',
      'معلومات يصعب التحقق منها ميدانياً',
    ],
    indicatorsEn: [
      'Sensational or exaggerated phrasing',
      'Lack of verified sources',
      'Difficult to verify empirically',
    ],
    explanation: 'تعتمد الخوارزمية في رصد هذا المحتوى على رصد تعبيرات الجزم المطلق بالعلاج السريع («شفاء نهائي»، «خلال 3 أيام») وغياب أي اعتماد من الهيئات الصحية الرسمية كوزارة الصحة أو منظمة الصحة العالمية.',
    explanationEn: 'The radar flags absolute claims of instantaneous cure ("permanent cure", "within 3 days") combined with the absence of authorization from health authorities like the Egyptian Drug Authority or WHO.',
    evidence: [
      {
        title: 'بروتوكولات علاج الاضطرابات النفسية المعتمدة',
        titleEn: 'Approved Clinical Practice Guidelines for Mood Disorders',
        description: 'الاضطرابات المزاجية والاكتئاب تتطلب تقييماً سريرياً دقيقاً وخططاً علاجية متعددة الجوانب بإشراف أطباء معتمدين.',
        descriptionEn: 'Mood disorders require rigorous clinical evaluation and multifaceted therapeutic plans managed by licensed practitioners.',
        type: 'بروتوكول علمي',
        typeEn: 'Scientific Clinical Guideline',
      },
    ],
    sources: [
      {
        name: 'منظمة الصحة العالمية (WHO)',
        nameEn: 'World Health Organization (WHO)',
        type: 'هيئة صحية دولية',
        typeEn: 'International Health Agency',
        status: 'مصدر متعارض مع الادعاء',
        statusEn: 'Conflicting with Claim',
        relevance: 'تحدد دلائل علاج الاكتئاب المعتمدة وتنفي وجود علاجات فورية.',
        relevanceEn: 'Specifies certified therapeutic protocols and denies instantaneous remedies.',
      },
      {
        name: 'الهيئة المصرية للدواء (EDA)',
        nameEn: 'Egyptian Drug Authority (EDA)',
        type: 'جهة تنظيمية حكومية',
        typeEn: 'National Regulatory Body',
        status: 'مصدر متعارض مع الادعاء',
        statusEn: 'Conflicting with Claim',
        relevance: 'لم ترخص أي مستحضرات عشبية تدعي الشفاء الفوري من الاضطرابات النفسية.',
        relevanceEn: 'Has not licensed any herbal preparations claiming rapid remission of mental health conditions.',
      },
    ],
  },
  {
    id: 'claim-102',
    title: 'أنباء متداولة عن ربط منصات الذكاء الاصطناعي العامة ببيانات السجلات الطبية النفسية للمستخدمين دون علمهم',
    titleEn: 'Rumors allege public AI platforms share user psychological chat logs with employers and insurers',
    claimText: 'تداول تقارير على وسائل التواصل تفيد بأن محادثات روبوتات الدردشة العامة يتم إرسالها لجهات العمل وشركات التأمين الصحي.',
    claimTextEn: 'Reports circulate claiming consumer AI chatbot dialogues are routed to employers and health insurers without user consent.',
    status: 'needs_verification',
    confidenceScore: 'أولي (قيد فحص التراخيص والسياسات)',
    confidenceScoreEn: 'Preliminary (under regulatory and policy review)',
    sourceOrigin: 'مجموعات نقاش تقنية وحسابات عامة',
    sourceOriginEn: 'Tech discussion groups and public accounts',
    publishedAt: 'منذ 5 ساعات',
    publishedAtEn: '5 hours ago',
    updatedAt: 'اليوم، 01:15 م',
    updatedAtEn: 'Today, 01:15 PM',
    summary: 'الادعاء يخلط بين سياسات تدريب النماذج على البيانات العامة وبين مشاركة السجلات الطبية المباشرة مع جهات العمل.',
    summaryEn: 'The claim conflates model training policies using anonymized inputs with sharing identified medical dossiers directly with corporate employers.',
    indicators: [
      'تضارب بين المصادر المتداولة',
      'محتوى حقيقي لكنه مقتطع من سياقه الأصلي',
      'مصدر النشر الأساسي غير واضح',
    ],
    indicatorsEn: [
      'Conflicting accounts across circulating reports',
      'Factual content removed from its original context',
      'Primary publishing origin unclear',
    ],
    explanation: 'أظهر الفحص الأولي أن سياسات الخصوصية لدى كبرى الشركات تشير إلى استخدام البيانات المجهولة المصدر لأغراض التدريب، بينما تمنع القوانين الدولية (مثل HIPAA وGDPR) مشاركة البيانات الصحية التعريفية مع جهات العمل.',
    explanationEn: 'Review indicates major AI providers use de-identified user prompts for opt-out training, while international frameworks (HIPAA, GDPR) strictly forbid sharing protected health information with employers.',
    evidence: [
      {
        title: 'سياسات حماية البيانات الصحية في الاتحاد الأوروبي وأمريكا',
        titleEn: 'Health Data Protection Regulations (GDPR & HIPAA)',
        description: 'تخضع بيانات الصحة النفسية لقيود حماية صارمة تمنع ربطها بالهويات المدنية خارج النطاق الطبي المصرح به.',
        descriptionEn: 'Psychological health records are subject to strict safeguards prohibiting transfer to commercial third parties without patient authorization.',
        type: 'أطر تنظيمية وقانونية',
        typeEn: 'Regulatory Legal Framework',
      },
    ],
    sources: [
      {
        name: 'مركز أبحاث سياسات التكنولوجيا والخصوصية (IAPP)',
        nameEn: 'International Association of Privacy Professionals (IAPP)',
        type: 'مركز أبحاث مستقل',
        typeEn: 'Independent Research Organization',
        status: 'مصدر داعم للتوضيح',
        statusEn: 'Supporting Clarification',
        relevance: 'يوضح الفوارق القانونية بين سجلات المرضى وبيانات المحادثات العفوية.',
        relevanceEn: 'Clarifies legal distinctions between formal patient records and consumer AI logs.',
      },
    ],
  },
  {
    id: 'claim-103',
    title: 'تداول دراسة تزعم أن الامتناع عن استخدام الهاتف لمدة أسبوع يخفض أعراض القلق بنسبة محددة',
    titleEn: 'Reports claim a study found 7-day smartphone abstinence equals complete therapy for anxiety',
    claimText: 'تقرير صحفي واسع الانتشار ينسب لباحثين القول بأن التوقف عن الهاتف الذكي لمدة 7 أيام يعادل تأثيراً علاجياً كاملاً لجلسات الدعم النفسي.',
    claimTextEn: 'A viral news piece cites researchers stating a 7-day smartphone hiatus delivers the exact therapeutic benefits of full psychological counseling.',
    status: 'partially_inaccurate',
    confidenceScore: 'مرتفع (استناداً إلى مقارنة نص الورقة الأصلية)',
    confidenceScoreEn: 'High (grounded in direct comparison with the peer-reviewed paper)',
    sourceOrigin: 'مواقع إخبارية غير متخصصة',
    sourceOriginEn: 'Generalist digital news portals',
    publishedAt: 'منذ يوم واحد',
    publishedAtEn: '1 day ago',
    updatedAt: 'أمس، 08:20 م',
    updatedAtEn: 'Yesterday, 08:20 PM',
    summary: 'الدراسة الأكاديمية الأصلية موجودة بالفعل، لكن التقرير الصحفي بالغ في تعميم النتائج وقارنها بالعلاج السريري بشكل غير دقيق.',
    summaryEn: 'The original academic paper exists, but news coverage overgeneralized subtle subjective wellness gains into equivalent clinical remission.',
    indicators: [
      'صياغة مثيرة أو مبالغ فيها',
      'محتوى حقيقي لكنه مقتطع من سياقه الأصلي',
    ],
    indicatorsEn: [
      'Sensational or exaggerated phrasing',
      'Factual content removed from its original context',
    ],
    explanation: 'أكدت الورقة البحثية وجود تحسن طفيف في جودة النوم والتركيز لدى عينة محددة من الطلاب، لكن الباحثين ذكروا صراحة في ورقتهم أن ذلك لا يعوض بأي حال عن العلاج النفسي للاضطرابات السريرية.',
    explanationEn: 'The study demonstrated modest improvements in sleep latency among college cohorts, with authors explicitly stating that behavioral downtime does not replace clinical therapy.',
    evidence: [
      {
        title: 'نص الدراسة الأكاديمية المنشورة في دورية علم النفس السيبراني',
        titleEn: 'Cyberpsychology Research Journal Published Article',
        description: 'الدراسة بحثت في "العادات الرقمية" ولم تبحث في علاج اضطرابات القلق الحادة.',
        descriptionEn: 'The paper investigated situational screen habits and explicitly excluded diagnosed clinical anxiety disorders.',
        type: 'ورقة بحثية محكمة',
        typeEn: 'Peer-reviewed Journal Paper',
      },
    ],
    sources: [
      {
        name: 'Journal of Cyberpsychology Research',
        nameEn: 'Journal of Cyberpsychology Research',
        type: 'دورية علمية محكمة',
        typeEn: 'Peer-reviewed Academic Journal',
        status: 'مصدر داعم للتحقق',
        statusEn: 'Verification Primary Source',
        relevance: 'تحتوي على النتائج الإحصائية الأصلية وحدود العينة.',
        relevanceEn: 'Hosts original statistical findings and documented limitation clauses.',
      },
    ],
  },
  {
    id: 'claim-104',
    title: 'تخصيص خط ساخن مجاني جديد للدعم النفسي والاستشارات النفسية في مصر على مدار الساعة',
    titleEn: 'Official allocation of free 24/7 mental health counseling hotline in Egypt (16328)',
    claimText: 'رسائل متداولة تفيد بتوفير خط مجاني للطوارئ النفسية يتبع الأمانة العامة للصحة النفسية وعلاج الإدمان لتقديم استشارات فورية مجانية.',
    claimTextEn: 'Circulating messages state a 24/7 toll-free helpline by the General Secretariat of Mental Health provides immediate, accredited psychological counseling.',
    status: 'verified',
    confidenceScore: 'مؤكد (بناءً على بيانات رسمية)',
    confidenceScoreEn: 'Confirmed (validated via official government statements)',
    sourceOrigin: 'الأمانة العامة للصحة النفسية ووزارة الصحة',
    sourceOriginEn: 'General Secretariat of Mental Health & Ministry of Health',
    publishedAt: 'منذ يومين',
    publishedAtEn: '2 days ago',
    updatedAt: 'منذ يومين',
    updatedAtEn: '2 days ago',
    summary: 'تم التحقق من صحة الرقم والخدمة؛ حيث توفر وزارة الصحة المصرية بالفعل الخط الساخن (16328) لتقديم الاستشارات النفسية المجانية على مدار الساعة.',
    summaryEn: 'The number and service have been confirmed; the Egyptian Ministry of Health actively operates hotline 16328 offering free 24/7 psychological support.',
    indicators: [],
    indicatorsEn: [],
    explanation: 'تطابقت الرسالة المتداولة مع البيانات الرسمية المعلنة من وزارة الصحة والسكان المصرية والأمانة العامة للصحة النفسية.',
    explanationEn: 'The message matches official announcements issued by the Egyptian Ministry of Health and Population and GSMH.',
    evidence: [
      {
        title: 'إعلان وزارة الصحة والسكان المصرية الرسمي',
        titleEn: 'Official Declaration by Egyptian Ministry of Health & Population',
        description: 'الخط الساخن 16328 يعمل رسمياً ويقدم الدعم والمشورة النفسية بإشراف أطباء متخصصين.',
        descriptionEn: 'Hotline 16328 operates continuously providing guidance supervised by certified mental health practitioners.',
        type: 'بيان حكومي رسمي',
        typeEn: 'Official Government Release',
      },
    ],
    sources: [
      {
        name: 'الأمانة العامة للصحة النفسية وعلاج الإدمان (مصر)',
        nameEn: 'General Secretariat of Mental Health & Addiction Treatment (Egypt)',
        type: 'جهة صحية حكومية',
        typeEn: 'Governmental Health Authority',
        status: 'مصدر داعم رسمي',
        statusEn: 'Official Supporting Source',
        relevance: 'الجهة المشغلة للخدمة وللخط الساخن 16328.',
        relevanceEn: 'Operating authority of the hotline and accredited clinical service.',
      },
    ],
  },
  {
    id: 'claim-105',
    title: 'رسائل متداولة تزعم إغلاق مراكز الدعم النفسي الجامعية خلال فترة الامتحانات',
    titleEn: 'Viral posts allege university psychological guidance centers suspend operations during exam periods',
    claimText: 'منشورات على صفحات طلابية تزعم توقف وحدات الدعم والإرشاد النفسي بالجامعات عن استقبال الطلاب في فترات ضغط الامتحانات.',
    claimTextEn: 'Posts on student forums claim university counseling units halt student intake during high-stress exam periods.',
    status: 'unverified',
    confidenceScore: 'منخفض (لا توجد قرارات أو وثائق رسمية)',
    confidenceScoreEn: 'Low (absence of official records or institutional notices)',
    sourceOrigin: 'صفحات ومجموعات طلابية غير رسمية',
    sourceOriginEn: 'Unofficial student forums and social pages',
    publishedAt: 'منذ 3 ساعات',
    publishedAtEn: '3 hours ago',
    updatedAt: 'اليوم، 05:00 م',
    updatedAtEn: 'Today, 05:00 PM',
    summary: 'لا توجد أي قرارات رسمية تؤيد هذا الادعاء، وتواصل الجامعات تقديم خدمات الإرشاد النفسي بشكل معتاد.',
    summaryEn: 'No administrative notices support this claim; university guidance centers continue normal scheduling for enrolled students.',
    indicators: [
      'نقص المصادر المعتمدة',
      'مصدر النشر الأساسي غير واضح',
      'معلومات يصعب التحقق منها ميدانياً',
    ],
    indicatorsEn: [
      'Lack of verified sources',
      'Primary publishing origin unclear',
      'Difficult to verify empirically',
    ],
    explanation: 'تعتمد هذه المنشورات على شائعات شفهية دون الاستناد إلى أي تعميمات صادرة عن إدارات الجامعات أو وحدات الرعاية الصحية التابعة لها.',
    explanationEn: 'The rumor relies on ungrounded anecdotal chatter without referencing university administration or health unit memos.',
    evidence: [],
    sources: [],
  },
];

/**
 * Helper to resolve localized text on a claim
 */
export function resolveClaimText(claim, field, lang = 'ar') {
  if (!claim) return '';
  if (lang === 'en') {
    const enField = `${field}En`;
    if (claim[enField]) return claim[enField];
  }
  return claim[field] || '';
}

/**
 * Helper to resolve status metadata
 */
export function getStatusMeta(statusKey, lang = 'ar') {
  const meta = VERIFICATION_STATUSES[statusKey] || {
    label: statusKey,
    labelEn: statusKey,
    badgeVariant: 'default',
    description: '',
    descriptionEn: '',
  };

  return {
    ...meta,
    label: lang === 'en' ? meta.labelEn : meta.label,
    description: lang === 'en' ? meta.descriptionEn : meta.description,
  };
}
