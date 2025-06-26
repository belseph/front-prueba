import React from 'react';
import { Lightbulb, Users, Target, Sparkles, ChevronDown } from 'lucide-react';
import type { AuthMode } from '../types/auth';

interface MobileInfoBannerProps {
  authMode: AuthMode;
  isExpanded: boolean;
  onToggle: () => void;
}

export const MobileInfoBanner: React.FC<MobileInfoBannerProps> = ({ 
  authMode, 
  isExpanded, 
  onToggle 
}) => {
  return (
    <div className="lg:hidden mb-6">
      {/* Banner compacto */}
      <div 
        onClick={onToggle}
        className={`cursor-pointer rounded-2xl p-4 border border-white/20 transition-all duration-300 ${
          authMode === 'register'
            ? 'bg-gradient-to-r from-emerald-500/20 via-teal-600/20 to-cyan-700/20'
            : 'bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-indigo-700/20'
        } ${isExpanded ? 'mb-4' : ''}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-xl backdrop-blur-sm ${
              authMode === 'register' 
                ? 'bg-emerald-500/30' 
                : 'bg-purple-500/30'
            }`}>
              <Lightbulb className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">SkillLink</h3>
              <p className="text-white/80 text-sm">
                {authMode === 'register' 
                  ? 'Únete a la revolución emprendedora' 
                  : 'Transforma tus ideas en realidad'
                }
              </p>
            </div>
          </div>
          
          <ChevronDown className={`w-5 h-5 text-white/70 transition-transform duration-300 ${
            isExpanded ? 'rotate-180' : ''
          }`} />
        </div>
      </div>

      {/* Contenido expandido */}
      <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
        isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className={`rounded-2xl p-6 border border-white/20 ${
          authMode === 'register'
            ? 'bg-gradient-to-br from-emerald-500/10 via-teal-600/10 to-cyan-700/10'
            : 'bg-gradient-to-br from-purple-600/10 via-blue-600/10 to-indigo-700/10'
        }`}>
          <div className="space-y-4">
            <p className="text-white/90 text-sm leading-relaxed">
              {authMode === 'register' 
                ? 'Forma parte de una comunidad de innovadores que están cambiando el mundo con sus ideas.'
                : 'Conecta con mentores, forma equipos y valida tu MVP en nuestra incubadora de ideas innovadoras.'
              }
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center text-white/90">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${
                  authMode === 'register' ? 'bg-cyan-500/20' : 'bg-yellow-500/20'
                }`}>
                  <Users className={`w-4 h-4 ${
                    authMode === 'register' ? 'text-cyan-300' : 'text-yellow-300'
                  }`} />
                </div>
                <span className="text-sm">
                  {authMode === 'register' ? 'Conecta con emprendedores afines' : 'Forma equipos por idea de negocio'}
                </span>
              </div>
              
              <div className="flex items-center text-white/90">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${
                  authMode === 'register' ? 'bg-cyan-500/20' : 'bg-yellow-500/20'
                }`}>
                  <Target className={`w-4 h-4 ${
                    authMode === 'register' ? 'text-cyan-300' : 'text-yellow-300'
                  }`} />
                </div>
                <span className="text-sm">
                  {authMode === 'register' ? 'Acceso a mentores expertos' : 'Mentorías especializadas'}
                </span>
              </div>
              
              <div className="flex items-center text-white/90">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${
                  authMode === 'register' ? 'bg-cyan-500/20' : 'bg-yellow-500/20'
                }`}>
                  <Sparkles className={`w-4 h-4 ${
                    authMode === 'register' ? 'text-cyan-300' : 'text-yellow-300'
                  }`} />
                </div>
                <span className="text-sm">
                  {authMode === 'register' ? 'Valida tu MVP con la comunidad' : 'Feedback de inversores simulados'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};