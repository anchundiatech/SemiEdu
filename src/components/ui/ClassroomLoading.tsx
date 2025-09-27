'use client';

import { BookOpen, Users, ClipboardList, BarChart3 } from 'lucide-react';

interface ClassroomLoadingProps {
  message?: string;
  showSteps?: boolean;
}

export default function ClassroomLoading({
  message = "Conectando con Google Classroom...",
  showSteps = true
}: ClassroomLoadingProps) {
  const steps = [
    { icon: BookOpen, text: "Obteniendo cursos", completed: true },
    { icon: Users, text: "Cargando estudiantes", completed: false },
    { icon: ClipboardList, text: "Sincronizando tareas", completed: false },
    { icon: BarChart3, text: "Preparando estadísticas", completed: false }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-6">
        {/* Logo y título */}
        <div className="flex items-center justify-center mb-8">
          <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center shadow-xl">
            <BookOpen className="w-10 h-10 text-white" />
          </div>
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-2">SemiEdu</h1>
        <p className="text-gray-600 mb-8">{message}</p>

        {/* Spinner principal */}
        <div className="mb-8">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Pasos de carga */}
        {showSteps && (
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center justify-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step.completed
                    ? 'bg-green-100 text-green-600'
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  <step.icon className="w-4 h-4" />
                </div>
                <span className={`text-sm ${
                  step.completed ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {step.text}
                </span>
                {step.completed && (
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Mensaje de progreso */}
        <div className="mt-8">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Sincronizando datos...</p>
        </div>
      </div>
    </div>
  );
}

