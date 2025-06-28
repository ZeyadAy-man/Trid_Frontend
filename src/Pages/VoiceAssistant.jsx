import React, { useState, useEffect, useRef } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import { apimessage } from "../Service/APIService";

const VoiceAssistant = () => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversation, setConversation] = useState([]);
  const groupRef = useRef();

  const ELEVENLABS_API_KEY = "sk_b2c6031f634eb186cdea1f84e4430e0c50f6a01dbef46c10";

  const { scene, animations } = useGLTF(
    "../../Assets/3D_Models/Lady/scene1.glb"
  );
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
      names.forEach((name) => actions[name]?.stop());
    };
  }, [isListening, isProcessing, actions, names]);

  const queryAI = async (inputText) => {
    setIsProcessing(true);
    try {
      console.log("Back:", inputText);
      const res = await apimessage(inputText);
      console.log("AI Response:", res?.data);
      return res?.data || "عذرًا، لم يتم فهم الرد.";
    } catch (error) {
      console.error("AI Error:", error);
      return "عذرًا، حدث خطأ أثناء الاتصال بالذكاء الاصطناعي.";
    } finally {
      setIsProcessing(false);
    }
  };

  const speakWithElevenLabs = async (text) => {
    console.log("Reading:", text);
    try {
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM`,
        {
          method: "POST",
          headers: {
            "xi-api-key": ELEVENLABS_API_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: text,
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
            },
          }),
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        console.error("ElevenLabs API Error:", errText);
        throw new Error("Voice API failed");
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
      audio.onended = () => URL.revokeObjectURL(audioUrl);
    } catch (error) {
      console.error("ElevenLabs fallback error:", error);
      const fallbackUtterance = new SpeechSynthesisUtterance(text);
      fallbackUtterance.lang = "ar-SA";
      window.speechSynthesis.speak(fallbackUtterance);
    }
  };

  const toggleRecording = async () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("المتصفح لا يدعم التعرف الصوتي");
      return;
    }
    if (isListening) {
      setIsListening(false);
      return;
    }

    setIsListening(true);
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "ar-SA";
    recognition.interimResults = false;

    recognition.onresult = async (event) => {
      const userText = event.results[0][0].transcript;
      setConversation((prev) => [...prev, { text: userText, speaker: "user" }]);
      const aiResponse = await queryAI(userText);
      setConversation((prev) => [...prev, { text: aiResponse, speaker: "ai" }]);
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
