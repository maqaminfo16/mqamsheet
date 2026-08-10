import React from 'react';

export interface StepperProps {
  steps: string[];
  currentStep: number;
}

export function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: '24px' }}>
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;
        
        return (
          <React.Fragment key={index}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', zIndex: 1 }}>
              <div 
                style={{ 
                  width: '32px', height: '32px', 
                  borderRadius: '50%', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  backgroundColor: isActive || isCompleted ? 'var(--accent-primary)' : 'var(--border)',
                  color: isActive || isCompleted ? '#fff' : 'var(--text-muted)',
                  fontWeight: 600,
                  transition: 'all 0.3s'
                }}
              >
                {isCompleted ? '✓' : index + 1}
              </div>
              <span style={{ fontSize: '0.85rem', color: isActive ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: isActive ? 600 : 400 }}>
                {step}
              </span>
            </div>
            
            {index < steps.length - 1 && (
              <div style={{ flex: 1, height: '2px', backgroundColor: isCompleted ? 'var(--accent-primary)' : 'var(--border)', margin: '0 12px', marginTop: '-20px', transition: 'all 0.3s' }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
