import React, { useState, useEffect } from 'react';
import { GraduationCap, AlertCircle, CheckCircle2, XCircle, RotateCcw, Calculator } from 'lucide-react';
import { AnalysisInput, AnalysisResult } from './types';
import { analyzeEligibility, parseSemesterString } from './utils/semesterLogic';
import { InputGroup } from './components/InputGroup';

const App: React.FC = () => {
  // State
  const [studentId, setStudentId] = useState('');
  const [isCancelled, setIsCancelled] = useState<string>('no'); // 'yes' or 'no'
  const [isSameCourse, setIsSameCourse] = useState<string>('yes'); 
  
  // Semester inputs as strings "YYYY.X"
  const [currentSemStr, setCurrentSemStr] = useState<string>('');
  const [lastSemStr, setLastSemStr] = useState<string>('');

  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize current semester suggestion
  useEffect(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const period = month > 6 ? 2 : 1;
    setCurrentSemStr(`${year}.${period}`);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    // Validation
    const currentSem = parseSemesterString(currentSemStr);
    const lastSem = parseSemesterString(lastSemStr);

    if (!studentId.trim()) {
      setError("Por favor, insira a matrícula do aluno.");
      return;
    }
    if (!currentSem) {
      setError("Semestre atual inválido. Use o formato AAAA.P (ex: 2024.1)");
      return;
    }
    if (!lastSem) {
      setError("Último semestre inválido. Use o formato AAAA.P (ex: 2023.2)");
      return;
    }

    const inputData: AnalysisInput = {
      studentId,
      isCancelled: isCancelled === 'yes',
      currentSemester: currentSem,
      lastActiveSemester: lastSem,
      isSameCourse: isSameCourse === 'yes'
    };

    const analysis = analyzeEligibility(inputData);
    setResult(analysis);
  };

  const handleClear = () => {
    setStudentId('');
    setIsCancelled('no');
    setIsSameCourse('yes');
    setLastSemStr('');
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-primary/10 flex items-center justify-center rounded-full mb-4">
            <GraduationCap className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Validador de Retorno ao Curso
          </h1>
          <p className="mt-2 text-slate-600">
            Verifique a elegibilidade do aluno com base nas regras de afastamento e matrícula.
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-slate-200">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-slate-500" />
            <h2 className="text-lg font-medium text-slate-800">Dados da Solicitação</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
            
            {/* Row 1: ID */}
            <div className="grid grid-cols-1 gap-6">
              <InputGroup label="Matrícula do Aluno">
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="Ex: 20210054"
                  className="block w-full rounded-lg border-slate-300 bg-white border px-3 py-2 text-slate-900 focus:border-primary focus:ring-primary sm:text-sm shadow-sm transition-all"
                />
              </InputGroup>
            </div>

            {/* Row 2: Semesters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <InputGroup label="Último Semestre com Vínculo (Ativo/Trancado)">
                <input
                  type="text"
                  maxLength={6}
                  value={lastSemStr}
                  onChange={(e) => setLastSemStr(e.target.value.replace(/[^0-9.]/g, ''))}
                  placeholder="AAAA.P (Ex: 2023.2)"
                  className="block w-full rounded-lg border-slate-300 bg-white border px-3 py-2 text-slate-900 focus:border-primary focus:ring-primary sm:text-sm shadow-sm transition-all"
                />
                <p className="text-xs text-slate-500 mt-1">O semestre do último status "Matriculado" ou "Trancado".</p>
              </InputGroup>

              <InputGroup label="Semestre Letivo Atual (Retorno)">
                <input
                  type="text"
                  maxLength={6}
                  value={currentSemStr}
                  onChange={(e) => setCurrentSemStr(e.target.value.replace(/[^0-9.]/g, ''))}
                  placeholder="AAAA.P (Ex: 2025.1)"
                  className="block w-full rounded-lg border-slate-300 bg-white border px-3 py-2 text-slate-900 focus:border-primary focus:ring-primary sm:text-sm shadow-sm transition-all"
                />
                <p className="text-xs text-slate-500 mt-1">Semestre para o qual o aluno deseja retornar.</p>
              </InputGroup>
            </div>

             {/* Row 3: Is Cancelled */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <span className="block text-sm font-semibold text-slate-700 mb-2">
                A matrícula está cancelada?
              </span>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="isCancelled"
                    value="yes"
                    checked={isCancelled === 'yes'}
                    onChange={(e) => setIsCancelled(e.target.value)}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                  />
                  <span className="text-slate-700">Sim</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="isCancelled"
                    value="no"
                    checked={isCancelled === 'no'}
                    onChange={(e) => setIsCancelled(e.target.value)}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                  />
                  <span className="text-slate-700">Não</span>
                </label>
              </div>
            </div>

            {/* Row 4: Same Course */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <span className="block text-sm font-semibold text-slate-700 mb-2">
                O retorno é para o mesmo curso?
              </span>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="sameCourse"
                    value="yes"
                    checked={isSameCourse === 'yes'}
                    onChange={(e) => setIsSameCourse(e.target.value)}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                  />
                  <span className="text-slate-700">Sim, mesmo curso</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="sameCourse"
                    value="no"
                    checked={isSameCourse === 'no'}
                    onChange={(e) => setIsSameCourse(e.target.value)}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                  />
                  <span className="text-slate-700">Não, curso diferente</span>
                </label>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-start gap-3 border border-red-100">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 bg-primary hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg shadow-md transition-colors flex items-center justify-center gap-2"
              >
                <Calculator className="w-4 h-4" />
                Validar Enquadramento
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="bg-white hover:bg-slate-50 text-slate-700 font-semibold py-2.5 px-4 rounded-lg border border-slate-300 shadow-sm transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Limpar
              </button>
            </div>
          </form>
        </div>

        {/* Result Section */}
        {result && (
          <div className={`shadow-xl rounded-2xl overflow-hidden border-2 animate-fade-in transition-all duration-300 ${
            result.isEligible 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="p-6 md:p-8">
              <div className="flex items-start gap-4">
                <div className={`flex-shrink-0 p-3 rounded-full ${
                  result.isEligible ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {result.isEligible ? (
                    <CheckCircle2 className={`w-8 h-8 ${result.isEligible ? 'text-green-600' : 'text-red-600'}`} />
                  ) : (
                    <XCircle className={`w-8 h-8 ${result.isEligible ? 'text-green-600' : 'text-red-600'}`} />
                  )}
                </div>
                
                <div className="flex-1">
                  <h3 className={`text-xl font-bold mb-2 ${
                    result.isEligible ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {result.isEligible ? 'É RETORNO AO CURSO' : 'NÃO É RETORNO AO CURSO'}
                  </h3>
                  
                  <div className={`prose prose-sm max-w-none ${
                     result.isEligible ? 'text-green-700' : 'text-red-700'
                  }`}>
                    <p className="font-medium text-lg leading-relaxed mb-4">
                      {result.justification}
                    </p>
                    
                    <div className="bg-white/60 rounded-lg p-4 mt-4 border border-black/5">
                      <h4 className="text-sm font-bold uppercase tracking-wider opacity-70 mb-2">Resumo da Análise</h4>
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        <li>
                          <strong>Matrícula:</strong> {studentId}
                        </li>
                         <li>
                          <strong>Matrícula Cancelada:</strong> {isCancelled === 'yes' ? 'Sim' : 'Não'}
                        </li>
                         <li>
                          <strong>Vínculo:</strong> {isSameCourse === 'yes' ? 'Mesmo Curso' : 'Curso Diferente'}
                        </li>
                        <li>
                          <strong>Intervalo de Afastamento:</strong> {result.gapSemesters} Semestres
                        </li>
                        <li>
                          <strong>Período:</strong> {result.gapIntervalStart} <span className="opacity-50 mx-1">➜</span> {result.gapIntervalEnd}
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;