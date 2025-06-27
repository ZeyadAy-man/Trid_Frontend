import React, { useState, useEffect, useRef } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';

const VoiceAssistant = () => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversation, setConversation] = useState([]);
  const groupRef = useRef();

  const ELEVENLABS_API_KEY = 'sk_2fc7aca39c4ec0fe92fba7f62e1ce53ebbd8932ba827d9e5';
  const OPENROUTER_API_KEY = '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';

  const { scene, animations } = useGLTF('../../Assets/3D_Models/Lady/scene1.glb');
  const { actions, names } = useAnimations(animations, groupRef);

  useEffect(() => {
    if (!actions || !names) return;
    const idleAction = actions.Idle || actions[names[0]];
    const talkAction = actions.Talk || actions[names[1]] || actions[names[0]];
    if (isListening || isProcessing) {
      idleAction?.fadeOut(0.3);
      talkAction?.reset().fadeIn(0.3).play();
    } else {
      talkAction?.fadeOut(0.3);
      idleAction?.reset().fadeIn(0.3).play();
    }
    return () => {
      names.forEach(name => actions[name]?.stop());
    };
  }, [isListening, isProcessing, actions, names]);

  const queryAI = async (inputText) => {
    setIsProcessing(true);
    try {
      const messages = [
        {
          role: "system",
          content: `أنتِ مساعدة ذكية داخل متجر شنط فاخر في مول TriD. أجيبي باحترافية وود، وساعدي العميل في اختيار وتنسيق الشنط والإجابة على الاستفسارات. إليك محتوى المتجر:

👜 الرف العلوي يسار:
- Christian DIOR (بيج كبير) - $1100
- DIOR (رمادي متداخل كبير) - $1200
- DIOR (أحمر وأسود كبير) - $1550

👜 الرف السفلي يسار:
- Hermes (رمادي متداخل كبير) - $970
- Rose Bag (أحمر مع نمور كبير) - $1000
- DIOR (بني كبير) - $1200
- DIOR (أحمر وأسود كبير) - $1500

👜 الترابيزة على اليمين:
- GUCCI (رمادي متداخل كبير) - $1700
- Prada (أحمر مع نمور كبير) - $1400
- Christian DIOR (بيج كبير) - $1100

👜 الترابيزة أمامك:
- Flower bag (أخضر وأبيض وردي صغير) - $920
- Dior (أزرق صغير) - $1200
- Louis Vuitton (أحمر صغير) - $1400

🏬 أقسام أخرى:
- أحذية: الطابق الثاني
- ملابس: الطابق الأول
- رياضة: الطابق الثالث

🎨 نصائح تنسيق:
- البليزر الأسود يليق عليه جزمة سوداء أكثر من البني
- الفستان البيج يناسبه شنطة رمادية أو وردية

دائمًا كوني ودودة، مختصرة، واحترافية.`
        },
        ...conversation.map(msg => ({
          role: msg.speaker === 'user' ? 'user' : 'assistant',
          content: msg.text
        })),
        {
          role: "user",
          content: inputText
        }
      ];

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "openai/gpt-3.5-turbo",
          messages: messages,
          temperature: 0.7,
          max_tokens: 200
        })
      });

      const result = await response.json();
      return result.choices?.[0]?.message?.content || "لم أتمكن من الفهم تمامًا، هل يمكنك التوضيح؟";
    } catch (error) {
      console.error("OpenRouter Error:", error);
      return "عذرًا، حدث خطأ أثناء الاتصال بالذكاء الاصطناعي.";
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleRecording = async () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("المتصفح لا يدعم التعرف الصوتي");
      return;
    }
    if (isListening) {
      setIsListening(false);
      return;
    }
    setIsListening(true);
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = 'ar-SA';
    recognition.interimResults = false;

    recognition.onresult = async (event) => {
      const userText = event.results[0][0].transcript;
      setConversation(prev => [...prev, { text: userText, speaker: 'user' }]);
      const aiResponse = await queryAI(userText);
      setConversation(prev => [...prev, { text: aiResponse, speaker: 'ai' }]);
      await speakWithElevenLabs(aiResponse);
    };

    recognition.onerror = (event) => {
      console.error("Recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const speakWithElevenLabs = async (text) => {
    try {
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM`, {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: text,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75
          }
        })
      });

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
      audio.onended = () => URL.revokeObjectURL(audioUrl);
    } catch (error) {
      console.error("ElevenLabs Error:", error);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ar-SA';
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <group
      ref={groupRef}
      position={[1, 0.3, 0.6]}
      rotation={[0, Math.PI, 0]}
      scale={[0.5, 0.5, 0.5]}
      onClick={toggleRecording}
    >
      <primitive object={scene} />
      {isListening && (
        <mesh position={[0, 1.5, 0]}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshBasicMaterial color="red" />
        </mesh>
      )}
      {isProcessing && (
        <mesh position={[0, 1.8, 0]}>
          <boxGeometry args={[0.2, 0.2, 0.2]} />
          <meshBasicMaterial color="yellow" />
        </mesh>
      )}
    </group>
  );
};

export default VoiceAssistant;
