/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { GradeLevel } from './types';
import { Navbar } from './components/Navbar';
import { GradeSelection } from './components/GradeSelection';
import { SubjectDashboard } from './components/SubjectDashboard';

const STORAGE_KEY = 'ai_homework_buddy_selected_grade';

export default function App() {
  // Screen state: 'grade-selection' or 'subject-dashboard'
  const [currentScreen, setCurrentScreen] = useState<'grade-selection' | 'subject-dashboard'>('grade-selection');

  // Currently selected grade: null initially or loaded from localStorage if valid
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const num = parseInt(saved, 10);
        if (num >= 1 && num <= 6) {
          return num as GradeLevel;
        }
      }
    } catch {
      // ignore storage errors
    }
    return null;
  });

  // Active tab in Subject Dashboard
  const [activeDashboardTab, setActiveDashboardTab] = useState<string>('subjects');

  // Sync to localStorage whenever selectedGrade changes
  const handleSelectGrade = (grade: GradeLevel) => {
    setSelectedGrade(grade);
    try {
      localStorage.setItem(STORAGE_KEY, grade.toString());
    } catch {
      // ignore storage errors
    }
  };

  // Continue button handler
  const handleContinue = () => {
    if (selectedGrade) {
      setCurrentScreen('subject-dashboard');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Back to grade selection
  const handleOpenGradeSelection = () => {
    setCurrentScreen('grade-selection');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Universal Top Bar */}
      <Navbar
        currentScreen={currentScreen}
        selectedGrade={selectedGrade}
        onOpenGradeSelection={handleOpenGradeSelection}
        activeTab={activeDashboardTab}
        onSelectTab={setActiveDashboardTab}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full flex flex-col">
        {currentScreen === 'grade-selection' ? (
          <GradeSelection
            selectedGrade={selectedGrade}
            onSelectGrade={handleSelectGrade}
            onContinue={handleContinue}
          />
        ) : selectedGrade ? (
          <SubjectDashboard
            grade={selectedGrade}
            onChangeGrade={handleOpenGradeSelection}
            activeTab={activeDashboardTab}
            onSelectTab={setActiveDashboardTab}
          />
        ) : null}
      </main>

      {/* Discreet Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 px-4 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 AI Homework Buddy PH · Designed for Batang Pinoy Elementary Learners</p>
          <div className="flex items-center gap-3 text-slate-400">
            <span>DepEd K-12 Elementary</span>
            <span>·</span>
            <span>Baitang 1–6</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
