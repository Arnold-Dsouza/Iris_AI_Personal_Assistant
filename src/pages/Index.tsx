
import VoiceAssistant from '@/components/VoiceAssistant';
import DiagnosticsPanel from '@/components/DiagnosticsPanel';

const Index = () => {
  return (
    <div className="min-h-screen w-full bg-background">
      <DiagnosticsPanel />
      <VoiceAssistant />
      
      {/* Invisible info message for screen readers only */}
      <div className="sr-only">
        <h1>Iris Voice Assistant</h1>
        <p>
          Say "Hey Iris" to activate. Works in English and Lebanese Arabic.
          Say "Speak Arabic" to switch to Arabic, or "تكلم إنجليزي" to switch to English.
        </p>
      </div>
    </div>
  );
};

export default Index;
