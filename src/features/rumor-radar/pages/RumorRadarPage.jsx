import { useState } from 'react';
import { motion } from 'framer-motion';
import { RadarHero } from '../components/RadarHero';
import { RadarOverview } from '../components/RadarOverview';
import { ClaimVerificationInput } from '../components/ClaimVerificationInput';
import { ClaimComparisonFlow } from '../components/ClaimComparisonFlow';
import { RadarFeed } from '../components/RadarFeed';
import { RadarDisclaimer } from '../components/RadarDisclaimer';
import { ClaimDetailModal } from '../components/ClaimDetailModal';
import { initialMonitoredClaims } from '../data/radarData';
import { fadeUp, safeMotion } from '@/lib/motion';

/**
 * Rumor & Misinformation Radar Page
 * Dedicated SALAM product section for monitoring unverified or suspicious claims,
 * understanding verification confidence, inspecting sources, and testing claims.
 */
export function RumorRadarPage() {
  const [claimsList, setClaimsList] = useState(initialMonitoredClaims);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSelectClaim = (claim) => {
    setSelectedClaim(claim);
    setIsModalOpen(true);
  };

  const handleNewAnalysisResult = (newClaim) => {
    // Optionally prepend verified claim to current feed for immediate inspection
    const claimWithId = {
      ...newClaim,
      id: `claim-${Date.now()}`,
      title: newClaim.claimText.slice(0, 60) + '...',
      titleEn: (newClaim.claimTextEn || newClaim.claimText).slice(0, 60) + '...',
      sourceOrigin: 'إدخال المستخدم اللحظي (فحص مباشر)',
      sourceOriginEn: 'User live input (direct inspection)',
      publishedAt: 'الآن',
      publishedAtEn: 'Just now',
      updatedAt: 'الآن',
      updatedAtEn: 'Just now',
      summary: newClaim.explanation,
      summaryEn: newClaim.explanationEn || newClaim.explanation,
    };
    setClaimsList((prev) => [claimWithId, ...prev]);
  };

  return (
    <div className="py-10 sm:py-16 bg-surface-bg min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        {/* 1. Hero & Trust Positioning */}
        <RadarHero />

        {/* 2. Aggregate Status Radar Overview */}
        <motion.div {...safeMotion(fadeUp)}>
          <RadarOverview claims={claimsList} />
        </motion.div>

        {/* 3. Interactive Claim Search & Input Area */}
        <motion.div {...safeMotion(fadeUp)}>
          <ClaimVerificationInput onAnalysisResult={handleNewAnalysisResult} />
        </motion.div>

        {/* 4. Claim vs Evidence Methodology Visual Flow */}
        <motion.div {...safeMotion(fadeUp)}>
          <ClaimComparisonFlow />
        </motion.div>

        {/* 5. Main Monitored Claims Radar Feed */}
        <motion.div {...safeMotion(fadeUp)}>
          <RadarFeed claims={claimsList} onSelectClaim={handleSelectClaim} />
        </motion.div>

        {/* 6. Non-Alarmist Trust Notice */}
        <motion.div {...safeMotion(fadeUp)}>
          <RadarDisclaimer />
        </motion.div>

        {/* 7. Modal Dossier View */}
        <ClaimDetailModal
          claim={selectedClaim}
          open={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedClaim(null);
          }}
        />
      </div>
    </div>
  );
}
